/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import { useSearchStore } from '@/stores/searchStore'
import ProductCard from '@/components/common/ProductCard'
import Loading from '../common/Loading'

export default function SearchResults() {
  const { 
    searchResults, 
    totalResults, 
    isLoading, 
    searchQuery,
    currentPage 
  } = useSearchStore()
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading text="Searching for products..." size="md" />
      </div>
    )
  }
  
  if (!isLoading && searchResults.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          No products found for &quot;{searchQuery}&quot;
        </div>
        <div className="text-gray-400 text-sm">
          Try adjusting your search terms or filters
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Results summary */}
      {searchQuery && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalResults} results for &quot;<span className="font-medium">{searchQuery}</span>&quot;
          </div>
        </div>
      )}
      
      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {searchResults.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}