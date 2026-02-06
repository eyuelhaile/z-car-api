import { AxiosError } from 'axios';

// Type for API error response
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  meta?: {
    requestId: string;
  };
}

/**
 * Extract error message from API response or error object
 * @param error - The error object (can be AxiosError, Error, or unknown)
 * @param fallback - Fallback message if no message can be extracted
 * @returns The extracted error message
 */
export function getApiErrorMessage(error: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    
    // First try to get the main message
    if (data?.message) {
      return data.message;
    }
    
    // Then try to get from errors array
    if (data?.errors && data.errors.length > 0) {
      return data.errors.map(e => e.message).join('. ');
    }
    
    // Check for common HTTP status messages
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your inputs.';
      case 401:
        return 'Please sign in to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 422:
        return 'Validation failed. Please check your inputs.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        break;
    }
  }
  
  // If it's a regular Error, use its message
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  return fallback;
}

/**
 * Get field-specific errors from API response
 * @param error - The error object
 * @returns Record of field names to error messages
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    
    if (data?.errors) {
      data.errors.forEach((err) => {
        if (err.field) {
          fieldErrors[err.field] = err.message;
        }
      });
    }
  }
  
  return fieldErrors;
}

/**
 * Check if error is a specific HTTP status
 */
export function isHttpStatus(error: unknown, status: number): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === status;
  }
  return false;
}

/**
 * Check if error is a conflict (409)
 */
export function isConflictError(error: unknown): boolean {
  return isHttpStatus(error, 409);
}

/**
 * Check if error is unauthorized (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  return isHttpStatus(error, 401);
}

/**
 * Check if error is forbidden (403)
 */
export function isForbiddenError(error: unknown): boolean {
  return isHttpStatus(error, 403);
}

/**
 * Check if error is not found (404)
 */
export function isNotFoundError(error: unknown): boolean {
  return isHttpStatus(error, 404);
}

/**
 * Check if error is validation error (422)
 */
export function isValidationError(error: unknown): boolean {
  return isHttpStatus(error, 422);
}

