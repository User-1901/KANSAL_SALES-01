/**
 * Centralized validation constants and patterns
 * Used across all backend routes and services
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const SALT_ROUNDS = 10;
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_EMAIL_LENGTH = 255;
export const MAX_NAME_LENGTH = 100;

// Admin display name validation
export const VALID_DISPLAY_NAME_REGEX = /^[a-zA-Z\s\-\.\']+$/;

// Product validation
export const MIN_PRODUCT_PRICE = 0;
export const MAX_DISCOUNT_PERCENTAGE = 100;
export const MIN_DISCOUNT_PERCENTAGE = 0;

// Contact form
export const MAX_MESSAGE_LENGTH = 5000;
export const MIN_MESSAGE_LENGTH = 10;

// Rating validation
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const MAX_REVIEW_LENGTH = 1000;
