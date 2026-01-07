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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { CreateProductDto, ProductCondition, CategoryDto } from "@/lib/types";
import { uploadProductImages, createProduct } from "@/services/productService";
import { getStoredUser } from "@/services/authService";
import { getAllCategories } from "@/services/categoryService";

// Predefined categories
// const CATEGORIES = [
//   { id: 'electronics', name: 'Electronics' },
//   { id: 'clothing', name: 'Clothing & Fashion' },
//   { id: 'home', name: 'Home & Garden' },
//   { id: 'sports', name: 'Sports & Recreation' },
//   { id: 'books', name: 'Books & Media' },
// ] as const

// Mock current user
const MOCK_USER = {
  id: "user-123",
  name: "John Doe",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  rating: 4.8,
  reviewCount: 127,
};

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
  brand: z.string().optional(),
  tags: z.string().optional(),
  negotiable: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export default function ProductCreateForm() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    "draft" | "published" | null
  >(null);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const router = useRouter();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories", {
          description: "Please refresh the page to try again.",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      location: "",
      category: "",
      condition: "Used",
      brand: "",
      tags: "",
      negotiable: true,
    },
  });

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      // Check file type
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload only JPG, JPEG, or PNG images.",
        });
        return false;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload images smaller than 5MB.",
        });
        return false;
      }

      return true;
    });

    // Check total image limit
    if (images.length + validFiles.length > 5) {
      toast.error("Too many images", {
        description: "Upload a maximum 5 images.",
      });
      return;
    }

    // Process files - no base64 conversion needed
    const newImages: ImageFile[] = validFiles.map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      // Clean up preview URLs
      const removed = prev.find((img) => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  // Enhanced submission handler
  const handleSubmit = async (
    data: ProductFormData,
    status: "draft" | "published"
  ) => {
    if (images.length === 0) {
      toast.error("Images required", {
        description: "Please upload at least one image.",
      });
      return;
    }

    // Check if user is logged in
    const user = getStoredUser();
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to create a product.",
      });
      router.push("/auth/signin?callbackUrl=/sell");
      return;
    }

    setIsSubmitting(true);
    setCurrentStatus(status);

    try {
      // Step 1: Upload images to backend
      toast.info("Uploading images...", {
        description: "Please wait while we upload your images.",
      });

      const imageFiles = images.map((img) => img.file);
      const imageUrls = await uploadProductImages(imageFiles);

      // Step 2: Create product via backend API
      const productData: CreateProductDto = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        location: data.location,
        categoryId: data.category,
        negotiable: data.negotiable,
        images: JSON.stringify(imageUrls),
        tags: data.tags
          ? JSON.stringify(
              data.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            )
          : "[]",
        condition: data.condition as unknown as ProductCondition,
      };

      const createdProduct = await createProduct(productData);

      if (status === "published") {
        toast.success("Product listed successfully!", {
          description: "Your item has been added to the marketplace.",
        });
        router.push(`/products/${createdProduct.id}`);
      } else {
        toast.success("Draft saved!", {
          description: "Your product draft has been saved.",
        });
        router.push("/user/dashboard");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      toast.error("Product was not listed!", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
      setCurrentStatus(null);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-8">
        {/* Images Upload Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Product Images</Label>
          {/* Upload Zone */}
          <div className="relative">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Click to upload</span> or drag
                  and drop
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, JPEG up to 5MB (max 5 images)
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => handleFileUpload(e.target.files)}
                tabIndex={-1}
                style={{ zIndex: 2 }}
              />
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt="Product preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show current status if editing (future-proof) */}
        {currentStatus && (
          <div className="text-sm text-gray-600">
            Current status:{" "}
            <span className="font-semibold">{currentStatus}</span>
          </div>
        )}

        {/* Product Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
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
                  placeholder="Describe your item in detail..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price and Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      KSh
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-12"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectValue
                      placeholder={
                        isLoadingCategories
                          ? "Loading categories..."
                          : "Select a category"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.parentCategoryName
                        ? `${category.parentCategoryName} > ${category.name}`
                        : category.name}
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
            <FormItem className="space-y-3">
              <FormLabel>Condition *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="New" id="new" />
                    <Label htmlFor="new">New</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Used" id="used" />
                    <Label htmlFor="used">Used</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Refurbished" id="refurbished" />
                    <Label htmlFor="refurbished">Refurbished</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand */}
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter brand name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags separated by commas"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Negotiable */}
        <FormField
          control={form.control}
          name="negotiable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Price is negotiable</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {/* Dual Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit((data) => handleSubmit(data, "draft"))}
            variant="secondary"
          >
            {isSubmitting && currentStatus === "draft"
              ? "Saving..."
              : "Save as Draft"}
          </Button>
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={form.handleSubmit((data) =>
              handleSubmit(data, "published")
            )}
          >
            {isSubmitting && currentStatus === "published"
              ? "Publishing..."
              : "Publish Now"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
