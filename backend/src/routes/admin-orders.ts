import { Router } from 'express';
import { pool } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, o.shipping_name AS customer_name,
              COALESCE(json_agg(oi ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id ORDER BY o.created_at DESC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error('[ADMIN ORDERS] List failed:', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const validTransitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  const status = String(req.body.status || '');
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status' });
    return;
  }
  try {
    const order = await pool.transaction(async transaction => {
      const currentResult = await transaction.query(
        'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
        [req.params.id],
      );
      if (currentResult.rowCount === 0) return null;

      const currentStatus = String(currentResult.rows[0].status);
      if (!validTransitions[currentStatus]?.includes(status)) {
        const error = new Error(`Invalid order transition: ${currentStatus} -> ${status}`);
        error.name = 'InvalidOrderTransition';
        throw error;
      }

      if (status === 'cancelled') {
        await transaction.query(
          `UPDATE products p
           SET quantity_available = p.quantity_available + oi.quantity,
               stock_status = 'in_stock',
               updated_at = NOW()
           FROM order_items oi
           WHERE oi.order_id = $1 AND oi.product_id = p.id`,
          [req.params.id],
        );
      }

      const result = await transaction.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, req.params.id],
      );
      return result.rows[0];
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    if (error instanceof Error && error.name === 'InvalidOrderTransition') {
      res.status(409).json({ error: error.message });
      return;
    }
    console.error('[ADMIN ORDERS] Status update failed:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
