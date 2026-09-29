import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '📦', end: false },
  { to: '/admin/categories', label: 'Categories', icon: '🏷️', end: false },
  { to: '/admin/inventory', label: 'Inventory', icon: '📈', end: false },
  { to: '/admin/orders', label: 'Orders', icon: '🧾', end: false },
  { to: '/admin/ratings', label: 'Reviews', icon: '⭐', end: false },
  { to: '/admin/users', label: 'Accounts', icon: '👥', end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try { await api.post('/api/auth/logout'); } catch { /* ignore */ }
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="admin-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--dark)' }}>
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar" style={{
        width: 240,
        background: 'var(--navy)',
        borderRight: '1px solid rgba(212, 175, 55, 0.1)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Brand */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
        }}>
          <div style={{ fontSize: 12, color: '#FFFFFF', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
            Admin Panel
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 800, color: 'var(--gold)', letterSpacing: '-0.3px' }}>
            <img src="/uploads/logo.jpeg" alt="Kansal Sales logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 5 }} />
            <span>Kansal Sales</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 4,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--gold-light)' : '#FFFFFF',
                background: isActive ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
                paddingLeft: isActive ? '9px' : '12px',
              })}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <div style={{ fontSize: 12, color: '#FFFFFF', marginBottom: 6, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Signed in as
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName}
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(212, 175, 55, 0.1)',
              color: 'var(--gold)',
              border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { 
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--dark)';
            }}
            onMouseLeave={e => { 
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212, 175, 55, 0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main" style={{ flex: 1, overflow: 'auto', background: 'var(--dark)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
