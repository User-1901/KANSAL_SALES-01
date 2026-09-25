import { supabase } from '../lib/supabase';

export const inventoryService = {
  /**
   * Check available stock for a product
   */
  async checkStock(productId: string): Promise<{ quantityAvailable: number; inStock: boolean }> {
    const { data, error } = await supabase
      .from('products')
      .select('quantity_available, stock_status')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return {
      quantityAvailable: data.quantity_available,
      inStock: data.stock_status === 'in_stock' && data.quantity_available > 0,
    };
  },
};
