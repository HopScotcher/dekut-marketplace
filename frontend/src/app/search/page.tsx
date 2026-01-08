"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/components/features/ProductGrid";
import SearchFilters from "@/components/search/SearchFilters";
import SearchSort from "@/components/search/SearchSort";
import SearchBar from "@/components/search/SearchBar";
import EmptyState from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { getProducts, ProductQueryParams } from "@/services/productService";
import { Product } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Build query params from URL
  const buildQueryParams = (): ProductQueryParams => {
    return {
      Name: searchParams.get("q") || undefined,
      CategoryId: searchParams.get("category") || undefined,
      MinPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      MaxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      Condition: searchParams.get("condition") || undefined,
      Location: searchParams.get("location") || undefined,
      SortBy: searchParams.get("sortBy") || undefined,
      IsDescending: searchParams.get("isDescending") === "true",
      PageNumber: currentPage,
      PageSize: 20,
    };
  };

  // Fetch products when URL params or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = buildQueryParams();
        const result = await getProducts(params);
        setProducts(result.products);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Products</h1>
        <SearchBar />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-4">
            <SearchFilters />
          </div>
        </aside>

        {/* Results Section */}
        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  <span className="font-semibold">{totalCount}</span> results
                  found
                </>
              )}
            </p>
            <SearchSort />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && products.length === 0 && (
            <EmptyState
              title="No products found"
              description="Try adjusting your search or filters to find what you're looking for."
              actionLabel="Clear Filters"
              onAction={() => {
                window.location.href = "/search";
              }}
            />
          )}

          {/* Products Grid */}
          {!isLoading && products.length > 0 && (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {totalCount > 20 && (
                <div className="flex justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {currentPage} of {Math.ceil(totalCount / 20)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= Math.ceil(totalCount / 20)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
