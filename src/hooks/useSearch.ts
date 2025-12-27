/**
 * useSearch Hook - Calls .NET backend search API
 * Replaces client-side Fuse.js search with server-side full-text search
 */
import { useEffect, useCallback } from 'react'
import { useSearchStore } from '@/stores/searchStore'
import { searchProducts } from '@/services/productService'

export function useSearch() {
  const {
    searchQuery,
    filters,
    sortBy,
    currentPage,
    setSearchResults,
    setLoading
  } = useSearchStore()

  const performSearch = useCallback(async () => {
    setLoading(true)
    try {
      // Call .NET backend search endpoint
      const result = await searchProducts({
        query: searchQuery,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        condition: filters.condition ? [filters.condition] : undefined,
        location: filters.location,
        sortBy: sortBy.value as 'price' | 'date' | 'relevance',
        sortOrder: sortBy.direction,
        page: currentPage,
        pageSize: 20
      })
      
      setSearchResults(result.products, result.totalCount)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([], 0)
    }
  }, [searchQuery, filters, sortBy, currentPage, setSearchResults, setLoading])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  return { performSearch }
}