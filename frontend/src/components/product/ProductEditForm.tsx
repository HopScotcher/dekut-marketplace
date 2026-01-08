/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  Product,
  UpdateProductDto,
  ProductCondition,
  ProductStatus,
  CategoryDto,
} from "@/lib/types";
import { uploadProductImages, updateProduct } from "@/services/productService";
import { getAllCategories } from "@/services/categoryService";

// Form validation schema
const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(200, "Name must be less than 200 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Price must be a valid positive number"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),
  category: z.string().min(1, "Please select a category"),
  condition: z.enum(["New", "Used", "Refurbished"], {
    required_error: "Please select a condition",
  }),
  tags: z.string().optional(),
  negotiable: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  isExisting: boolean;
}

interface ProductEditFormProps {
  product: Product;
}

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      location: product.location,
      category: product.categoryId,
      condition: product.condition,
      tags: product.tags.join(", "),
      negotiable: product.negotiable,
    },
  });

  // Load existing images
  useEffect(() => {
    const existingImages: ImageFile[] = product.images.map((url, index) => ({
      id: `existing-${index}`,
      preview: url,
      isExisting: true,
    }));
    setImages(existingImages);
  }, [product.images]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle image file selection
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageFile[] = Array.from(files).map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length === 0) {
      toast.error("Please drop image files only");
      return;
    }

    const newImages: ImageFile[] = files.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Remove image from selection
  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed && !removed.isExisting) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  // Handle form submission
  const handleSubmit = async (data: ProductFormData, status: ProductStatus) => {
    if (images.length === 0) {
      toast.error("Images required", {
        description: "Please upload at least one image.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload new images if any
      const newImages = images.filter((img) => !img.isExisting && img.file);
      const existingImageUrls = images
        .filter((img) => img.isExisting)
        .map((img) => img.preview);

      let uploadedImageUrls: string[] = [];
      if (newImages.length > 0) {
        toast.info("Uploading new images...", {
          description: "Please wait while we upload your images.",
        });
        const imageFiles = newImages.map((img) => img.file!);
        uploadedImageUrls = await uploadProductImages(imageFiles);
      }

      // Combine existing and new image URLs
      const allImageUrls = [...existingImageUrls, ...uploadedImageUrls];

      // Step 2: Update product via backend API
      const updateData: UpdateProductDto = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        location: data.location,
        categoryId: data.category,
        negotiable: data.negotiable,
        images: JSON.stringify(allImageUrls),
        tags: data.tags
          ? JSON.stringify(
              data.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          : "[]",
        condition: data.condition as unknown as ProductCondition,
        status: status,
      };

      await updateProduct(product.id, updateData);

      toast.success("Product updated successfully!", {
        description: "Your changes have been saved.",
      });

      if (status === "Published") {
        router.push(`/products/${product.id}`);
      } else {
        router.push("/user/dashboard");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      toast.error("Failed to update product!", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get hierarchical category display name
  const getCategoryDisplayName = (category: CategoryDto): string => {
    if (category.parentCategoryName) {
      return `${category.parentCategoryName} > ${category.name}`;
    }
    return category.name;
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-gray-500">
            Update your product details and images
          </p>
        </div>

        {/* Images Upload Section */}
        <div className="space-y-4">
          <FormLabel>Product Images *</FormLabel>

          {/* Image Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={image.preview}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary/50"
            }`}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="images" className="cursor-pointer">
                <span className="text-primary hover:text-primary/80 font-medium">
                  Upload images
                </span>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">
                or drag and drop PNG, JPG up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* Product Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., iPhone 13 Pro Max 256GB" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your product in detail..."
                  className="min-h-[150px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Condition Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingCategories}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {getCategoryDisplayName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Condition */}
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Used">Used</SelectItem>
                    <SelectItem value="Refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Price and Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (KSh) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter price"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Nairobi, Kenya" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., wireless, bluetooth, portable (comma-separated)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Negotiable Checkbox */}
        <FormField
          control={form.control}
          name="negotiable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Price is negotiable</FormLabel>
                <p className="text-sm text-gray-500">
                  Allow buyers to make offers below your asking price
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/user/dashboard")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={form.handleSubmit((data) =>
              handleSubmit(data, "Draft" as ProductStatus)
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={form.handleSubmit((data) =>
              handleSubmit(data, "Published" as ProductStatus)
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
