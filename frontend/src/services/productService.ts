/**
 * Product Service - Calls .NET Backend API
 * All product-related operations now go through the .NET API
 */
import { api } from "@/lib/apiClient";
import {
  Product,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
} from "@/lib/types";

/**
 * Get all published products
 * @returns Promise<Product[]>
 */
export async function getAllProducts(): Promise<Product[]> {
  return api.get<Product[]>("/api/products");
}

/**
 * Get a single product by ID
 * @param productId - The ID of the product to fetch
 * @returns Promise<Product | null>
 */
export async function getProductById(
  productId: string
): Promise<Product | null> {
  try {
    return await api.get<Product>(`/api/products/${productId}`);
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
}

/**
 * Get products by category
 * @param categoryId - The category ID to filter by
 * @returns Promise<Product[]>
 */
export async function getProductsByCategory(
  categoryId: string
): Promise<Product[]> {
  return api.get<Product[]>(`/api/products`, {
    params: { category: categoryId },
  });
}

/**
 * Get products by seller/user
 * @param userId - The user ID to filter by
 * @param status - Optional status filter ('draft' | 'published')
 * @returns Promise<Product[]>
 */
export async function getProductsByUser(
  userId: string,
  status?: "draft" | "published"
): Promise<Product[]> {
  return api.get<Product[]>(`/api/users/${userId}/products`, {
    params: status ? { status } : undefined,
  });
}

/**
 * Search products with filters and sorting
 * Uses .NET backend with SQL full-text search
 * @param query - Search query string
 * @param options - Filter and sort options
 * @returns Promise with products and pagination info
 */
export interface ProductSearchOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  location?: string;
  sortBy?: "price" | "date" | "relevance";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export async function searchProducts(
  options: ProductSearchOptions = {}
): Promise<ProductSearchResult> {
  const params = new URLSearchParams();

  if (options.query) params.append("q", options.query);
  if (options.category) params.append("category", options.category);
  if (options.minPrice !== undefined)
    params.append("minPrice", options.minPrice.toString());
  if (options.maxPrice !== undefined)
    params.append("maxPrice", options.maxPrice.toString());
  if (options.condition && options.condition.length > 0) {
    options.condition.forEach((c) => params.append("condition", c));
  }
  if (options.location) params.append("location", options.location);
  if (options.sortBy) params.append("sortBy", options.sortBy);
  if (options.sortOrder) params.append("sortOrder", options.sortOrder);
  if (options.page) params.append("page", options.page.toString());
  if (options.pageSize) params.append("pageSize", options.pageSize.toString());

  return api.get<ProductSearchResult>(
    `/api/products/search?${params.toString()}`
  );
}

/**
 * Get featured products (high rating or recent)
 * @param limit - Number of products to return
 * @returns Promise<Product[]>
 */
export async function getFeaturedProducts(
  limit: number = 8
): Promise<Product[]> {
  return api.get<Product[]>("/api/products/featured", {
    params: { limit },
  });
}

/**
 * Get related products (same category, excluding current product)
 * @param productId - Current product ID to exclude
 * @param limit - Number of related products to return
 * @returns Promise<Product[]>
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<Product[]> {
  return api.get<Product[]>(`/api/products/${productId}/related`, {
    params: { limit },
  });
}

// Legacy export for backward compatibility
export interface ProductFilterOptions extends ProductSearchOptions {}

export async function getFilteredProducts(
  options: ProductFilterOptions = {}
): Promise<{
  products: Product[];
  totalCount: number;
}> {
  const result = await searchProducts(options);
  return {
    products: result.products,
    totalCount: result.totalCount,
  };
}

// /**
//  * Check if product exists
//  * @param productId - Product ID to check
//  * @returns Promise<boolean>
//  */
// export async function productExists(productId: string): Promise<boolean> {
//   await simulateDelay(100); // Shorter delay for existence check

//   return mockProducts.some((p) => p.id === productId);
// }

/**
 * Upload multiple product images
 * @param files - Array of image files to upload
 * @returns Promise<string[]> - Array of uploaded image URLs
 */
export async function uploadProductImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<{ message: string; urls: string[] }>(
    "/api/upload/multiple",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.urls;
}

/**
 * Create a new product
 * @param data - Product creation data
 * @returns Promise<ProductDto>
 */
export async function createProduct(
  data: CreateProductDto
): Promise<ProductDto> {
  return api.post<ProductDto>("/api/products", data);
}

/**
 * Update an existing product
 * @param productId - Product ID to update
 * @param data - Product update data
 * @returns Promise<ProductDto>
 */
export async function updateProduct(
  productId: string,
  data: UpdateProductDto
): Promise<ProductDto> {
  return api.put<ProductDto>(`/api/products/${productId}`, data);
}

/**
 * Delete a product
 * @param productId - Product ID to delete
 * @returns Promise<void>
 */
export async function deleteProduct(productId: string): Promise<void> {
  return api.delete(`/api/products/${productId}`);
}
