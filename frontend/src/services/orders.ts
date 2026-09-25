import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types/database';

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export const ordersService = {
  /**
   * Fetch customer's orders history
   */
  async getCustomerOrders(userId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as unknown as OrderWithItems[]) || [];
  },

  /**
   * Fetch single order details by ID
   */
  async getOrderById(userId: string, orderId: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as OrderWithItems) || null;
  },
};
