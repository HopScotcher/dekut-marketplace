/**
 * Centralized Error Handling Utility
 * Handles API errors and displays consistent toast notifications
 */
import { toast } from "sonner";

interface ApiError {
  message?: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred";

  const apiError = error as ApiError;

  // Check for response error message
  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  }

  // Check for validation errors
  if (apiError.response?.data?.errors) {
    const errors = apiError.response.data.errors;
    const firstError = Object.values(errors)[0];
    if (firstError && firstError.length > 0) {
      return firstError[0];
    }
  }

  // Check for direct message
  if (apiError.message) {
    return apiError.message;
  }

  // Check if it's an Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Check if it's a string
  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred";
}

/**
 * Handle API errors with toast notifications
 */
export function handleApiError(
  error: unknown,
  defaultMessage = "An error occurred"
): void {
  const message = getErrorMessage(error);
  toast.error(defaultMessage, {
    description: message,
  });
  console.error("API Error:", error);
}

/**
 * Handle success notifications
 */
export function showSuccess(message: string, description?: string): void {
  toast.success(message, {
    description,
  });
}

/**
 * Handle info notifications
 */
export function showInfo(message: string, description?: string): void {
  toast.info(message, {
    description,
  });
}

/**
 * Handle warning notifications
 */
export function showWarning(message: string, description?: string): void {
  toast.warning(message, {
    description,
  });
}
