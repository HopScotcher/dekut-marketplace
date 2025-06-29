import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import UserProductsGrid from "@/components/user/UserProductsGrid";
import { getProductsBySeller } from "@/services/productService";
import { mockUser } from "@/data/mock-data";

export default async function DashboardPage() {
  // In a real app, we'd get the current user from auth context
  const userProducts = await getProductsBySeller(mockUser.id);
  const publishedProducts = userProducts.filter(
    (p) => p.status === "published"
  );
  const draftProducts = userProducts.filter((p) => p.status === "draft");

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
          <UserProductsGrid products={publishedProducts} status="published" />
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <UserProductsGrid products={draftProducts} status="draft" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
