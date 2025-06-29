import { useEffect, useCallback } from 'react'
import { useSearchStore } from '@/stores/searchStore'
import { SearchEngine } from '@/utils/searchUtils'
import { mockProducts } from "@/data/mock-data" // Assuming you have this from previous phases
import { getAllProducts } from '@/services/productService'

export async function useSearch() {
  const {
    searchQuery,
    filters,
    sortBy,
    currentPage,
    setSearchResults,
    setLoading
  } = useSearchStore()
  
  const products  = await getAllProducts() // Get all products
  
  const performSearch = useCallback(async () => {
    setLoading(true)
    
    try {
      // Create search engine instance
      const searchEngine = new SearchEngine(products)
      
      // Perform search with current parameters
      const { results, total } = searchEngine.performSearch(
        products,
        searchQuery,
        filters,
        sortBy
      )
      
      // Pagination (20 items per page)
      const itemsPerPage = 20
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage)
      
      setSearchResults(paginatedResults, total)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([], 0)
    }
  }, [searchQuery, filters, sortBy, currentPage, products, setSearchResults, setLoading])
  
  // Trigger search when parameters change
  useEffect(() => {
    performSearch()
  }, [performSearch])
  
  return { performSearch }
}