-- Sales tracking table for daily sales metrics
CREATE TABLE IF NOT EXISTS public.sales_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  sale_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, sale_date)
);

CREATE INDEX IF NOT EXISTS idx_sales_tracking_product_id ON public.sales_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_tracking_sale_date ON public.sales_tracking(sale_date);

-- Inventory metrics table for demand forecasting
CREATE TABLE IF NOT EXISTS public.inventory_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  total_sales_30days INTEGER NOT NULL DEFAULT 0,
  average_daily_demand DECIMAL(10, 2) NOT NULL DEFAULT 0,
  predicted_demand_next_7days DECIMAL(10, 2) NOT NULL DEFAULT 0,
  recommended_stock_level INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  is_low_stock BOOLEAN NOT NULL DEFAULT FALSE,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_metrics_product_id ON public.inventory_metrics(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_metrics_low_stock ON public.inventory_metrics(is_low_stock);
