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
 * Query parameters that match backend QueryObject
 */
export interface ProductQueryParams {
  Name?: string;
  MinPrice?: number;
  MaxPrice?: number;
  Negotiable?: boolean;
  SortBy?: string;
  IsDescending?: boolean;
  Condition?: string;
  Location?: string;
  SellerId?: string;
  CategoryId?: string;
  PageNumber?: number;
  PageSize?: number;
}

export interface ProductQueryResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get products with filtering, sorting, and pagination
 * Maps to GET /api/products with QueryObject parameters
 */
export async function getProducts(
  params: ProductQueryParams = {}
): Promise<ProductQueryResult> {
  const response = await api.get<Product[]>("/api/products", {
    params: {
      Name: params.Name,
      MinPrice: params.MinPrice,
      MaxPrice: params.MaxPrice,
      Negotiable: params.Negotiable,
      SortBy: params.SortBy,
      IsDescending: params.IsDescending ?? false,
      Condition: params.Condition,
      Location: params.Location,
      SellerId: params.SellerId,
      CategoryId: params.CategoryId,
      PageNumber: params.PageNumber ?? 1,
      PageSize: params.PageSize ?? 20,
    },
  });

  // Backend returns array directly, calculate pagination
  const pageSize = params.PageSize ?? 20;
  const currentPage = params.PageNumber ?? 1;

  return {
    products: response,
    totalCount: response.length,
    currentPage: currentPage,
    pageSize: pageSize,
    totalPages: Math.ceil(response.length / pageSize),
  };
}

/**
 * Get all published products
 * @returns Promise<Product[]>
 */
export async function getAllProducts(): Promise<Product[]> {
  const result = await getProducts({ PageSize: 100 });
  return result.products;
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
  const result = await getProducts({ CategoryId: categoryId, PageSize: 100 });
  return result.products;
}

/**
 * Get products by seller/user
 * @param userId - The user ID to filter by
 * @returns Promise<Product[]>
 */
export async function getProductsByUser(userId: string): Promise<Product[]> {
  const result = await getProducts({ SellerId: userId, PageSize: 100 });
  return result.products;
}

/**
 * Search products with filters and sorting
 * Uses .NET backend with QueryObject parameters
 * @param options - Filter and sort options
 * @returns Promise with products and pagination info
 */
export interface ProductSearchOptions {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export async function searchProducts(
  options: ProductSearchOptions = {}
): Promise<ProductQueryResult> {
  return getProducts({
    Name: options.query,
    CategoryId: options.category,
    MinPrice: options.minPrice,
    MaxPrice: options.maxPrice,
    Condition: options.condition,
    Location: options.location,
    SortBy: options.sortBy,
    IsDescending: options.sortOrder === "desc",
    PageNumber: options.page,
    PageSize: options.pageSize,
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
