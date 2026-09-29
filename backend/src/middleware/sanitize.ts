import { Request, Response, NextFunction } from 'express';

// ── HTML Entity Escaping for XSS Prevention ────────────────────────────────────
// Fields that must NEVER be sanitized (passwords, tokens are crypto-sensitive)
const SKIP_FIELDS = new Set(['password', 'token', 'newPassword', 'confirmPassword', 'password_hash']);

// SECURITY: Escapes HTML special characters to prevent JavaScript execution
// Example: <script> becomes &lt;script&gt; (rendered as text, not executed)
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')      // & → &amp;
    .replace(/</g, '&lt;')        // < → &lt;
    .replace(/>/g, '&gt;')        // > → &gt;
    .replace(/"/g, '&quot;')       // " → &quot;
    .replace(/'/g, '&#x27;');     // ' → &#x27;
}

// SECURITY: Recursively sanitizes all request data
// - Skips password/token fields (never escape credentials)
// - Escapes strings in all other fields
// - Handles nested objects and arrays
function sanitizeValue(value: unknown, key?: string): unknown {
  // CRITICAL: Never sanitize password fields (bcrypt hashes, JWT tokens)
  if (key && SKIP_FIELDS.has(key)) return value;

  if (typeof value === 'string') return escapeHtml(value);

  if (Array.isArray(value)) return value.map(v => sanitizeValue(v));

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      sanitized[k] = sanitizeValue(v, k);
    }
    return sanitized;
  }
  return value;
}

// ── Express Middleware ─────────────────────────────────────────────────────────
// Applied to all requests to sanitize request body
// Prevents stored/reflected XSS attacks
export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
}
