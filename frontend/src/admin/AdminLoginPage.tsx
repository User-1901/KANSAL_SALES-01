import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in as admin → redirect
  if (user?.role === 'admin') {
    navigate('/admin', { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const loggedInUser = res.data.user;
      if (loggedInUser.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      login(loggedInUser);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Invalid credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--dark-tertiary)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Kansal Sales
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--gold)', letterSpacing: '-0.3px', textShadow: '0 0 12px rgba(255, 107, 53, 0.4)' }}>
            Admin Portal
          </h1>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 14,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--light-text)', marginBottom: 8, letterSpacing: '0.2px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--dark-secondary)',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--white)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = 'var(--gold-light)';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.15)';
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = 'var(--gold)';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--light-text)', marginBottom: 8, letterSpacing: '0.2px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--dark-secondary)',
                border: '1px solid var(--gold)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--white)',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
              }}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = 'var(--gold-light)';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 4px rgba(212, 175, 55, 0.15)';
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = 'var(--gold)';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: loading ? 'rgba(212, 175, 55, 0.5)' : 'var(--gold)',
              color: loading ? 'var(--gray-600)' : 'var(--dark)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
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

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--gray-400)' }}>
          Return to{' '}
          <a href="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>customer store</a>
        </p>
      </div>
    </div>
  );
}
