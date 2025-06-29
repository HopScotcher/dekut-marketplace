"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import UserProductsGrid from "@/components/user/UserProductsGrid";
import { getProductsBySeller } from "@/services/productService";
import { mockUser } from "@/data/mock-data";
import BulkActionBar from "@/components/user/BulkActionBar";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useState, useEffect } from "react";
import { Product } from "@/lib/types";

export default function DashboardPageWrapper() {
  // This wrapper is needed to use hooks in a server component
  return <DashboardPage />;
}

function DashboardPage() {
  // In a real app, we'd get the current user from auth context
  // For demo, use client-side state for selection
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProductsBySeller(mockUser.id).then((userProducts) => {
      setProducts(userProducts);
      setLoading(false);
    });
  }, []);

  const publishedProducts = products.filter((p) => p.status === "published");
  const draftProducts = products.filter((p) => p.status === "draft");

  const bulk = useBulkSelection(publishedProducts.map((p) => p.id));

  // Handle bulk delete (for demo, just filter out from state)
  function handleBulkDelete() {
    setProducts((prev) => prev.filter((p) => !bulk.selectedIds.includes(p.id)));
    bulk.clearSelection();
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">
            Manage your products and track your listings
          </p>
        </div>
        <Link href="/sell">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Published Products
          </h3>
          <p className="mt-2 text-3xl font-bold">{publishedProducts.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Draft Products</h3>
          <p className="mt-2 text-3xl font-bold">{draftProducts.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="published" className="space-y-6">
        <TabsList>
          <TabsTrigger value="published">Published Products</TabsTrigger>
          <TabsTrigger value="draft">Draft Products</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          <BulkActionBar
            selectionMode={bulk.selectionMode}
            selectedCount={bulk.selectedCount}
            allSelected={bulk.allSelected}
            onSelectAll={bulk.selectAllPublished}
            onClear={bulk.clearSelection}
            onBulkDelete={handleBulkDelete}
            onToggleSelectionMode={bulk.toggleSelectionMode}
          />
          <UserProductsGrid
            products={publishedProducts}
            status="published"
            selectionMode={bulk.selectionMode}
            selectedIds={bulk.selectedIds}
            onToggleSelect={bulk.toggleSelection}
          />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <UserProductsGrid products={draftProducts} status="draft" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
