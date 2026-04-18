/**
 * Inventory Management Service
 * 
 * Handles:
 * - Sales tracking
 * - Demand forecasting (using simple statistics)
 * - Stock level recommendations
 * - Low stock alerts
 * 
 * Key Formula (Student-Friendly):
 * 
 * 1. Average Daily Demand = Total Sales (last 30 days) / 30
 * 2. Predicted Demand (next 7 days) = Average Daily Demand × 7
 * 3. Recommended Stock = Predicted Demand + Safety Stock
 * 4. Safety Stock = Average Daily Demand × 3 (for 3-day buffer)
 * 5. Low Stock Alert = Current Stock < Recommended Stock
 */

import { pool } from '../db.js';

export interface SalesData {
  date: string;
  quantity: number;
}

export interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  totalSales30Days: number;
  averageDailyDemand: number;
  predictedDemand7Days: number;
  safetyStock: number;
  recommendedStock: number;
  isLowStock: boolean;
  lastUpdated: string;
}

/**
 * Track a sale - called when an order is placed
 * @param productId - Product UUID
 * @param quantitySold - Number of units sold
 */
export async function trackSale(productId: string, quantitySold: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Insert or update today's sales for this product
    await pool.query(
      `INSERT INTO sales_tracking (product_id, quantity_sold, sale_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (product_id, sale_date) 
       DO UPDATE SET quantity_sold = sales_tracking.quantity_sold + $2, updated_at = NOW()`,
      [productId, quantitySold, today],
    );

    // Recalculate inventory metrics after tracking sale
    await updateInventoryMetrics(productId);
  } catch (error) {
    console.error('Error tracking sale:', error);
    throw error;
  }
}

/**
 * Calculate and update inventory metrics for a product
 * This includes: average demand, predicted demand, recommended stock, low stock status
 */
export async function updateInventoryMetrics(productId: string): Promise<void> {
  try {
    // Step 1: Calculate 30-day sales data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const salesResult = await pool.query(
      `SELECT COALESCE(SUM(quantity_sold), 0) as total_sales
       FROM sales_tracking
       WHERE product_id = $1 AND sale_date >= $2`,
      [productId, thirtyDaysAgoStr],
    );

    const totalSales30Days = parseInt(salesResult.rows[0]?.total_sales || 0, 10);

    // Step 2: Calculate average daily demand (Sales / 30 days)
    const averageDailyDemand = totalSales30Days / 30;

    // Step 3: Predict next 7 days demand (Average daily demand × 7)
    const predictedDemand7Days = averageDailyDemand * 7;

    // Step 4: Calculate safety stock (Average daily demand × 3 days buffer)
    // This ensures we have stock to handle demand spikes
    const safetyStock = Math.ceil(averageDailyDemand * 3);

    // Step 5: Recommended stock = Predicted + Safety Stock
    const recommendedStock = Math.ceil(predictedDemand7Days + safetyStock);

    // Step 6: Get current stock level
    const productResult = await pool.query(
      `SELECT quantity_available FROM products WHERE id = $1`,
      [productId],
    );

    if (productResult.rowCount === 0) {
      throw new Error(`Product ${productId} not found`);
    }

    const currentStock = productResult.rows[0]?.quantity_available || 0;

    // Step 7: Check if stock is low (current < recommended)
    const isLowStock = currentStock < recommendedStock;

    // Step 8: Insert or update inventory metrics
    await pool.query(
      `INSERT INTO inventory_metrics (
        product_id, total_sales_30days, average_daily_demand, 
        predicted_demand_next_7days, recommended_stock_level, is_low_stock, last_calculated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (product_id) 
       DO UPDATE SET 
        total_sales_30days = $2,
        average_daily_demand = $3,
        predicted_demand_next_7days = $4,
        recommended_stock_level = $5,
        is_low_stock = $6,
        last_calculated_at = NOW()`,
      [productId, totalSales30Days, averageDailyDemand, predictedDemand7Days, recommendedStock, isLowStock],
    );

    console.log(`✓ Updated metrics for product ${productId}`);
  } catch (error) {
    console.error('Error updating inventory metrics:', error);
    throw error;
  }
}

/**
 * Get demand forecast for a single product
 */
export async function getProductForecast(productId: string): Promise<DemandForecast | null> {
  try {
    const result = await pool.query(
      `SELECT 
        im.product_id,
        p.name as product_name,
        p.quantity_available as current_stock,
        im.total_sales_30days,
        im.average_daily_demand,
        im.predicted_demand_next_7days,
        CEIL(im.average_daily_demand * 3) as safety_stock,
        im.recommended_stock_level,
        im.is_low_stock,
        im.last_calculated_at
       FROM inventory_metrics im
       JOIN products p ON im.product_id = p.id
       WHERE im.product_id = $1`,
      [productId],
    );

    if (result.rowCount === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      productId: row.product_id,
      productName: row.product_name,
      currentStock: row.current_stock,
      totalSales30Days: row.total_sales_30days,
      averageDailyDemand: parseFloat(row.average_daily_demand),
      predictedDemand7Days: parseFloat(row.predicted_demand_next_7days),
      safetyStock: parseInt(row.safety_stock, 10),
      recommendedStock: row.recommended_stock_level,
      isLowStock: row.is_low_stock,
      lastUpdated: row.last_calculated_at,
    };
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
}

/**
 * Get demand forecasts for ALL products
 */
export async function getAllForecasts(): Promise<DemandForecast[]> {
  try {
    const result = await pool.query(
      `SELECT 
        im.product_id,
        p.name as product_name,
        p.quantity_available as current_stock,
        im.total_sales_30days,
        im.average_daily_demand,
        im.predicted_demand_next_7days,
        CEIL(im.average_daily_demand * 3) as safety_stock,
        im.recommended_stock_level,
        im.is_low_stock,
        im.last_calculated_at
       FROM inventory_metrics im
       JOIN products p ON im.product_id = p.id
       ORDER BY im.is_low_stock DESC, p.name ASC`,
    );

    return result.rows.map(row => ({
      productId: row.product_id,
      productName: row.product_name,
      currentStock: row.current_stock,
      totalSales30Days: row.total_sales_30days,
      averageDailyDemand: parseFloat(row.average_daily_demand),
      predictedDemand7Days: parseFloat(row.predicted_demand_next_7days),
      safetyStock: parseInt(row.safety_stock, 10),
      recommendedStock: row.recommended_stock_level,
      isLowStock: row.is_low_stock,
      lastUpdated: row.last_calculated_at,
    }));
  } catch (error) {
    console.error('Error fetching all forecasts:', error);
    throw error;
  }
}

/**
 * Get low stock alerts (products below recommended stock)
 */
export async function getLowStockAlerts(): Promise<DemandForecast[]> {
  try {
    const result = await pool.query(
      `SELECT 
        im.product_id,
        p.name as product_name,
        p.quantity_available as current_stock,
        im.total_sales_30days,
        im.average_daily_demand,
        im.predicted_demand_next_7days,
        CEIL(im.average_daily_demand * 3) as safety_stock,
        im.recommended_stock_level,
        im.is_low_stock,
        im.last_calculated_at
       FROM inventory_metrics im
       JOIN products p ON im.product_id = p.id
       WHERE im.is_low_stock = TRUE
       ORDER BY (im.recommended_stock_level - p.quantity_available) DESC`,
    );

    return result.rows.map(row => ({
      productId: row.product_id,
      productName: row.product_name,
      currentStock: row.current_stock,
      totalSales30Days: row.total_sales_30days,
      averageDailyDemand: parseFloat(row.average_daily_demand),
      predictedDemand7Days: parseFloat(row.predicted_demand_next_7days),
      safetyStock: parseInt(row.safety_stock, 10),
      recommendedStock: row.recommended_stock_level,
      isLowStock: row.is_low_stock,
      lastUpdated: row.last_calculated_at,
    }));
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    throw error;
  }
}

/**
 * Get sales history for a product (last N days)
 */
export async function getProductSalesHistory(
  productId: string,
  days: number = 30,
): Promise<SalesData[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT sale_date, quantity_sold
       FROM sales_tracking
       WHERE product_id = $1 AND sale_date >= $2
       ORDER BY sale_date ASC`,
      [productId, startDateStr],
    );

    return result.rows.map(row => ({
      date: row.sale_date,
      quantity: parseInt(row.quantity_sold, 10),
    }));
  } catch (error) {
    console.error('Error fetching sales history:', error);
    throw error;
  }
}

/**
 * Initialize metrics for all products (useful for first-time setup)
 */
export async function initializeAllMetrics(): Promise<void> {
  try {
    console.log('Initializing inventory metrics for all products...');

    // Get all products
    const productsResult = await pool.query(`SELECT id FROM products`);

    for (const product of productsResult.rows) {
      await updateInventoryMetrics(product.id);
    }

    console.log('✓ Metrics initialized for all products');
  } catch (error) {
    console.error('Error initializing metrics:', error);
    throw error;
  }
}
