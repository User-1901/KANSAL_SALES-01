-- Prevent duplicate order creation when a client retries the same checkout.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_user_idempotency
  ON orders(user_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;