/* eslint-disable @typescript-eslint/no-unused-vars */

import { Product } from "@/lib/types";
import ProductCard from "../common/ProductCard";
import EmptyState from "../common/EmptyState";
import { Badge } from "../ui/badge";

type UserProductsGridProps = {
  products: Product[];
  status: "Published" | "Draft";
  selectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (productId: string) => void;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
};

export default function UserProductsGrid({
  products,
  status,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: UserProductsGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={
          status === "Draft" ? "No draft products" : "No published products"
        }
        description={
          status === "Draft"
            ? "Start creating products and save them as drafts to publish later."
            : "You haven't published any products yet. Start selling by creating and publishing a product."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="relative">
          {product.status === "Draft" && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 z-10 bg-gray-100"
            >
              Draft
            </Badge>
          )}
          <ProductCard
            product={product}
            showOwnerActions={true}
            onEdit={onEdit ? () => onEdit(product.id) : undefined}
            onDelete={onDelete ? () => onDelete(product.id) : undefined}
          />
        </div>
      ))}
    </div>
  );
}
