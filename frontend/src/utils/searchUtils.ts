/**
 * Search utility functions
 * Note: Actual search is now handled by .NET backend with SQL full-text search
 * These utilities are kept for any client-side filtering/sorting needs
 */
import { Product } from "@/lib/types";
import { SearchFilters, SortOption } from "@/stores/searchStore";

/**
 * Filter products on client-side (for cached results)
 */
export function filterProducts(
  products: Product[],
  filters: SearchFilters
): Product[] {
  return products.filter((product) => {
    // Category filter
    if (filters.category && product.categoryId !== filters.category) {
      return false;
    }

    // Price range filter
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }

    // Condition filter
    if (filters.condition && product.condition !== filters.condition) {
      return false;
    }

    // Location filter (if product has location)
    if (
      filters.location &&
      product.location &&
      !product.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Sort products on client-side (for cached results)
 */
export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];

  switch (sortBy.value) {
    case "price":
      return sorted.sort((a, b) =>
        sortBy.direction === "asc" ? a.price - b.price : b.price - a.price
      );

    case "date":
      return sorted.sort((a, b) =>
        sortBy.direction === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    case "relevance":
    default:
      return sorted;
  }
}
