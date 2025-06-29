'use client'

import { Suspense } from 'react'
import SearchBar from '@/components/search/SearchBar'
import SearchFilters from '@/components/search/SearchFilters'
import SearchSort from '@/components/search/SearchSort'
import SearchResults from '@/components/search/SearchResults'
import { useSearch } from '@/hooks/useSearch'

function SearchContent() {
  const { performSearch } = useSearch()
  
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












// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import SearchBar from "@/components/common/SearchBar";
// import ProductGrid from "@/components/features/ProductGrid";
// import EmptyState from "@/components/common/EmptyState";
// import { mockProducts } from "@/data/mock-data";
// import { Product } from "@/lib/types";

// export default function SearchPage() {
//   const searchParams = useSearchParams();
//   const [searchResults, setSearchResults] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   useEffect(() => {
//     const query = searchParams.get("q") || "";
//     setSearchQuery(query);

//     if (query) {
//       performSearch(query);
//     } else {
//       setSearchResults([]);
//     }
//   }, [searchParams]);

//   const performSearch = (query: string) => {
//     setLoading(true);

//     // Simulate API call delay
//     setTimeout(() => {
//       const results = mockProducts.filter(
//         (product) =>
//           product.name.toLowerCase().includes(query.toLowerCase()) ||
//           product.description.toLowerCase().includes(query.toLowerCase()) ||
//           product.category.toLowerCase().includes(query.toLowerCase()) ||
//           product.tags.some((tag) =>
//             tag.toLowerCase().includes(query.toLowerCase())
//           )
//       );

//       setSearchResults(results);
//       setLoading(false);
//     }, 500);
//   };

//   const handleSearch = (query: string) => {
//     setSearchQuery(query);
//     performSearch(query);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold mb-4">Search Products</h1>
//         <div className="max-w-2xl">
//           <SearchBar
//             defaultValue={searchQuery}
//             onSearch={handleSearch}
//             placeholder="Search for products, categories, or brands..."
//           />
//         </div>
//       </div>

//       {searchQuery && (
//         <div className="mb-8">
//           <p className="text-gray-600">
//             {loading
//               ? `Searching for "${searchQuery}"...`
//               : `Found ${searchResults.length} results for "${searchQuery}"`}
//           </p>
//         </div>
//       )}

//       {loading ? (
//         <ProductGrid products={[]} loading={true} />
//       ) : searchQuery && searchResults.length === 0 ? (
//         <EmptyState
//           type="search"
//           description={`No products found for "${searchQuery}". Try different keywords.`}
//         />
//       ) : searchResults.length > 0 ? (
//         <ProductGrid products={searchResults} />
//       ) : (
//         <div className="text-center py-12">
//           <p className="text-gray-600">Enter a search term to find products</p>
//         </div>
//       )}
//     </div>
//   );
// }


