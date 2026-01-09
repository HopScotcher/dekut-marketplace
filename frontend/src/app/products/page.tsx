import ProductGrid from "@/components/features/ProductGrid";
import { getProducts } from "@/services/productService";

export default async function ProductsPage() {
  // Fetch all products from backend
  const { products, totalCount } = await getProducts({
    PageSize: 100,
    PageNumber: 1,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>
        <p className="text-gray-600">
          Discover our complete collection of {totalCount} amazing products
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
