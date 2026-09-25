ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100) NOT NULL DEFAULT 'Chandigarh';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'COD';

CREATE OR REPLACE FUNCTION public.reserve_product_stock(product_id UUID, requested_quantity INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF requested_quantity <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE public.products
  SET quantity_available = quantity_available - requested_quantity,
      stock_status = CASE WHEN quantity_available - requested_quantity = 0 THEN 'out_of_stock' ELSE 'in_stock' END,
      updated_at = NOW()
  WHERE id = product_id AND quantity_available >= requested_quantity;

  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_product_stock(UUID, INTEGER) FROM PUBLIC;