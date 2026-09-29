import nodemailer from 'nodemailer';

// ── Email Configuration ────────────────────────────────────────────────────────
// SMTP configuration for sending transactional emails (verification, password reset, etc.)
// Environment variables REQUIRED: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
const smtpPort = Number(process.env.SMTP_PORT ?? 587);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  // Port 465 uses implicit TLS; ports such as 587 negotiate STARTTLS.
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Email template: Account Verification ────────────────────────────────────────
// Sent when new user registers - they must verify email to activate account
export async function sendVerificationEmail(to: string, displayName: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Welcome to Kansal Sales - Verify Your Account',
      text: `Hi ${displayName},\n\nThank you for registering with Kansal Sales. Please verify your email address to activate your account.\n\nBest regards,\nKansal Sales Team`,
      html: `
        <p>Hi ${displayName},</p>
        <p>Thank you for registering with <strong>Kansal Sales</strong>.</p>
        <p>Please verify your email address to activate your account and enjoy our premium collection.</p>
        <p>Best regards,<br>Kansal Sales Team</p>
      `,
    });
  } catch (error) {
    // SECURITY: Log error but don't expose SMTP details to client
    console.error('[EMAIL] Verification email failed for:', to);
    throw new Error('Failed to send verification email');
  }
}

// ── Email template: Contact Form Response ──────────────────────────────────────
// Sent when customer submits contact form - forwarded to support team
export async function sendContactEmail(name: string, email: string, message: string): Promise<void> {
  // SECURITY: Sanitize input to prevent HTML injection in email
  const sanitizedName = String(name).replace(/[<>]/g, '');
  const sanitizedMessage = String(message).replace(/[<>]/g, '');
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      replyTo: email, // Allows direct reply to customer
      subject: `New contact message from ${sanitizedName}`,
      text: `Name: ${sanitizedName}\nEmail: ${email}\n\nMessage:\n${sanitizedMessage}`,
      html: `<p><strong>Name:</strong> ${sanitizedName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${sanitizedMessage}</p>`,
    });
  } catch (error) {
    console.error('[EMAIL] Contact email failed');
    throw new Error('Failed to send contact email');
  }
}

// ── Email template: Password Reset ─────────────────────────────────────────────
// Sent when user requests password reset - link valid for 1 hour only (security measure)
export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Reset Your Kansal Sales Password',
      text: `You requested a password reset.\n\nClick the link below to reset your password (valid for 1 hour):\n${resetLink}\n\nIf you did not request this, ignore this email.\n\nKansal Sales Security Team`,
      html: `
        <p>You requested a password reset.</p>
        <p>Click the button below to reset your password. This link is valid for <strong>1 hour only</strong>.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#0F1419;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
        <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
        <p><strong>Security Notice:</strong> If you did not request this, you can safely ignore this email.</p>
        <p>Kansal Sales Security Team</p>
      `,
    });
  } catch (error) {
    console.error('[EMAIL] Password reset email failed for:', to);
    throw new Error('Failed to send password reset email');
  }
}
