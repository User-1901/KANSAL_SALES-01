/**
 * Discount calculation utilities
 * Centralized discount logic used across product pages and checkout
 */

/**
 * Calculate discounted price based on original price and discount percentage
 * @param price Original price
 * @param discountPercentage Discount percentage (0-100)
 * @returns Discounted price
 */
export function calculateDiscountedPrice(price: number, discountPercentage: number = 0): number {
  if (discountPercentage <= 0) return price;
  if (discountPercentage >= 100) return 0;
  return Math.max(0, price - (price * discountPercentage) / 100);
}

/**
 * Calculate discount amount in rupees
 * @param price Original price
 * @param discountPercentage Discount percentage
 * @returns Discount amount
 */
export function calculateDiscountAmount(price: number, discountPercentage: number = 0): number {
  if (discountPercentage <= 0) return 0;
  return (price * discountPercentage) / 100;
}

/**
 * Calculate total price for cart items considering discounts
 * @param items Array of items with quantity and price/discount
 * @returns Total price
 */
export function calculateCartTotal(items: Array<{ quantity: number; price: number; discount_percentage?: number }>): number {
  return items.reduce((total, item) => {
    const discountedPrice = calculateDiscountedPrice(item.price, item.discount_percentage || 0);
    return total + discountedPrice * item.quantity;
  }, 0);
}

/**
 * Apply discount to price and return both original and discounted values
 * @param price Original price
 * @param discountPercentage Discount percentage
 * @returns Object with original price, discount amount, and discounted price
 */
export function getDiscountDetails(price: number, discountPercentage: number = 0) {
  const discountAmount = calculateDiscountAmount(price, discountPercentage);
  const discountedPrice = calculateDiscountedPrice(price, discountPercentage);
  
  return {
    originalPrice: price,
    discountPercentage,
    discountAmount,
    discountedPrice,
    hasDisicount: discountPercentage > 0,
  };
}

/**
 * Format price for display
 * @param price Price value
 * @param currency Currency symbol (default: ₹)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency = '₹'): string {
  return `${currency}${price.toFixed(2)}`;
}
