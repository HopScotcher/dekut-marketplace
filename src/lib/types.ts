/**
 * Type definitions matching .NET backend DTOs
 * These types should match the C# models returned by the .NET API
 */

// User related types
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null; // ISO date string
  image: string | null;
  phone: string | null;
  location: string | null;
  verified: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  avatar: string | null;
}

// Simplified User for nested relations
export interface UserSummary {
  id: string;
  name: string;
  avatar: string | null;
}

// Product related types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[]; // Array of image URLs from blob storage
  category: string;
  categoryId?: string; // Future: FK to Category table
  brand?: string;
  rating?: number; // Computed from reviews
  reviewCount?: number; // Count of reviews
  condition: 'new' | 'used' | 'refurbished';
  tags?: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  location?: string;
  user: UserSummary; // Nested user object
  status: 'draft' | 'published';
  userId: string;
}

// Product create/update request (sent to .NET API)
export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[]; // URLs returned from image upload endpoint
  category: string;
  brand?: string;
  condition: 'new' | 'used' | 'refurbished';
  tags?: string[];
  location?: string;
  status: 'draft' | 'published';
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
  id: string;
}

// Category related types (future implementation)
export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  parentId?: string | null;
  slug: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order related types (future implementation)
export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  priceAtPurchase: number; // Price snapshot at time of order
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string; // JSON or separate Address object
  billingAddress: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string | null;
}

// Address type (future implementation)
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Review type (future implementation)
export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: UserSummary;
  rating: number; // 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

// Search related types
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  condition?: string;
  location?: string;
  rating?: number;
  sortBy?: 'price' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  filters?: SearchFilters;
}

// Authentication types for NextAuth custom adapter
export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string; // ISO date string
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: string; // ISO date string
}

// API Response wrapper (if .NET uses standard response format)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Pagination helper
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error response from API
export interface ApiError {
  status: number;
  message: string;
  errors: string[];
}