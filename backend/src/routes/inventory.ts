/**
 * Inventory Management Routes (Admin Only)
 * 
 * GET  /api/inventory/forecasts         — get all product forecasts
 * GET  /api/inventory/forecasts/:id     — get forecast for specific product
 * GET  /api/inventory/low-stock-alerts  — get products with low stock
 * GET  /api/inventory/sales-history/:id — get sales history for product
 * POST /api/inventory/init              — initialize metrics (first-time setup)
 */

import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getProductForecast,
  getAllForecasts,
  getLowStockAlerts,
  getProductSalesHistory,
  initializeAllMetrics,
} from '../services/inventoryService.js';

const router = Router();

// Protect all routes - admin only
router.use(authenticate, requireAdmin);

/**
 * GET /api/inventory/forecasts
 * Get demand forecasts for all products
 */
router.get('/forecasts', async (_req: Request, res: Response) => {
  try {
    const forecasts = await getAllForecasts();
    res.json({
      success: true,
      count: forecasts.length,
      data: forecasts,
    });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    res.status(500).json({ error: 'Failed to fetch forecasts' });
  }
});

/**
 * GET /api/inventory/forecasts/:id
 * Get forecast for a specific product
 */
router.get('/forecasts/:id', async (req: Request, res: Response) => {
  try {
    const forecast = await getProductForecast(req.params.id);
    if (!forecast) {
      res.status(404).json({ error: 'Product not found or no forecast data available' });
      return;
    }
    res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

/**
 * GET /api/inventory/low-stock-alerts
 * Get products that are currently low on stock
 */
router.get('/low-stock-alerts', async (_req: Request, res: Response) => {
  try {
    const alerts = await getLowStockAlerts();
    res.json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

/**
 * GET /api/inventory/sales-history/:id?days=30
 * Get sales history for a product
 * Query params:
 *   - days: number of days of history to retrieve (default: 30)
 */
router.get('/sales-history/:id', async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const days = parseInt(req.query.days as string) || 30;

    if (days < 1 || days > 365) {
      res.status(400).json({ error: 'Days must be between 1 and 365' });
      return;
    }

    const history = await getProductSalesHistory(productId, days);
    res.json({
      success: true,
      productId,
      days,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching sales history:', error);
    res.status(500).json({ error: 'Failed to fetch sales history' });
  }
});

/**
 * POST /api/inventory/init
 * Initialize inventory metrics for all products (first-time setup)
 * This is safe to run multiple times - it will recalculate for all products
 */
router.post('/init', async (_req: Request, res: Response) => {
  try {
    await initializeAllMetrics();
    res.json({
      success: true,
      message: 'Inventory metrics initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing metrics:', error);
    res.status(500).json({ error: 'Failed to initialize metrics' });
  }
});

export default router;
