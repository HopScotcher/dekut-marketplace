import CategoryGrid from "@/components/features/CategoryGrid";
import { getAllCategories } from "@/services/categoryService";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Categories</h1>
        <p className="text-gray-600">
          Browse through our {categories.length} product categories
        </p>
      </div>
      <CategoryGrid categories={categories} />
    </div>
  );
}
