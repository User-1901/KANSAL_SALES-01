-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_status VARCHAR(20) NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock')),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  quantity_available INTEGER NOT NULL DEFAULT 100,
  why_shop_message TEXT DEFAULT 'Why shop with us?
🚚 Fast Delivery - Quick delivery to your doorstep
💰 Best Prices - Quality products at competitive prices
📦 Wide Assortment - Thousands of products to choose from',
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_price DECIMAL(10, 2),
  hsn_code VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_discount ON public.products(discount_percentage) WHERE discount_percentage > 0;
CREATE INDEX IF NOT EXISTS idx_products_hsn ON public.products(hsn_code);
