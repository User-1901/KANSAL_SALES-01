import { Router } from 'express';
import { pool } from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, COALESCE(json_agg(oi ORDER BY oi.created_at) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
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
  const status = String(req.body.status || '');
  if (!allowedStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid order status' });
    return;
  }
  try {
    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id],
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[ADMIN ORDERS] Status update failed:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
