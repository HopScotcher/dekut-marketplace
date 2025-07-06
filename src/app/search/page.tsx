'use client'

import { Suspense } from 'react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import SearchSort from '@/components/search/SearchSort'
import SearchResults from '@/components/search/SearchResults'
import { useSearch } from '@/hooks/useSearch'

function SearchContent() {
  const { performSearch } = useSearch();
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Products
        </h1>
        <SearchBar onSearch={performSearch} />
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <div className="lg:col-span-1">
          <SearchFilters />
        </div>
        
        {/* Results area */}
        <div className="lg:col-span-3 space-y-6">
          <SearchSort />
          <SearchResults />
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  )
}






 