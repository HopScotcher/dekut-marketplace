/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UserProductsGrid from "@/components/user/UserProductsGrid";
import { getProductsByUser, deleteProduct } from "@/services/productService";
import { getStoredUser } from "@/services/authService";
import BulkActionBar from "@/components/user/BulkActionBar";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { toast } from "sonner";

export default function DashboardPageWrapper() {
  // This wrapper is needed to use hooks in a server component
  return <DashboardPage />;
}

function DashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user's products from backend
  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    setLoading(true);
    getProductsByUser(user.id)
      .then((userProducts) => {
        setProducts(userProducts);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load your products");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const publishedProducts = products.filter((p) => p.status === "Published");
  const draftProducts = products.filter((p) => p.status === "Draft");

  const bulk = useBulkSelection(publishedProducts.map((p) => p.id));

  // Handle individual product delete
  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete action
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle product edit
  const handleEditClick = (productId: string) => {
    router.push(`/products/${productId}/edit`);
  };

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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your products...</p>
            </div>
          ) : (
            <UserProductsGrid
              products={publishedProducts}
              status="Published"
              selectionMode={bulk.selectionMode}
              selectedIds={bulk.selectedIds}
              onToggleSelect={bulk.toggleSelection}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading your drafts...</p>
            </div>
          ) : (
            <UserProductsGrid
              products={draftProducts}
              status="Draft"
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
