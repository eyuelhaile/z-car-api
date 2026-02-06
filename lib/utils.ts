import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string = 'ETB'): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Get full image URL from API path
 * If the path is already a full URL (starts with http:// or https://), return it as is
 * Otherwise, prepend the API base URL
 * 
 * API returns paths like: "/uploads/images/original/listings/file.jpg"
 * Expected format: "http://localhost:3001/uploads/images/original/listings/file.jpg"
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '/placeholder-car.jpg';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get API base URL and remove /api/v1 suffix if present
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
  const baseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, ''); // Remove /api/v1 or /api/v1/
  
  // Ensure path starts with / for proper URL construction
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Construct full URL: baseUrl + path
  return `${baseUrl}${cleanPath}`;
}
