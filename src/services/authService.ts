/**
 * Authentication Service - Calls .NET Backend API
 * Handles registration, password reset, and other auth operations
 */
import { api } from "@/lib/apiClient";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  message?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Register a new user
 */
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await axios.post<RegisterResponse>(
    `${API_BASE_URL}/api/auth/register`,
    data
  );
  return response.data;
}

/**
 * Request password reset
 */
export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const response = await axios.post<ForgotPasswordResponse>(
    `${API_BASE_URL}/api/auth/forgot-password`,
    data
  );
  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: ResetPasswordRequest
): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(
    `${API_BASE_URL}/api/auth/reset-password`,
    data
  );
  return response.data;
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(
    `${API_BASE_URL}/api/auth/verify-email`,
    { token }
  );
  return response.data;
}
