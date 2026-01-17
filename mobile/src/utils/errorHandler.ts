/**
 * Error handling utilities for user-friendly error messages
 */
import { APIError } from '../services/api';

/**
 * Get user-friendly error message from error object
 *
 * @param error Error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any): string {
  // Handle API errors
  if (error instanceof APIError) {
    return error.message;
  }

  // Handle axios errors
  if (error.response) {
    const message = error.response.data?.error?.message
      || error.response.data?.detail
      || error.response.data?.message;

    if (message) {
      return message;
    }

    // Status code based messages
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Handle network errors
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return 'Network connection failed. Please check your internet connection.';
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Generic error message
  return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Extract validation errors from API error
 *
 * @param error Error object
 * @returns Object with field-specific error messages
 */
export function getValidationErrors(error: any): Record<string, string> {
  if (error instanceof APIError && error.details?.errors) {
    const validationErrors: Record<string, string> = {};

    if (Array.isArray(error.details.errors)) {
      error.details.errors.forEach((err: any) => {
        if (err.field && err.message) {
          validationErrors[err.field] = err.message;
        }
      });
    }

    return validationErrors;
  }

  return {};
}

/**
 * Log error for debugging (in development)
 *
 * @param error Error object
 * @param context Additional context
 */
export function logError(error: any, context?: string): void {
  if (__DEV__) {
    console.error(
      `[Error${context ? ` - ${context}` : ''}]:`,
      error
    );

    if (error instanceof APIError) {
      console.error('Status Code:', error.statusCode);
      console.error('Error Type:', error.type);
      console.error('Error Details:', error.details);
    }
  }
}

/**
 * Handle error and return user-friendly message
 *
 * @param error Error object
 * @param context Optional context for logging
 * @returns User-friendly error message
 */
export function handleError(error: any, context?: string): string {
  logError(error, context);
  return getErrorMessage(error);
}

/**
 * Check if error is authentication related
 *
 * @param error Error object
 * @returns True if authentication error
 */
export function isAuthError(error: any): boolean {
  if (error instanceof APIError) {
    return error.statusCode === 401 || error.type === 'AuthenticationError';
  }

  if (error.response?.status === 401) {
    return true;
  }

  return false;
}

/**
 * Check if error is network related
 *
 * @param error Error object
 * @returns True if network error
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof APIError) {
    return error.type === 'NetworkError' || error.statusCode === 0;
  }

  return (
    error.message === 'Network Error' ||
    error.code === 'ECONNABORTED' ||
    !error.response
  );
}

/**
 * Check if error is validation related
 *
 * @param error Error object
 * @returns True if validation error
 */
export function isValidationError(error: any): boolean {
  if (error instanceof APIError) {
    return error.statusCode === 422 || error.type === 'ValidationError';
  }

  return error.response?.status === 422;
}
