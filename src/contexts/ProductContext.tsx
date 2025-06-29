import React, { createContext, useContext, useState } from "react";
import { Product } from "@/lib/types";
import { mockProducts } from "@/data/mock-data";
import { useUser } from "./UserContext";

interface ProductContextType {
  products: Product[];
  selectedProductIds: string[];
  getCurrentUserProducts: () => Product[];
  getCurrentUserDrafts: () => Product[];
  getCurrentUserPublished: () => Product[];
  bulkDeleteProducts: (productIds: string[]) => void;
  toggleProductStatus: (productId: string) => void;
  selectProduct: (productId: string) => void;
  selectAllPublished: () => void;
  clearSelection: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const { currentUser } = useUser();

  const getCurrentUserProducts = () =>
    products.filter((p) => p.userId === currentUser.id);
  const getCurrentUserDrafts = () =>
    products.filter((p) => p.userId === currentUser.id && p.status === "draft");
  const getCurrentUserPublished = () =>
    products.filter(
      (p) => p.userId === currentUser.id && p.status === "published"
    );

  const bulkDeleteProducts = (productIds: string[]) => {
    setProducts((prev) => prev.filter((p) => !productIds.includes(p.id)));
    setSelectedProductIds([]);
  };

  const toggleProductStatus = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              status: p.status === "published" ? "draft" : "published",
              updatedAt: new Date().toISOString(),
            }
          : p
      )
    );
  };

  const selectProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllPublished = () => {
    const allPublishedIds = products
      .filter((p) => p.userId === currentUser.id && p.status === "published")
      .map((p) => p.id);
    setSelectedProductIds(allPublishedIds);
  };

  const clearSelection = () => setSelectedProductIds([]);

  return (
    <ProductContext.Provider
      value={{
        products,
        selectedProductIds,
        getCurrentUserProducts,
        getCurrentUserDrafts,
        getCurrentUserPublished,
        bulkDeleteProducts,
        toggleProductStatus,
        selectProduct,
        selectAllPublished,
        clearSelection,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be used within a ProductProvider");
  return ctx;
}
