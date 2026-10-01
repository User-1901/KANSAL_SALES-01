import { useEffect } from 'react';

export default function ShippingPolicyPage() {
  useEffect(() => {
    document.title = 'Shipping & Delivery Policy | Kansal Sales';
    const description = 'Shipping and delivery information for Kansal Sales.';
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
      <h1>Shipping &amp; Delivery Policy</h1>
      <p style={{ color: 'var(--gray-500)' }}>Last updated: October 1, 2026</p>
      <div className="card" style={{ padding: 28 }}>
        <section>
          <h2>1. Delivery area</h2>
          <p>We deliver groceries and everyday essentials in Chandigarh. We will confirm whether your address is serviceable when processing your order.</p>
        </section>
        <section>
          <h2>2. Delivery charges</h2>
          <p>Delivery charges: [TO BE ADDED]. Any applicable charge will be shown or communicated before the order is confirmed.</p>
        </section>
        <section>
          <h2>3. Delivery time</h2>
          <p>Delivery time slots: [TO BE ADDED]. We will communicate any important delivery update through the contact details provided with the order.</p>
        </section>
        <section>
          <h2>4. Payment</h2>
          <p>Payment is collected through Cash on Delivery when the order arrives.</p>
        </section>
        <section>
          <h2>5. Delivery issues</h2>
          <p>Contact us through the details on our Contact page as soon as possible if an order is delayed, incomplete, damaged, expired, or incorrect.</p>
        </section>
      </div>
    </main>
  );
}
