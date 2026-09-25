-- COD checkout metadata for existing databases.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100) NOT NULL DEFAULT 'Chandigarh';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'COD';

UPDATE orders SET payment_method = 'COD' WHERE payment_method IS NULL;