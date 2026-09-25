import { supabase } from '../lib/supabase';
import type { CartItem } from '../types/database';

export interface CartItemWithProduct extends CartItem {
  products?: {
    name: string;
    price: number;
    discount_price?: number | null;
    image_urls?: string[];
    stock_status: string;
    quantity_available: number;
  };
}

export const cartService = {
  /**
   * Fetch current user's cart items
   */
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(name, price, discount_price, image_urls, stock_status, quantity_available)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return (data as CartItemWithProduct[]) || [];
  },

  /**
   * Add product to cart or increment quantity
   */
  async addToCart(userId: string, productId: string, quantity = 1): Promise<void> {
    // Check existing item
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity });
      if (error) throw error;
    }
  },

  /**
   * Update item quantity in cart
   */
  async updateQuantity(cartItemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      return this.removeFromCart(cartItemId);
    }
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId);

    if (error) throw error;
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (error) throw error;
  },

  /**
   * Clear all items in user's cart
   */
  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },
};
