// lib/services/productService.ts
import { Product } from '@/lib/types';
import { mockProducts } from '@/data/mock-data';

// Simulate API delay for realistic behavior
const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Get all products
 * @returns Promise<Product[]>
 */
export async function getAllProducts(): Promise<Product[]> {
  await simulateDelay();
  return mockProducts;
}

/**
 * Get a single product by ID
 * @param productId - The ID of the product to fetch
 * @returns Promise<Product | null>
 */
export async function getProductById(productId: string): Promise<Product | null> {
  await simulateDelay();
  
  const product = mockProducts.find(p => p.id === productId);
  return product || null;
}

/**
 * Get products by category
 * @param categoryId - The category ID to filter by
 * @returns Promise<Product[]>
 */
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  await simulateDelay();
  
  return mockProducts.filter(product => product.categoryId === categoryId);

}

/**
 * Get products by seller
 * @param sellerId - The seller ID to filter by
 * @returns Promise<Product[]>
 */
export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  await simulateDelay();
  
  return mockProducts.filter(product => product.seller.id === sellerId);
}

/**
 * Search products by name or description
 * @param query - Search query string
 * @returns Promise<Product[]>
 */
export async function searchProducts(query: string): Promise<Product[]> {
  await simulateDelay();
  
  const lowercaseQuery = query.toLowerCase();
  
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

/**
 * Get featured products (high rating or recent)
 * @param limit - Number of products to return
 * @returns Promise<Product[]>
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  await simulateDelay();
  
  // Sort by rating and recency, then limit
  const featured = mockProducts
    .filter(product => product.rating >= 4.0)
    .sort((a, b) => {
      // Sort by rating first, then by creation date
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
    
  return featured;
}

/**
 * Get products with filters and sorting
 * @param options - Filter and sort options
 * @returns Promise<Product[]>
 */
export interface ProductFilterOptions {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Product['condition'][];
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'oldest';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function getFilteredProducts(options: ProductFilterOptions = {}): Promise<{
  products: Product[];
  totalCount: number;
}> {
  await simulateDelay();
  
  let filteredProducts = [...mockProducts];
  
  // Apply filters
  if (options.categoryId) {
    filteredProducts = filteredProducts.filter(p => p.categoryId === options.categoryId);
  }
  
  if (options.minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price >= options.minPrice!);
  }
  
  if (options.maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price <= options.maxPrice!);
  }
  
  if (options.condition && options.condition.length > 0) {
    filteredProducts = filteredProducts.filter(p => options.condition!.includes(p.condition));
  }
  
  if (options.minRating !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.rating >= options.minRating!);
  }
  
  // Apply sorting
  if (options.sortBy) {
    filteredProducts.sort((a, b) => {
      let comparison = 0;
      
      switch (options.sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'newest':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'oldest':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      return options.sortOrder === 'desc' ? -comparison : comparison;
    });
  }
  
  const totalCount = filteredProducts.length;
  
  // Apply pagination
  if (options.offset !== undefined || options.limit !== undefined) {
    const offset = options.offset || 0;
    const limit = options.limit || filteredProducts.length;
    filteredProducts = filteredProducts.slice(offset, offset + limit);
  }
  
  return {
    products: filteredProducts,
    totalCount
  };
}

/**
 * Get related products (same category, excluding current product)
 * @param productId - Current product ID to exclude
 * @param limit - Number of related products to return
 * @returns Promise<Product[]>
 */
export async function getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
  await simulateDelay();
  
  const currentProduct = mockProducts.find(p => p.id === productId);
  if (!currentProduct) return [];
  
  const related = mockProducts
    .filter(p => p.id !== productId && p.categoryId === currentProduct.categoryId)
    .sort(() => Math.random() - 0.5) // Shuffle for variety
    .slice(0, limit);
    
  return related;
}

/**
 * Check if product exists
 * @param productId - Product ID to check
 * @returns Promise<boolean>
 */
export async function productExists(productId: string): Promise<boolean> {
  await simulateDelay(100); // Shorter delay for existence check
  
  return mockProducts.some(p => p.id === productId);
}