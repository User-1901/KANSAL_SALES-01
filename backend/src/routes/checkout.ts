import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { CheckoutError, createCashOnDeliveryOrder, getOrderDetails } from '../services/payment.js';
import { pool } from '../db.js';

// ── ROUTER SETUP ────────────────────────────────────────────────────────────
const router = Router();

// ── POST /api/checkout - Create a COD order ─────────────────────────────────
router.post('/api/checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { shippingInfo, cartItems } = req.body;

    if (!shippingInfo || typeof shippingInfo !== 'object' || Array.isArray(shippingInfo)) {
      return res.status(400).json({ error: 'Shipping information is required' });
    }

    const fields = ['shipping_name', 'shipping_email', 'shipping_phone', 'shipping_address', 'shipping_city', 'shipping_state', 'shipping_postal_code'] as const;
    if (fields.some(field => typeof shippingInfo[field] !== 'string' || shippingInfo[field].trim() === '')) {
      return res.status(400).json({ error: 'Incomplete shipping information' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.shipping_email.trim())) {
      return res.status(400).json({ error: 'A valid shipping email is required' });
    }
    if (!/^\d{10}$/.test(shippingInfo.shipping_phone.trim())) {
      return res.status(400).json({ error: 'A valid 10-digit shipping phone is required' });
    }
    if (shippingInfo.shipping_name.trim().length > 255 || shippingInfo.shipping_address.trim().length > 1000) {
      return res.status(400).json({ error: 'Shipping information is too long' });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const idempotencyKeyHeader = req.header('Idempotency-Key');
    const idempotencyKey = idempotencyKeyHeader?.trim();
    if (idempotencyKey && idempotencyKey.length > 128) {
      return res.status(400).json({ error: 'Idempotency-Key is too long' });
    }

    const orderResponse = await createCashOnDeliveryOrder(userId, cartItems, shippingInfo, idempotencyKey);
    
    res.json(orderResponse);
  } catch (error: unknown) {
    console.error('Checkout error:', error);
    
    // Handle delivery area errors with specific message
    if (error instanceof CheckoutError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ── GET /api/orders/:id - Get order details ────────────────────────────────
// Returns order info and line items
router.get('/api/orders/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user!.id;

    // Verify order belongs to user
    const orderCheckResult = await pool.query(`
      SELECT user_id FROM orders WHERE id = $1
    `, [orderId]);

    if (orderCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderCheckResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orderData = await getOrderDetails(orderId);
    res.json(orderData);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// ── GET /api/orders - Get user's orders ─────────────────────────────────────
// Returns all orders for authenticated user
router.get('/api/orders', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(`
      SELECT * FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
