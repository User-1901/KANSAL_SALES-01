/**
 * API utility functions
 * Centralized API calls and data fetching logic
 */

import api from '../api/axios';

export interface Product {
  id: number;
  name: string;
  price: number;
  discount_percentage?: number;
  description?: string;
  category_id?: number;
  quantity_available?: number;
  image_url?: string;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Category {
  id: number;
  name: string;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  product?: Product;
}

/**
 * Fetch all products
 * Used in: CartPage, CheckoutPage, ProductsPage, HomePage
 */
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const response = await api.get('/api/products');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

/**
 * Fetch single product by ID
 */
export async function fetchProduct(productId: number): Promise<Product | null> {
  try {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return null;
  }
}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await api.get('/api/categories');
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

/**
 * Fetch category by ID
 */
export async function fetchCategory(categoryId: number): Promise<Category | null> {
  try {
    const response = await api.get(`/api/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch category ${categoryId}:`, error);
    return null;
  }
}

/**
 * Get product with full details including category
 */
export async function fetchProductWithCategory(productId: number) {
  try {
    const product = await fetchProduct(productId);
    if (!product) return null;

    const category = product.category_id ? await fetchCategory(product.category_id) : null;
    return { ...product, category };
  } catch (error) {
    console.error('Failed to fetch product with category:', error);
    return null;
  }
}

/**
 * Enrich cart items with product details
 */
export async function enrichCartWithProducts(cartItems: CartItem[]): Promise<CartItem[]> {
  try {
    const allProducts = await fetchAllProducts();
    const productMap = new Map(allProducts.map(p => [p.id, p]));

    return cartItems.map(item => ({
      ...item,
      product: productMap.get(item.product_id),
    }));
  } catch (error) {
    console.error('Failed to enrich cart:', error);
    return cartItems;
  }
}
