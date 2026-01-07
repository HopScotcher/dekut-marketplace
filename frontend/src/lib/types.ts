/**
 * Type definitions matching .NET backend DTOs
 * These types should match the C# models returned by the .NET API
 */

// ============================================
// AUTHENTICATION DTOs
// ============================================

export interface RegisterDto {
  email: string;
  password: string;
  phoneNumber: string;
  userName: string;
  profileImage?: string;
  location?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequestDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto {
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO date string
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  location?: string;
  image?: string;
  verified: boolean;
  createdAt: string; // ISO date string
}

// Simplified User for nested relations
export interface UserSummary {
  id: string;
  name: string;
  image?: string;
}

// ============================================
// PRODUCT DTOs & ENUMS
// ============================================

export enum ProductStatus {
  Draft = "Draft",
  Published = "Published",
  Sold = "Sold",
  Expired = "Expired",
}

export enum ProductCondition {
  New = "New",
  Used = "Used",
  Refurbished = "Refurbished",
}

export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  condition: ProductCondition;
  status: ProductStatus;
  images: string; // JSON string array from backend
  tags: string; // JSON string array from backend
  location: string;
  createdAt: string; // ISO date string
  negotiable: boolean;
  // Navigation properties
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
}

// Helper interface with parsed arrays
export interface Product extends Omit<ProductDto, "images" | "tags"> {
  images: string[];
  tags: string[];
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  location: string;
  categoryId: string;
  negotiable: boolean;
  images: string; // JSON string array
  tags: string; // JSON string array
  condition: ProductCondition;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  location?: string;
  tags?: string;
  negotiable?: boolean;
  categoryId?: string;
  status?: ProductStatus;
  condition?: ProductCondition;
  images?: string;
}

// ============================================
// CATEGORY DTOs
// ============================================

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  productCount: number;
  parentCategoryId?: string;
  parentCategoryName?: string;
  subCategoryCount: number;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  icon?: string;
  parentCategoryId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  parentCategoryId?: string;
}

// ============================================
// QUERY & FILTER DTOs
// ============================================

export interface QueryObject {
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  negotiable?: boolean; // default true in backend
  sortBy?: string;
  isDescending?: boolean; // default false in backend
  condition?: ProductCondition;
  location?: string;
  sellerId?: string;
  categoryId?: string;
  pageNumber?: number; // default 1 in backend
  pageSize?: number; // default 20 in backend
}

// ============================================
// UPLOAD DTOs
// ============================================

export interface UploadResponse {
  urls: string[];
}

// ============================================
// UTILITY TYPES
// ============================================

// Helper to parse JSON strings from backend
export function parseProductDto(dto: ProductDto): Product {
  return {
    ...dto,
    images: JSON.parse(dto.images || "[]"),
    tags: JSON.parse(dto.tags || "[]"),
  };
}

// Helper to stringify arrays for backend
export function stringifyProductData(data: {
  images?: string[];
  tags?: string[];
  [key: string]: any;
}) {
  return {
    ...data,
    images: data.images ? JSON.stringify(data.images) : "[]",
    tags: data.tags ? JSON.stringify(data.tags) : "[]",
  };
}

// Error response from API
export interface ApiError {
  status: number;
  message: string;
  errors: string[];
}
