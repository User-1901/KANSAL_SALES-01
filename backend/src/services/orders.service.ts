import { supabaseAdmin } from '../lib/supabase.js';
import type { Order, OrderItem } from '../types/database.js';
import { parseSupabaseServerError } from '../utils/supabaseError.js';

export interface CreateOrderParams {
  userId: string;
  totalAmount: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  items: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }>;
}

export const ordersServerService = {
  /**
   * Create an order with line items in database (Server-Controlled)
   */
  async createOrder(params: CreateOrderParams): Promise<{ order: Order; items: OrderItem[] }> {
    // Insert order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: params.userId,
        total_amount: params.totalAmount,
        status: 'pending',
        shipping_name: params.shippingName,
        shipping_email: params.shippingEmail,
        shipping_phone: params.shippingPhone,
        shipping_address: params.shippingAddress,
        shipping_city: params.shippingCity,
        shipping_state: params.shippingState ?? 'Chandigarh',
        shipping_postal_code: params.shippingPostalCode,
        payment_method: 'COD',
      })
      .select()
      .single();

    if (orderError) throw parseSupabaseServerError(orderError, 'Failed to create order');

    // Insert order items
    const itemRecords = params.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      quantity: item.quantity,
    }));

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemRecords)
      .select();

    if (itemsError) throw parseSupabaseServerError(itemsError, 'Failed to save order items');

    return { order, items: items || [] };
  },

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw parseSupabaseServerError(error, 'Failed to update order status');
    return data;
  },
};
