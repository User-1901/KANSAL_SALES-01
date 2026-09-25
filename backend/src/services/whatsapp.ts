import type { Order } from '../types/index.js';

function buildMessage(order: Order, items: Array<Record<string, unknown>>): string {
  const lines = items.map(item => `${item.product_name} x ${item.quantity}`);
  return [
    'KANSAL SALES - NEW ORDER',
    '',
    `Order ID: ${order.id}`,
    `Date: ${new Date(order.created_at).toISOString()}`,
    '',
    `Customer Name: ${order.shipping_name}`,
    `Phone: ${order.shipping_phone}`,
    '',
    `Address: ${order.shipping_address}`,
    `City: ${order.shipping_city}`,
    `State: ${order.shipping_state}`,
    `Pincode: ${order.shipping_postal_code}`,
    '',
    'ORDER ITEMS',
    ...lines,
    '',
    `Total: INR ${order.total_amount}`,
    'Payment Method: Cash on Delivery',
    `Order Status: ${order.status}`,
  ].join('\n');
}

export async function notifyWhatsAppOrder(order: Order, items: Array<Record<string, unknown>>): Promise<void> {
  const recipient = process.env.WHATSAPP_NUMBER;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!recipient || !accessToken || !phoneNumberId) {
    console.warn('[WHATSAPP] Notification skipped: provider configuration is incomplete');
    return;
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'text',
      text: { body: buildMessage(order, items) },
    }),
  });
  if (!response.ok) console.error('[WHATSAPP] Notification failed:', await response.text());
}
