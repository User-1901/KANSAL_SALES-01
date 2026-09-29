import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { pool } from '../db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many attempts. Please try again in 15 minutes.' });
  },
});

// ── Constants ──────────────────────────────────────────────────────────────────
// Email validation regex - RFC 5322 simplified
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// SECURITY: bcrypt salt rounds - higher = more secure but slower (10 is standard)
const SALT_ROUNDS = 10;
const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000,
};

// ── POST /register - Create new user account ───────────────────────────────────
// SECURITY: Validates input, checks for duplicates, hashes password with bcrypt
// Returns 201 on success, 400 on validation error, 409 on duplicate email
router.post('/register', async (req: Request, res: Response) => {
  const { email, displayName, password } = req.body as {
    email?: string;
    displayName?: string;
    password?: string;
  };

  // Validate all inputs before database queries
  const errors: Record<string, string> = {};

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.email = 'A valid email address is required.';
  }
  if (!displayName || displayName.trim().length === 0) {
    errors.displayName = 'Display name is required.';
  }
  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
    return;
  }

  // Check for duplicate email - prevent user account duplication
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  // SECURITY: Hash password with bcrypt before storing (never store plain passwords!)
  const passwordHash = await bcrypt.hash(password!, SALT_ROUNDS);
  await pool.query(
    'INSERT INTO users (email, display_name, password_hash) VALUES ($1, $2, $3)',
    [email, displayName!.trim(), passwordHash],
  );

  // Fire-and-forget email verification (don't block registration if email fails)
  sendVerificationEmail(email!, displayName!.trim()).catch(() => {
    console.warn('[AUTH] Registration email failed for:', email);
  });

  res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });
});

// ── POST /login - User authentication ──────────────────────────────────────────
// SECURITY: Rate-limited to prevent brute-force attacks
// Returns 200 + JWT token on success, 401 on authentication failure
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  // Validate required fields
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  // Fetch user from database
  const result = await pool.query(
    'SELECT id, email, display_name, password_hash, role FROM users WHERE email = $1',
    [email],
  );

  const user = result.rows[0] as { id: string; email: string; display_name: string; password_hash: string; role: string } | undefined;

  // SECURITY: Use generic error message to prevent email enumeration attacks
  // Don't reveal if email exists or password is wrong - always say "Invalid email or password"
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // Get JWT secret from environment (required for signing tokens)
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  // SECURITY: Create JWT token with user ID, email, and role - expires in 24 hours
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: '24h' },
  );

  // SECURITY: Set secure cookie with tokens
  // - httpOnly: Can't be accessed from JavaScript (prevents XSS theft)
  // - secure: Only sent over HTTPS (prevents man-in-the-middle)
  // - sameSite: Strict (prevents CSRF attacks)
  res.cookie('token', token, authCookieOptions);

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
    },
  });
});

// ── POST /logout - Clear user session ──────────────────────────────────────────
// Clears the JWT cookie to end user session
router.post('/logout', (_req: Request, res: Response) => {
  // Clear the token cookie with same security settings as login
  res.clearCookie('token', authCookieOptions);
  res.status(200).json({ message: 'Logged out successfully' });
});

// ── POST /forgot-password - Request password reset ────────────────────────────
// SECURITY: Sends reset link via email if account exists
// IMPORTANT: Always returns 200 to prevent account enumeration attacks!
// This prevents attackers from discovering which emails are registered
router.post('/forgot-password', authRateLimit, async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email || !EMAIL_REGEX.test(email)) {
    res.status(400).json({ error: 'A valid email address is required.' });
    return;
  }

  const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  
  // SECURITY: Always return 200 whether email exists or not (prevents account enumeration)
  if (!result.rowCount || result.rowCount === 0) {
    res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    return;
  }

  const userId = result.rows[0].id;
  // SECURITY: Generate cryptographically secure random token (32 bytes = 256 bits)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Valid for 1 hour only

  // SECURITY: Delete old tokens to prevent token reuse/accumulation
  await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt.toISOString()],
  );

  // Construct reset link from frontend URL
  const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
  const resetLink = `${clientOrigin}/reset-password?token=${token}`;

  // Send email asynchronously (don't block response)
  sendPasswordResetEmail(email, resetLink).catch(() => {
    console.warn('[AUTH] Password reset email failed for:', email);
  });

  res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
});

// ── POST /reset-password - Complete password reset ────────────────────────────
// SECURITY: Validates token, checks expiration, updates password with new hash
// Token is single-use to prevent replay attacks
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password || password.length < 8) {
    res.status(400).json({ error: 'Token and a password of at least 8 characters are required.' });
    return;
  }

  const result = await pool.query(
    `SELECT prt.id, prt.user_id, prt.expires_at, prt.used
     FROM password_reset_tokens prt
     WHERE prt.token = $1`,
    [token],
  );

  if (!result.rowCount || result.rowCount === 0) {
    res.status(400).json({ error: 'Invalid or expired reset link.' });
    return;
  }

  const row = result.rows[0] as { id: string; user_id: string; expires_at: string; used: boolean };

  // SECURITY: Check if token is expired OR already used (prevents reuse attacks)
  if (row.used || new Date(row.expires_at as string) < new Date()) {
    res.status(400).json({ error: 'This reset link has expired or already been used.' });
    return;
  }

  // SECURITY: Hash new password before storing
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, row.user_id]);
  // SECURITY: Mark token as used (single-use enforcement)
  await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [row.id]);

  res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
});

// ── GET /me - Get current user session info ────────────────────────────────────
// Requires authentication - returns logged-in user's details
// Used by frontend to check if user is still authenticated
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, role FROM users WHERE id = $1',
      [req.user!.id],
    );

    if (!result.rowCount || result.rowCount === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve user information' });
  }
});

export default router;
