import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

// ── LOGIN PAGE COMPONENT ────────────────────────────────────────────────────
// User sign-in form with email and password
// Submitting the form calls /api/auth/login with credentials
// On success, updates AuthContext and redirects to admin dashboard or home
// Admin users go to /admin, regular users go to home page

export default function LoginPage() {
  // ── AUTHENTICATION & ROUTING ────────────────────────────────────────────
  const { login } = useAuth();           // Update global auth state after login
  const navigate = useNavigate();         // Navigate to different pages

  // ── FORM STATE ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');        // User email input
  const [password, setPassword] = useState('');  // User password input
  const [error, setError] = useState('');        // Error message to display
  const [loading, setLoading] = useState(false); // Show "Signing in..." during API call

  // ── FORM SUBMISSION HANDLER ─────────────────────────────────────────────
  // Called when user clicks "Sign In" button
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();  // Prevent default form submission/page reload
    setError('');        // Clear previous errors

    // Validate that both fields are filled
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    // ── MAKE LOGIN API CALL ──────────────────────────────────────────────
    setLoading(true);
    try {
      // POST to server: POST /api/auth/login with { email, password }
      // Server verifies credentials and returns user object + JWT cookie
      const res = await api.post('/api/auth/login', { email, password });
      const loggedInUser = res.data.user;  // { id, email, displayName, role }

      // Update AuthContext with logged-in user
      login(loggedInUser);

      // Redirect based on user role:
      // - Admin users → /admin (admin dashboard)
      // - Regular users → / (home page)
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/');
    } catch (err: unknown) {
      // Handle login error - show error message to user
      // Try to get error message from API response, fallback to generic message
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      // Stop loading spinner
      setLoading(false);
    }
  }

  // ── RENDER LOGIN FORM ───────────────────────────────────────────────────
  return (
    <div
      className="page-container"
      style={{ 
        maxWidth: 420, 
        paddingTop: 48,
        paddingBottom: 48,
      }}
    >
      {/* Card container with padding */}
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
          Welcome Back
        </h1>
        <p style={{
          margin: '0 0 28px',
          fontSize: 14,
          color: 'var(--white)',
        }}>
          Sign in to your Zenith Atelier account
        </p>

        {/* Error alert — shown if login fails */}
        {error && <div style={{
          padding: '12px 16px',
          marginBottom: 20,
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid var(--error)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--error)',
          fontSize: 14,
        }}>
          {error}
        </div>}

        {/* Login form */}
        <form onSubmit={handleSubmit} noValidate>
          
          {/* Email input field */}
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
          </div>

          {/* Password input field */}
          <div style={{ marginBottom: 12 }}>
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
              autoComplete="current-password"
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
          </div>

          {/* Forgot password link */}
          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ 
              fontSize: 13, 
              color: 'var(--gold)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}>
              Forgot password?
            </Link>
          </div>

          {/* Sign In button — disabled while loading */}
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
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Link to registration page for new users */}
        <p style={{ 
          marginTop: 24, 
          textAlign: 'center', 
          fontSize: 14, 
          color: 'var(--gray-400)' 
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: 'var(--gold)',
            textDecoration: 'none',
          }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
