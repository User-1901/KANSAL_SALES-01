import { supabase } from '../lib/supabase';
import type { Rating } from '../types/database';

export const reviewsService = {
  /**
   * Fetch reviews for a specific product
   */
  async getProductReviews(productId: string): Promise<Rating[]> {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Submit a product rating/review
   */
  async submitReview(review: Omit<Rating, 'id' | 'created_at' | 'updated_at'>): Promise<Rating> {
    const { data, error } = await supabase
      .from('ratings')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
