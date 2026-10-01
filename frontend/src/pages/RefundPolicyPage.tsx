import { useEffect } from 'react';

export default function RefundPolicyPage() {
  useEffect(() => {
    document.title = 'Refund, Return & Cancellation Policy | Kansal Sales';
    const description = 'Refund, return, replacement, and cancellation information for Kansal Sales orders.';
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
      <h1>Refund, Return &amp; Cancellation Policy</h1>
      <p style={{ color: 'var(--gray-500)' }}>Last updated: October 1, 2026</p>
      <div className="card" style={{ padding: 28 }}>
        <section>
          <h2>1. Damaged, expired, or wrong items</h2>
          <p>Please report damaged, expired, or wrong items at delivery or as soon as possible after receiving your order.</p>
        </section>
        <section>
          <h2>2. Perishable items</h2>
          <p>Perishable items should be checked promptly after delivery. Eligibility for a replacement or refund may depend on the condition of the item and the circumstances of the report.</p>
        </section>
        <section>
          <h2>3. Cancellations</h2>
          <p>Contact us through the details on our Contact page as soon as possible to ask about cancelling an order. Cancellation may not be possible after preparation or dispatch.</p>
        </section>
        <section>
          <h2>4. Refunds and replacements</h2>
          <p>After reviewing a reported issue, we may arrange a replacement or refund where appropriate. Refund timelines and the refund method for Cash on Delivery orders: [TO BE ADDED].</p>
        </section>
        <section>
          <h2>5. Contact</h2>
          <p>Please keep your order details available when reporting an issue so we can assist you.</p>
        </section>
      </div>
    </main>
  );
}
