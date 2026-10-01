import { Link } from 'react-router-dom';

const legalLinks = [
  { to: '/terms', label: 'Terms & Conditions' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/refund-policy', label: 'Refund, Return & Cancellation' },
  { to: '/shipping-policy', label: 'Shipping & Delivery' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--navy)', color: '#FFFFFF', borderTop: '2px solid var(--gold)', marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
        <div>
          <h2 style={{ margin: '0 0 8px', color: 'var(--gold)', fontSize: 20 }}>Kansal Sales</h2>
          <p style={{ margin: 0, color: '#D7E6F4', fontSize: 14 }}>Fresh groceries and everyday essentials delivered in Chandigarh.</p>
        </div>
        <div>
          <h2 style={{ margin: '0 0 12px', color: 'var(--gold)', fontSize: 16 }}>Legal</h2>
          <nav aria-label="Legal links" style={{ display: 'grid', gap: 7 }}>
            {legalLinks.map(link => (
              <Link key={link.to} to={link.to} style={{ color: '#FFFFFF', fontSize: 13 }}>{link.label}</Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 style={{ margin: '0 0 12px', color: 'var(--gold)', fontSize: 16 }}>Contact</h2>
          <address style={{ margin: 0, color: '#D7E6F4', fontSize: 13, fontStyle: 'normal', lineHeight: 1.6 }}>
            Shop - 16, G. F., Shalimar Enclave, Dhakoli, Zirakpur,<br />
            SAS Nagar Mohali - 160104, Punjab
          </address>
          <a href="mailto:aradhyastoredhakoli@gmail.com" style={{ display: 'block', marginTop: 7, color: '#FFFFFF', fontSize: 13 }}>
            aradhyastoredhakoli@gmail.com
          </a>
          <a href="tel:9988997117" style={{ display: 'block', marginTop: 4, color: '#FFFFFF', fontSize: 13 }}>
            Phone / WhatsApp: 9988997117
          </a>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.16)', color: '#D7E6F4', fontSize: 12 }}>
        © {new Date().getFullYear()} Kansal Sales
      </div>
    </footer>
  );
}
