import { useEffect } from 'react';

export default function PrivacyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Kansal Sales';
    const description = 'Privacy information for customers of Kansal Sales.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, []);

  return (
    <main className="page-container" style={{ maxWidth: 820 }}>
      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--gray-500)' }}>Last updated: October 1, 2026</p>
      <div className="card" style={{ padding: 28 }}>
        <section>
          <h2>1. Information we collect</h2>
          <p>We may collect your name, phone number, delivery address, and order details when you use our store.</p>
        </section>
        <section>
          <h2>2. How we use information</h2>
          <p>We use this information to process orders, arrange delivery, provide support, and improve our services.</p>
        </section>
        <section>
          <h2>3. Sharing information</h2>
          <p>We may share the information needed to fulfil your order with delivery staff and hosting or service providers supporting the website.</p>
        </section>
        <section>
          <h2>4. Retention and security</h2>
          <p>We keep information only as needed for the purposes described above and take reasonable steps to protect it.</p>
        </section>
        <section>
          <h2>5. Your rights</h2>
          <p>You may ask questions about your information or request correction by contacting us through the details on our Contact page.</p>
        </section>
        <section>
          <h2>6. Questions</h2>
          <p>Contact us through the details on our Contact page if you have questions about this policy.</p>
        </section>
      </div>
    </main>
  );
}
