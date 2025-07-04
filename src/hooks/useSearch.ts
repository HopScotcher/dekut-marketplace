import { useEffect, useCallback } from 'react'
import { useSearchStore } from '@/stores/searchStore'
import { SearchEngine } from '@/utils/searchUtils'
import { getAllProducts } from '@/services/productService'

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
      const products = await getAllProducts() // Fetch products here, not at top level
      const searchEngine = new SearchEngine(products)
      const { results, total } = searchEngine.performSearch(
        products,
        searchQuery,
        filters,
        sortBy
      )
      const itemsPerPage = 20
      const startIndex = (currentPage - 1) * itemsPerPage
      const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage)
      setSearchResults(paginatedResults, total)
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