import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

// ── FIELD ERROR STRUCTURE ───────────────────────────────────────────────────
// Stores validation errors for individual form fields
interface FieldErrors {
  email?: string;           // Email validation error
  displayName?: string;     // Display name validation error
  password?: string;        // Password validation error
}

// ── REGISTER PAGE COMPONENT ─────────────────────────────────────────────────
// New user sign-up form with email, display name, and password
// Validates input locally before sending to server
// On success, shows confirmation message and link to login page
// Handles duplicate email errors from backend

export default function RegisterPage() {
  // ── FORM INPUT STATE ────────────────────────────────────────────────────
  const [email, setEmail] = useState('');             // User email
  const [displayName, setDisplayName] = useState(''); // Display name (visible to others)
  const [password, setPassword] = useState('');       // User password

  // ── ERROR STATE ─────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({}); // Per-field validation errors
  const [globalError, setGlobalError] = useState('');  // General error message
  const [success, setSuccess] = useState(false);       // Registration successful
  const [loading, setLoading] = useState(false);       // API call in progress

  // ── FORM VALIDATION ─────────────────────────────────────────────────────
  // Check that all fields are valid before allowing submission
  // Validation rules:
  // - Email: must be valid format (has @, has .)
  // - Display Name: cannot be empty
  // - Password: must be at least 8 characters
  function validate(): boolean {
    const errors: FieldErrors = {};

    // Check email format with regex
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'A valid email address is required.';
    }

    // Check display name is not empty
    if (!displayName.trim()) {
      errors.displayName = 'Display name is required.';
    }

    // Check password length (minimum 8 characters for security)
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    // Store errors to display to user
    setFieldErrors(errors);
    // Return true only if no errors found
    return Object.keys(errors).length === 0;
  }

  // ── FORM SUBMISSION HANDLER ─────────────────────────────────────────────
  // Called when user clicks "Create Account" button
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();  // Prevent page reload
    setGlobalError('');  // Clear previous errors

    // Validate all fields first
    if (!validate()) return;

    // ── MAKE REGISTRATION API CALL ──────────────────────────────────────
    setLoading(true);
    try {
      // POST to server: POST /api/auth/register with { email, displayName, password }
      // Server will hash the password and create user in database
      await api.post('/api/auth/register', { email, displayName, password });
      
      // All good! Show success screen
      setSuccess(true);
    } catch (err: unknown) {
      // Handle registration errors from server
      const status = (err as { response?: { status?: number; data?: { message?: string; errors?: FieldErrors } } })?.response?.status;
      const data = (err as { response?: { data?: { message?: string; errors?: FieldErrors } } })?.response?.data;

      // HTTP 409: Email already registered (conflict)
      if (status === 409) {
        setFieldErrors({ email: 'This email is already registered.' });
      }
      // Server sent specific field errors
      else if (data?.errors) {
        setFieldErrors(data.errors);
      }
      // General error message
      else {
        setGlobalError(data?.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────
  // Show confirmation and link to login after successful registration
  if (success) {
    return (
      <div className="page-container" style={{ maxWidth: 420, paddingTop: 48, paddingBottom: 48 }}>
        <div style={{
          padding: 40,
          background: 'var(--dark-tertiary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
          <h2 style={{ 
            marginTop: 0,
            marginBottom: 12,
            color: 'var(--gold)',
            fontSize: 24,
            fontWeight: 800,
          }}>
            Welcome to Kansal Sales
          </h2>
          <p style={{ 
            color: 'var(--white)',
            fontSize: 15,
            marginBottom: 28,
            lineHeight: 1.6,
          }}>
            Thank you for joining us. Verify your email to get started.
          </p>
          <Link
            to="/login"
            style={{
              background: 'var(--gold)',
              color: 'var(--dark)',
              padding: '12px 32px',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-light)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)';
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // ── RENDER REGISTRATION FORM ────────────────────────────────────────────
  return (
    <div className="page-container" style={{ maxWidth: 420, paddingTop: 48, paddingBottom: 48 }}>
      <div style={{
        padding: 40,
        background: 'var(--dark-tertiary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h1 style={{ 
          marginTop: 0, 
          marginBottom: 8, 
          fontSize: 28,
          color: 'var(--gold)',
          fontWeight: 800,
          letterSpacing: '-0.3px',
        }}>
            Join Kansal Sales
        </h1>
        <p style={{
          margin: '0 0 28px',
          fontSize: 14,
          color: 'var(--gray-400)',
        }}>
          Create your account and explore luxury fashion
        </p>

        {/* Global error message (if registration fails) */}
        {globalError && <div style={{
          padding: '12px 16px',
          marginBottom: 20,
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--error)',
          fontSize: 14,
        }}>
          {globalError}
        </div>}

        {/* Registration form */}
        <form onSubmit={handleSubmit} noValidate>
          
          {/* Email input */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--light-text)',
              marginBottom: 8,
              letterSpacing: '0.2px',
            }}>
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--dark-secondary)',
                color: 'var(--white)',
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            {fieldErrors.email && <span style={{
              display: 'block',
              marginTop: 6,
              color: 'var(--error)',
              fontSize: 13,
              fontWeight: 600,
            }}>
              {fieldErrors.email}
            </span>}
          </div>

          {/* Display name input */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="displayName" style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--light-text)',
              marginBottom: 8,
              letterSpacing: '0.2px',
            }}>
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--dark-secondary)',
                color: 'var(--white)',
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            {fieldErrors.displayName && (
              <span style={{
                display: 'block',
                marginTop: 6,
                color: 'var(--error)',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {fieldErrors.displayName}
              </span>
            )}
          </div>

          {/* Password input */}
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--light-text)',
              marginBottom: 8,
              letterSpacing: '0.2px',
            }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--dark-secondary)',
                color: 'var(--white)',
                fontSize: 14,
                fontFamily: 'inherit',
              }}
            />
            {fieldErrors.password && (
              <span style={{
                display: 'block',
                marginTop: 6,
                color: 'var(--error)',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Submit button — disabled while loading */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: 15,
              fontWeight: 600,
              background: 'var(--gold)',
              color: 'var(--dark)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-light)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        {/* Link to login for existing users */}
        <p style={{ 
          marginTop: 24, 
          textAlign: 'center', 
          fontSize: 14, 
          color: 'var(--gray-400)' 
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: 'var(--gold)',
            textDecoration: 'none',
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
