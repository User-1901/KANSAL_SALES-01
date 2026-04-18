/**
 * Frontend validation utilities
 * Centralized validation functions used across pages and components
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  return { valid: true };
}

export function validateName(name: string, fieldName = 'Name'): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validateRequired(value: string | number | undefined, fieldName = 'Field'): { valid: boolean; error?: string } {
  if (!value && value !== 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone) return { valid: false, error: 'Phone number is required' };
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }
  return { valid: true };
}

export function validatePostalCode(postalCode: string, allowedCodes: string[]): { valid: boolean; error?: string } {
  if (!postalCode) return { valid: false, error: 'Postal code is required' };
  if (!allowedCodes.includes(postalCode)) {
    return { valid: false, error: `Delivery only available to: ${allowedCodes.join(', ')}` };
  }
  return { valid: true };
}
