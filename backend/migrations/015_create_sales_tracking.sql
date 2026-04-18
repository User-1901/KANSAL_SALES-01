-- Sales tracking table: stores daily sales data for demand forecasting
CREATE TABLE IF NOT EXISTS sales_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Sales data
  quantity_sold INT NOT NULL DEFAULT 0,
  sale_date DATE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one entry per product per day
  UNIQUE (product_id, sale_date)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_sales_tracking_product_id ON sales_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_sale_date ON sales_tracking(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_product_date ON sales_tracking(product_id, sale_date DESC);

-- Inventory metrics table: stores calculated forecasts and recommendations
CREATE TABLE IF NOT EXISTS inventory_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Calculated metrics
  total_sales_30days INT NOT NULL DEFAULT 0,
  average_daily_demand DECIMAL(10, 2) NOT NULL DEFAULT 0,
  predicted_demand_next_7days DECIMAL(10, 2) NOT NULL DEFAULT 0,
  recommended_stock_level INT NOT NULL DEFAULT 0,
  low_stock_threshold INT NOT NULL DEFAULT 10,
  
  -- Status
  is_low_stock BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one entry per product
  UNIQUE (product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_metrics_product_id ON inventory_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_low_stock ON inventory_metrics(is_low_stock);
