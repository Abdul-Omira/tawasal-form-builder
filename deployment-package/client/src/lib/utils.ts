import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate random ID with prefix
export function generateId(prefix: string): string {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Format date to Arabic locale date string
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (Syrian phone numbers)
export function isValidPhone(phone: string): boolean {
  // Allow various international formats:
  // - Standard international format: +[country code][number]
  // - Local format: 9 or more digits
  // - Numbers with spaces
  // - Numbers with dashes
  if (!phone) return false;
  
  // Remove spaces, dashes, parentheses to normalize
  const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for international format or local format
  return /^(\+|00)?[0-9]{8,15}$/.test(normalizedPhone);
}

// Format validation errors for form fields
export function getFormErrorMessage(error?: string): string | undefined {
  return error;
}
