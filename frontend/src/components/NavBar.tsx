import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

// ── NAVIGATION BAR COMPONENT ────────────────────────────────────────────────
// Top sticky header with:
// - Brand logo and name (link to home)
// - Navigation links (Home, Products, Categories, Contact)
// - Shopping cart icon with item count badge
// - User auth section (Login button or user name + Logout button)

export default function NavBar() {
  // ── AUTHENTICATION & ROUTING ────────────────────────────────────────────
  const { user, cartCount, logout } = useAuth();  // Current user, cart items, logout function
  const navigate = useNavigate();  // Navigate to pages after logout

  // ── LOGOUT HANDLER ──────────────────────────────────────────────────────
  // Called when user clicks "Logout" button
  async function handleLogout() {
    try {
      // POST to server to clear session
      await api.post('/api/auth/logout');
    } catch {
      // If API fails, still log out locally
    }
    // Clear auth state and redirect to home
    logout();
    navigate('/');
  }

  // ── RENDER NAVBAR ───────────────────────────────────────────────────────
  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: 'sticky',  // Stay at top when scrolling
        top: 0,
        zIndex: 100,
        background: 'var(--dark-secondary)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.40)',
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
      }}
    >
      {/* ── BRAND LOGO ── */}
      <Link
        to="/"
        style={{
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--gold)',
          marginRight: 'auto',  // Push right side items to right edge
          textDecoration: 'none',
          letterSpacing: '-0.3px',
        }}
      >
        ✨ Zenith Atelier
      </Link>

      {/* ── NAVIGATION LINKS & USER SECTION ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        
        {/* Navigation buttons */}
        {[
          { to: '/', label: 'Home' },
          { to: '/products', label: 'Collections' },
          { to: '/categories', label: 'Categories' },
          { to: '/contact', label: 'Contact' },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--light-text)',
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--light-text)';
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
            }}
          >
            {label}
          </Link>
        ))}

        {/* Shopping Cart icon with badge */}
        <Link
          to="/cart"
          aria-label={`Cart (${cartCount} items)`}
          style={{
            position: 'relative',  // For positioning cart badge
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--light-text)',
            fontWeight: 500,
            fontSize: 14,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)';
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--light-text)';
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
          }}
        >
          🛒 Cart
          
          {/* Cart item count badge — shows only if cartCount > 0 */}
          {cartCount > 0 && (
            <span
              data-testid="cart-badge"
              style={{
                position: 'absolute',  // Placed in top-right corner
                top: 0,
                right: 2,
                background: 'var(--gold)',  // Gold circle - premium theme
                color: 'var(--dark)',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {cartCount}  {/* Number of items in cart */}
            </span>
          )}
        </Link>

        {/* ── USER AUTHENTICATION SECTION ── */}
        {user ? (
          // ── LOGGED-IN USER ──
          <>
            {/* Display user's name */}
            <span
              data-testid="display-name"
              style={{ fontSize: 14, color: 'var(--light-text)', padding: '0 8px' }}
            >
              {user.displayName}
            </span>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              style={{
                fontSize: 14,
                padding: '8px 16px',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '1px solid var(--gold)',
                color: 'var(--gold)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--dark)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212, 175, 55, 0.15)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          // ── GUEST USER (NOT LOGGED IN) ──
          // Show Login button
          <Link
            to="/login"
            style={{
              fontSize: 14,
              padding: '8px 16px',
              background: 'var(--gold)',
              color: 'var(--dark)',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold-light)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--gold)';
            }}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
