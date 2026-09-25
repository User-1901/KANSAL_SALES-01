import { useEffect, useState } from 'react';
import api from '../api/axios';

type Order = {
  id: string;
  customer_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  total_amount: string;
  payment_method: string;
  status: string;
  items: Array<{ product_name: string; quantity: number; product_price: string }>;
};

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  async function loadOrders() {
    try {
      const response = await api.get('/api/admin/orders');
      setOrders(response.data);
    } catch {
      setError('Failed to load orders.');
    }
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/admin/orders/${id}/status`, { status });
      await loadOrders();
    } catch {
      setError('Failed to update order status.');
    }
  }

  return (
    <div>
      <h1 style={{ color: 'var(--gold)' }}>Orders</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id.slice(0, 8).toUpperCase()}</td>
                <td>{order.customer_name}<br />{order.shipping_phone}<br />{order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</td>
                <td>{order.items.map(item => <div key={`${item.product_name}-${item.quantity}`}>{item.product_name} x {item.quantity}</div>)}</td>
                <td>INR {order.total_amount}</td>
                <td>{order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method}</td>
                <td><select value={order.status} onChange={event => updateStatus(order.id, event.target.value)}>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </div>
  );
}
