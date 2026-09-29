import { pool, type DatabaseExecutor } from '../db.js';
import type { CreateOrderRequest, CreateOrderResponse, Order } from '../types/index.js';
import { validateDeliveryPincode } from './delivery.js';
import { notifyWhatsAppOrder } from './whatsapp.js';
import { trackSale } from './inventoryService.js';

export class CheckoutError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.statusCode = statusCode;
  }
}

type CartItemInput = { productId: string; quantity: number };

function getDiscountedPrice(price: string | number, discount: string | number | null): number {
  const basePrice = Number(price);
  const percentage = Number(discount ?? 0);
  return Math.round((basePrice - basePrice * percentage / 100) * 100) / 100;
}

const MAX_CART_QUANTITY = 100;

export async function createCashOnDeliveryOrder(
  userId: string,
  cartItems: CartItemInput[],
  shippingInfo: CreateOrderRequest,
  idempotencyKey?: string,
): Promise<CreateOrderResponse> {
  const pincodeValidation = validateDeliveryPincode(shippingInfo.shipping_postal_code);
  if (!pincodeValidation.isValid) throw new CheckoutError('Sorry, we currently deliver only within Chandigarh.');

  const normalizedItems = new Map<string, number>();
  for (const item of cartItems) {
    const productId = String(item.productId || '').trim();
    const quantity = Number(item.quantity);
    if (!productId || !Number.isInteger(quantity) || quantity <= 0 || quantity > MAX_CART_QUANTITY) {
      throw new CheckoutError('Cart contains an invalid quantity or product.');
    }
    const combinedQuantity = (normalizedItems.get(productId) ?? 0) + quantity;
    if (combinedQuantity > MAX_CART_QUANTITY) {
      throw new CheckoutError(`Each product quantity cannot exceed ${MAX_CART_QUANTITY}.`);
    }
    normalizedItems.set(productId, combinedQuantity);
  }
  if (normalizedItems.size === 0) throw new CheckoutError('Cart is empty');

  const productIds = [...normalizedItems.keys()];
  const products = await pool.query(
    `SELECT id, name, price::text, discount_percentage
     FROM products WHERE id = ANY($1::uuid[])`,
    [productIds],
  );
  if (products.rows.length !== productIds.length) {
    throw new CheckoutError('Some products in your cart are no longer available.');
  }

  const orderItems: Array<{ productId: string; productName: string; productPrice: number; quantity: number }> = [];
  for (const product of products.rows as Array<Record<string, unknown>>) {
    const quantity = normalizedItems.get(String(product.id))!;
    orderItems.push({
      productId: String(product.id),
      productName: String(product.name),
      productPrice: getDiscountedPrice(String(product.price), product.discount_percentage as string | null),
      quantity,
    });
  }

  const result = await pool.transaction(async (transaction: DatabaseExecutor) => {
    if (idempotencyKey) {
      const existingResult = await transaction.query(
        'SELECT * FROM orders WHERE user_id = $1 AND idempotency_key = $2',
        [userId, idempotencyKey],
      );
      if (existingResult.rowCount > 0) {
        const existingOrder = existingResult.rows[0] as unknown as Order;
        return { order: existingOrder, items: [], amount: Number(existingOrder.total_amount) };
      }
    }

    for (const item of orderItems) {
      const reservation = await transaction.query(
        `UPDATE products
         SET quantity_available = quantity_available - $1,
             stock_status = CASE WHEN quantity_available - $1 = 0 THEN 'out_of_stock' ELSE 'in_stock' END,
             updated_at = NOW()
         WHERE id = $2 AND quantity_available >= $1
         RETURNING id`,
        [item.quantity, item.productId],
      );
      if (reservation.rowCount === 0) {
        throw new CheckoutError('Some items in your cart are no longer available in the requested quantity.');
      }
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
    const orderResult = await transaction.query(
      `INSERT INTO orders
       (user_id, total_amount, status, shipping_name, shipping_email, shipping_phone,
        shipping_address, shipping_city, shipping_state, shipping_postal_code, payment_method, idempotency_key)
             VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9, 'COD', $10)
       RETURNING *`,
      [
        userId,
        totalAmount.toFixed(2),
        shippingInfo.shipping_name.trim(),
        shippingInfo.shipping_email.trim(),
        shippingInfo.shipping_phone.trim(),
        shippingInfo.shipping_address.trim(),
        shippingInfo.shipping_city.trim(),
        shippingInfo.shipping_state.trim(),
        shippingInfo.shipping_postal_code.trim(),
        idempotencyKey ?? null,
      ],
    );
    const order = orderResult.rows[0] as unknown as Order;

    const itemValues = orderItems.flatMap(item => [item.productId, item.productName, item.productPrice.toFixed(2), item.quantity]);
    const placeholders = orderItems.map((_, index) => `($1, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4}, $${index * 4 + 5})`).join(', ');
    const itemResult = await transaction.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity)
       VALUES ${placeholders} RETURNING *`,
      [order.id, ...itemValues],
    );

    await transaction.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    return { order, items: itemResult.rows, amount: totalAmount };
  });

  try {
    await notifyWhatsAppOrder(result.order, result.items);
  } catch (notificationError) {
    console.error('[WHATSAPP] Order notification failed:', notificationError);
  }

  if (result.items.length > 0) {
    await Promise.all(result.items.map(async item => {
      const sale = item as { product_id?: string; quantity?: number };
      if (!sale.product_id || !sale.quantity) return;
      try {
        await trackSale(sale.product_id, sale.quantity);
      } catch (trackingError) {
        console.error('[INVENTORY] Sale tracking failed:', trackingError);
      }
    }));
  }

  return { order: result.order, amount: result.amount };
}

export async function getOrderDetails(orderId: string): Promise<{ order: Order; items: unknown[] }> {
  const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
  return { order: orderResult.rows[0] as unknown as Order, items: itemsResult.rows };
}
