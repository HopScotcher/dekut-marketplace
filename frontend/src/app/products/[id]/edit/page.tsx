"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ProductEditForm from "@/components/product/ProductEditForm";
import { getProductById } from "@/services/productService";
import { getStoredUser } from "@/services/authService";
import { Product } from "@/lib/types";
import { toast } from "sonner";

// Loading skeleton component
function ProductEditSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function ProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await getProductById(id);

        if (!productData) {
          setError("Product not found");
          toast.error("Product not found");
          router.push("/user/dashboard");
          return;
        }

        // Check if user owns this product
        if (productData.sellerId !== user.id) {
          setError("You don't have permission to edit this product");
          toast.error("You don't have permission to edit this product");
          router.push("/user/dashboard");
          return;
        }

        setProduct(productData);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Failed to load product");
        toast.error("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, router]);

  // Loading state
  if (isLoading) {
    return <ProductEditSkeleton />;
  }

  // Error state
  if (error || !product) {
    return (
      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-600">{error || "Product not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <ProductEditForm product={product} />
    </main>
  );
}
