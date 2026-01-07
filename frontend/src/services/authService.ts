/**
 * Authentication Service - Calls .NET Backend API
 * Handles registration, login, token management, and password operations
 */
import axios from "axios";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RefreshTokenRequestDto,
  AuthResponseDto,
  UserDto,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7285";

// ============================================
// TOKEN STORAGE MANAGEMENT
// ============================================

const TOKEN_KEYS = {
  ACCESS_TOKEN: "dekut_access_token",
  REFRESH_TOKEN: "dekut_refresh_token",
  EXPIRES_AT: "dekut_token_expires_at",
  USER: "dekut_user",
};

/**
 * Store authentication tokens in localStorage and cookies
 */
export function storeTokens(authResponse: AuthResponseDto): void {
  if (typeof window === "undefined") return;

  // Store in localStorage
  localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, authResponse.accessToken);
  localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, authResponse.refreshToken);
  localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, authResponse.expiresAt);
  localStorage.setItem(TOKEN_KEYS.USER, JSON.stringify(authResponse.user));

  // Also store access token in cookie for middleware
  document.cookie = `${TOKEN_KEYS.ACCESS_TOKEN}=${
    authResponse.accessToken
  }; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
}

/**
 * Get token expiration time
 */
export function getTokenExpiresAt(): Date | null {
  if (typeof window === "undefined") return null;
  const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
  return expiresAt ? new Date(expiresAt) : null;
}

/**
 * Get stored user data
 */
export function getStoredUser(): UserDto | null {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(TOKEN_KEYS.USER);
  return userJson ? JSON.parse(userJson) : null;
}

/**
 * Check if access token is expired or about to expire (within 1 minute)
 */
export function isTokenExpired(): boolean {
  const expiresAt = getTokenExpiresAt();
  if (!expiresAt) return true;

  const now = new Date();
  const expiryTime = new Date(expiresAt);
  const timeUntilExpiry = expiryTime.getTime() - now.getTime();

  // Consider expired if less than 1 minute remaining
  return timeUntilExpiry < 60000;
}

/**
 * Clear all stored authentication data
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  localStorage.removeItem(TOKEN_KEYS.USER);

  // Also clear cookie
  document.cookie = `${TOKEN_KEYS.ACCESS_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !isTokenExpired();
}

// ============================================
// AUTHENTICATION API CALLS
// ============================================

/**
 * Register a new user
 */
export async function registerUser(
  data: RegisterDto
): Promise<AuthResponseDto> {
  const response = await axios.post<AuthResponseDto>(
    `${API_BASE_URL}/api/auth/register`,
    data
  );

  // Store tokens after successful registration
  storeTokens(response.data);

  return response.data;
}

/**
 * Login user
 */
export async function loginUser(data: LoginDto): Promise<AuthResponseDto> {
  const response = await axios.post<AuthResponseDto>(
    `${API_BASE_URL}/api/auth/login`,
    data
  );

  // Store tokens after successful login
  storeTokens(response.data);

  return response.data;
}

/**
 * Logout user - clear local tokens
 * Note: Backend doesn't have a logout endpoint, so we just clear local storage
 */
export function logoutUser(): void {
  clearTokens();
  // Optionally redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/auth/signin";
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<AuthResponseDto | null> {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const response = await axios.post<AuthResponseDto>(
      `${API_BASE_URL}/api/auth/refresh-token`,
      {
        accessToken,
        refreshToken,
      } as RefreshTokenRequestDto
    );

    // Store new tokens
    storeTokens(response.data);

    return response.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    return null;
  }
}

/**
 * Get valid access token - refresh if needed
 * This function automatically refreshes the token if it's expired
 */
export async function getValidAccessToken(): Promise<string | null> {
  const accessToken = getAccessToken();

  if (!accessToken) {
    return null;
  }

  // If token is expired or about to expire, refresh it
  if (isTokenExpired()) {
    const refreshResponse = await refreshAccessToken();
    return refreshResponse?.accessToken || null;
  }

  return accessToken;
}

// ============================================
// PASSWORD MANAGEMENT
// ============================================

/**
 * Request password reset
 */
export async function forgotPassword(
  data: ForgotPasswordDto
): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(
    `${API_BASE_URL}/api/auth/forgot-password`,
    data
  );
  return response.data;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  data: ResetPasswordDto
): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(
    `${API_BASE_URL}/api/auth/reset-password`,
    data
  );
  return response.data;
}

// ============================================
// USER DATA
// ============================================

/**
 * Get current user from API (requires authentication)
 */
export async function getCurrentUser(): Promise<UserDto | null> {
  const token = await getValidAccessToken();

  if (!token) {
    return null;
  }

  try {
    const response = await axios.get<UserDto>(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}
