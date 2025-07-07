'use client'

import { Suspense, useEffect } from 'react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import SearchSort from '@/components/search/SearchSort'
import SearchResults from '@/components/search/SearchResults'
import { useSearch } from '@/hooks/useSearch'


interface SearchPageProps {
  params: { query?: string }
}

function SearchContent({ query }: { query?: string }) {
  const { performSearch } = useSearch();
  const decodedQuery = query ? decodeURIComponent(query) : "";

  useEffect(() => {
    // Always perform search, even if query is empty (to show all products)
    performSearch();
  }, [decodedQuery, performSearch]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {decodedQuery ? `Search Results for "${decodedQuery}"` : 'Search Products'}
        </h1>
        <SearchBar onSearch={performSearch} initialQuery={decodedQuery} />
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
  );
}

export default function SearchPage({ params }: SearchPageProps) {
  const query = params?.query;
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchContent query={query} />
    </Suspense>
  );
}






 