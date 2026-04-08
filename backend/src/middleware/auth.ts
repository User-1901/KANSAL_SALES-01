import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ── JWT Configuration ─────────────────────────────────────────────────────────
// JWT_SECRET should ALWAYS be loaded from environment variables in production
// SECURITY WARNING: Never use default secrets in production!
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret';

// ── Authentication Middleware ──────────────────────────────────────────────────
// Verifies JWT token from cookies and attaches user info to request
// Applied to routes that require logged-in users
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.token as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    // SECURITY: jwt.verify throws if token invalid, expired, or tampered
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'user' | 'admin';
    };
    // Attach user to request for downstream handlers
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    // Generic error message prevents token validation leaks
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Admin Authorization Middleware ────────────────────────────────────────────
// Verifies that authenticated user has 'admin' role
// Must be applied AFTER authenticate() middleware
// Returns 403 if user lacks admin privileges
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    // SECURITY: Generic 403 prevents role enumeration attacks
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
