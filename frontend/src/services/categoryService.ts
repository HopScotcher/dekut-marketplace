/**
 * Category Service - Calls .NET Backend API
 * All category-related operations now go through the .NET API
 */
import { api } from "@/lib/apiClient";
import { CategoryDto } from "@/lib/types";

/**
 * Get all categories (hierarchical structure with parent and sub-categories)
 * @returns Promise<CategoryDto[]>
 */
export async function getAllCategories(): Promise<CategoryDto[]> {
  return api.get<CategoryDto[]>("/api/categories");
}

/**
 * Get category by ID
 * @param categoryId - Category ID
 * @returns Promise<CategoryDto>
 */
export async function getCategoryById(
  categoryId: string
): Promise<CategoryDto> {
  return api.get<CategoryDto>(`/api/categories/${categoryId}`);
}

/**
 * Get only parent categories (no subcategories)
 * @returns Promise<CategoryDto[]>
 */
export async function getParentCategories(): Promise<CategoryDto[]> {
  const allCategories = await getAllCategories();
  return allCategories.filter((cat) => !cat.parentCategoryId);
}

/**
 * Get subcategories for a specific parent
 * @param parentId - Parent category ID
 * @returns Promise<CategoryDto[]>
 */
export async function getSubcategories(
  parentId: string
): Promise<CategoryDto[]> {
  const allCategories = await getAllCategories();
  return allCategories.filter((cat) => cat.parentCategoryId === parentId);
}
