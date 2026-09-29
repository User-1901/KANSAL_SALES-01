import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);

  useEffect(() => {
    api.get('/api/products').then(r => setProductCount(r.data.length)).catch(() => {});
    api.get('/api/categories').then(r => setCategoryCount(r.data.length)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Products', value: productCount, icon: '📦', link: '/admin/products', color: 'var(--gold)' },
    { label: 'Categories', value: categoryCount, icon: '🏷️', link: '/admin/categories', color: 'var(--gold-light)' },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, color: 'var(--gold)', textShadow: '0 0 12px rgba(255, 107, 53, 0.4)' }}>Dashboard</h1>
      <p style={{ margin: '0 0 32px', color: 'var(--white)', fontSize: 15 }}>Welcome back. Here&apos;s an overview of your store.</p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
        {stats.map(s => (
          <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--dark-tertiary)',
              borderRadius: 12,
              padding: '24px 20px',
              border: '1px solid var(--dark-secondary)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'box-shadow 0.15s, transform 0.15s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value === null ? '—' : s.value}
              </div>
              <div style={{ fontSize: 14, color: 'var(--white)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: 'var(--gold)', textShadow: '0 0 10px rgba(255, 107, 53, 0.3)' }}>Quick Actions</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/admin/products" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: 'var(--gold)', color: 'var(--dark)',
          borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none',
        }}>
          📦 Manage Products
        </Link>
        <Link to="/admin/categories" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: 'var(--gold-dark)', color: 'var(--white)',
          borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none',
        }}>
          🏷️ Manage Categories
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: 'var(--dark-secondary)', color: 'var(--white)',
          border: '1px solid var(--dark-secondary)',
          borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none',
        }}>
          🌐 View Store ↗
        </a>
      </div>
    </div>
  );
}
