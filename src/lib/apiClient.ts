import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getSession } from "next-auth/react";

/**
 * Base API client for .NET backend
 * Handles authentication, error handling, and base URL configuration
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get NextAuth session
    const session = await getSession();

    if (session?.user) {
      // Add JWT token to Authorization header
      // The token should be available in your NextAuth JWT callback
      const token = (session as any).accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          console.error("Unauthorized access - please login");
          // You might want to trigger a sign-out or redirect here
          break;
        case 403:
          console.error("Forbidden - insufficient permissions");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Internal server error");
          break;
        default:
          console.error(`API Error: ${status}`, data?.message || error.message);
      }

      // Return structured error
      return Promise.reject({
        status,
        message: data?.message || error.message,
        errors: data?.errors || [],
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("Network error - no response from server");
      return Promise.reject({
        status: 0,
        message: "Network error - please check your connection",
        errors: [],
      });
    } else {
      // Error in request configuration
      console.error("Request error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message,
        errors: [],
      });
    }
  }
);

/**
 * API client for authenticated requests
 */
export const api = {
  get: <T>(url: string, config?: any) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: any) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};

/**
 * Upload files with multipart/form-data
 * Used for image uploads
 */
export const uploadFiles = async (
  endpoint: string,
  files: File[],
  additionalData?: Record<string, any>
): Promise<string[]> => {
  const formData = new FormData();

  // Append files
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  // Append additional data if provided
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : value
      );
    });
  }

  const response = await apiClient.post<{ urls: string[] }>(
    endpoint,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.urls;
};

export default apiClient;
