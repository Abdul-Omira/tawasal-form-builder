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
  // Syrian phone format: +963 or 00963 followed by 9 digits
  const phoneRegex = /^(\+963|00963)?[0-9]{9}$/;
  return phoneRegex.test(phone);
}

// Format validation errors for form fields
export function getFormErrorMessage(error?: string): string | undefined {
  return error;
}
