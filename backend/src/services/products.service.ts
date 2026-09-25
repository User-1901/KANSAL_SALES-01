import { supabaseAdmin } from '../lib/supabase.js';
import type { Product, Category, ProductImage } from '../types/database.js';
import { parseSupabaseServerError } from '../utils/supabaseError.js';

export const productsServerService = {
  /**
   * Fetch all products
   */
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw parseSupabaseServerError(error, 'Failed to fetch products');
    return data || [];
  },

  /**
   * Create a new product (Admin function)
   */
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) throw parseSupabaseServerError(error, 'Failed to create product');
    return data;
  },

  /**
   * Update existing product (Admin function)
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw parseSupabaseServerError(error, 'Failed to update product');
    return data;
  },

  /**
   * Add a product image record to product_images table
   */
  async addProductImage(imageData: Omit<ProductImage, 'id' | 'created_at'>): Promise<ProductImage> {
    const { data, error } = await supabaseAdmin
      .from('product_images')
      .insert(imageData)
      .select()
      .single();

    if (error) throw parseSupabaseServerError(error, 'Failed to add product image record');
    return data;
  },
};
