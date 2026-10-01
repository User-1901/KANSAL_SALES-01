import { useEffect } from 'react';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions | Kansal Sales';
    const description = 'Terms and conditions for shopping with Kansal Sales.';
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
      <h1>Terms &amp; Conditions</h1>
      <p style={{ color: 'var(--gray-500)' }}>Last updated: October 1, 2026</p>
      <div className="card" style={{ padding: 28 }}>
        <section>
          <h2>1. Orders</h2>
          <p>You may place orders for groceries and everyday essentials through Kansal Sales. An order is accepted when we confirm it.</p>
        </section>
        <section>
          <h2>2. Pricing and availability</h2>
          <p>Prices and product availability may change. We will inform you if an ordered item is unavailable or if an important correction is needed.</p>
        </section>
        <section>
          <h2>3. Cash on delivery</h2>
          <p>Payment is collected by Cash on Delivery when your order arrives. Please keep the confirmed order amount ready.</p>
        </section>
        <section>
          <h2>4. Cancellation</h2>
          <p>Contact us through the details on our Contact page as soon as possible if you need to ask about cancelling an order.</p>
        </section>
        <section>
          <h2>5. Delivery area</h2>
          <p>We currently deliver in Chandigarh. Service availability may depend on the delivery address.</p>
        </section>
        <section>
          <h2>6. Liability</h2>
          <p>We will take reasonable care in processing and delivering orders. Our responsibility is limited to the order and service provided, subject to applicable law.</p>
        </section>
        <section>
          <h2>7. Governing law</h2>
          <p>These terms are governed by the laws of India. Courts at Chandigarh will have jurisdiction.</p>
        </section>
      </div>
    </main>
  );
}
