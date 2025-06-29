import Fuse from 'fuse.js'
import { Product } from "@/lib/types"
import { SearchFilters, SortOption } from '@/stores/searchStore'

// Fuse.js configuration for fuzzy search
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'category', weight: 0.2 },
    { name: 'tags', weight: 0.1 }
  ],
  threshold: 0.3, // Lower = more strict matching
  distance: 100,
  includeScore: true,
  minMatchCharLength: 2
}

export class SearchEngine {
  private fuse: Fuse<Product>
  
  constructor(products: Product[]) {
    this.fuse = new Fuse(products, fuseOptions)
  }
  
  // Text search with fuzzy matching
  searchText(query: string): Product[] {
    if (!query.trim()) return []
    
    const results = this.fuse.search(query)
    return results.map(result => result.item)
  }
  
  // Filter products based on criteria
  filterProducts(products: Product[], filters: SearchFilters): Product[] {
    return products.filter((product) => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false
      }
      
      // Price range filter
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false
      }
      
      // Condition filter
      if (filters.condition && product.condition !== filters.condition) {
        return false
      }
      
      // Location filter (if product has location)
      if (filters.location && product.location && 
          !product.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
      
      return true
    })
  }
  
  // Sort products based on selected option
  sortProducts(products: Product[], sortBy: SortOption): Product[] {
    const sorted = [...products]
    
    switch (sortBy.value) {
      case 'price':
        return sorted.sort((a, b) => 
          sortBy.direction === 'asc' ? a.price - b.price : b.price - a.price
        )
        
      case 'date':
        return sorted.sort((a, b) => 
          sortBy.direction === 'asc' 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
    //   case 'popularity':
    //     return sorted.sort((a, b) => 
    //       sortBy.direction === 'asc' 
    //         ? (a.views || 0) - (b.views || 0)
    //         : (b.views || 0) - (a.views || 0)
    //     )
        
      case 'relevance':
      default:
        return sorted // Already sorted by relevance from Fuse.js
    }
  }
  
  // Combined search function
  performSearch(
    allProducts: Product[],
    query: string,
    filters: SearchFilters,
    sortBy: SortOption
  ): { results: Product[]; total: number } {
    let results: Product[]
    
    // If there's a search query, use text search first
    if (query.trim()) {
      results = this.searchText(query)
    } else {
      results = allProducts
    }
    
    // Apply filters
    results = this.filterProducts(results, filters)
    
    // Apply sorting
    results = this.sortProducts(results, sortBy)
    
    return {
      results,
      total: results.length
    }
  }
}