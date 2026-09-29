import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

interface ShippingInfo {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: string;
  quantity: number;
  discount_percentage?: number;
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const checkoutKey = useRef(crypto.randomUUID());
  const [shipping, setShipping] = useState<ShippingInfo>({
    shipping_name: user?.displayName || '',
    shipping_email: user?.email || '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: 'Chandigarh',
    shipping_state: 'Chandigarh',
    shipping_postal_code: '',
  });

  useEffect(() => {
    async function loadCart() {
      try {
        const response = await api.get('/api/cart');
        const items = (response.data.items || []) as CartItem[];
        const enriched = await Promise.all(items.map(async item => {
          try {
            const product = await api.get(`/api/products/${item.productId}`);
            return { ...item, discount_percentage: product.data.discount_percentage || 0 };
          } catch {
            return item;
          }
        }));
        setCartItems(enriched);
        setCartTotal(enriched.reduce((total, item) => {
          const price = Number(item.price);
          const discount = item.discount_percentage || 0;
          return total + (price - price * discount / 100) * item.quantity;
        }, 0));
      } catch {
        setError('Failed to load cart.');
      } finally {
        setLoadingCart(false);
      }
    }
    if (user) loadCart();
  }, [user]);

  if (!user) {
    return <div className="page-container"><div className="card" style={{ padding: 32, textAlign: 'center' }}><h2>Login Required</h2><p>Please log in to proceed with checkout.</p><button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button></div></div>;
  }

  if (!loadingCart && cartItems.length === 0) {
    return <div className="page-container"><div className="card" style={{ padding: 32, textAlign: 'center' }}><h2>Your Basket is Empty</h2><button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Groceries</button></div></div>;
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setShipping(previous => ({ ...previous, [name]: value }));
  }

  async function placeOrder() {
    if (Object.values(shipping).some(value => !value.trim())) {
      setError('Please fill in all customer and delivery details.');
      return;
    }
    if (!/^\d{6}$/.test(shipping.shipping_postal_code)) {
      setError('Sorry, we currently deliver only within Chandigarh.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const response = await api.post(
        '/api/checkout',
        {
          shippingInfo: shipping,
          cartItems: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
        },
        { headers: { 'Idempotency-Key': checkoutKey.current } },
      );
      navigate(`/orders/${response.data.order.id}`, { replace: true });
    } catch (requestError: unknown) {
      const response = (requestError as { response?: { data?: { error?: string } } }).response;
      setError(response?.data?.error || "We couldn't place your order. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 900, paddingTop: 32 }}>
      <h1>Confirm Your Grocery Order</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Delivery Address</h2>
          {[
            ['shipping_name', 'Full Name', 'text'],
            ['shipping_email', 'Email', 'email'],
            ['shipping_phone', 'Mobile Number', 'tel'],
            ['shipping_city', 'City', 'text'],
            ['shipping_state', 'State', 'text'],
            ['shipping_postal_code', 'Pincode', 'text'],
          ].map(([name, label, type]) => (
            <div className="form-group" key={name}>
              <label htmlFor={name}>{label}</label>
              <input id={name} name={name} type={type} value={shipping[name as keyof ShippingInfo]} onChange={handleInputChange} required maxLength={name === 'shipping_postal_code' ? 6 : undefined} />
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="shipping_address">Full Address</label>
            <textarea id="shipping_address" name="shipping_address" rows={3} value={shipping.shipping_address} onChange={handleInputChange} required />
          </div>
        </div>
        <div className="card" style={{ padding: 24, alignSelf: 'start' }}>
          <h2 style={{ marginTop: 0 }}>Basket Summary</h2>
          {loadingCart ? <p>Loading cart...</p> : cartItems.map(item => {
            const price = Number(item.price);
            const discountedPrice = price - price * (item.discount_percentage || 0) / 100;
            return <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}><span>{item.name} x {item.quantity}</span><strong>₹{(discountedPrice * item.quantity).toFixed(2)}</strong></div>;
          })}
          <hr />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}><span>Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
          <div className="alert alert-info" style={{ marginTop: 20 }}>Payment Method: Cash on Delivery</div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={placeOrder} disabled={processing || loadingCart}>{processing ? 'Placing Order...' : 'Place COD Order'}</button>
        </div>
      </div>
    </div>
  );
}
