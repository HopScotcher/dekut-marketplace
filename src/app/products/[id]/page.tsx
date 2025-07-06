"use client";

import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductDetailLayout from "@/components/features/ProductDetailLayout";
import { Product } from "@/lib/types";
import { useProduct, useProducts } from "@/hooks/useProducts";
 

// Loading skeleton component
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>

        {/* Right column skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-6 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function ProductDetailError({
  error,
  retry,
}: {
  error: Error;
  retry: () => void;
}) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">
          Error Loading Product
        </h1>
        <p className="text-gray-600">{error.message}</p>
        <button
          onClick={retry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}

// Main ProductDetailPage component
export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
 
  const { data: product, isLoading, error, refetch } = useProduct(id);

  // Loading state
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Error state
  if (error) {
    return <ProductDetailError error={error} retry={refetch} />;
  }

  // Success state
  if (!product) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600">
            Product Not Found
          </h1>
          <p className="text-gray-500 mt-2">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductDetailLayout product={product} />
    </main>
  );
}
