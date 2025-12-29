import ProductGrid from '@/components/features/ProductGrid';
import { mockProducts } from '@/data/mock-data';
 

export default function ProductsPage() {
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Products</h1>
        <p className="text-gray-600">
          Discover our complete collection of  amazing products
          {/* how to get the product length */}
        </p>
      </div>
      <ProductGrid />
    </div>
  );
}