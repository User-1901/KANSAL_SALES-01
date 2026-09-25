// ── ORDER TYPES ────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  user_id: string;
  total_amount: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  payment_method: 'COD';
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: string;
  quantity: number;
  line_total: string;
  created_at: Date;
}

// ── API REQUEST/RESPONSE TYPES ──────────────────────────────────────────────
export interface CreateOrderRequest {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
}

export interface CreateOrderResponse {
  order: Order;
  amount: number;
}
