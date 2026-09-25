import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { CheckoutError, createCashOnDeliveryOrder, getOrderDetails } from '../services/payment.js';
import { pool } from '../db.js';

// ── ROUTER SETUP ────────────────────────────────────────────────────────────
const router = Router();

// ── POST /api/checkout - Create a COD order ─────────────────────────────────
router.post('/api/checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { shippingInfo, cartItems } = req.body;

    // Validate shipping info
    if (!shippingInfo || !shippingInfo.shipping_name || !shippingInfo.shipping_email ||
        !shippingInfo.shipping_phone || !shippingInfo.shipping_address || 
        !shippingInfo.shipping_city || !shippingInfo.shipping_state || !shippingInfo.shipping_postal_code) {
      return res.status(400).json({ error: 'Incomplete shipping information' });
    }

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderResponse = await createCashOnDeliveryOrder(userId, cartItems, shippingInfo);
    
    res.json(orderResponse);
  } catch (error: any) {
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
    const userId = (req as any).user.id;

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
    const userId = (req as any).user.id;

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
