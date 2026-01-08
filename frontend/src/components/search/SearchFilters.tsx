"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { getAllCategories } from "@/services/categoryService";
import { CategoryDto } from "@/lib/types";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state from URL params
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [condition, setCondition] = useState(
    searchParams.get("condition") || ""
  );
  const [location, setLocation] = useState(searchParams.get("location") || "");

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update or remove params based on values
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (category) params.set("category", category);
    else params.delete("category");

    if (condition) params.set("condition", condition);
    else params.delete("condition");

    if (location) params.set("location", location);
    else params.delete("location");

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setCategory("");
    setCondition("");
    setLocation("");

    const params = new URLSearchParams(searchParams.toString());
    const query = params.get("q");

    if (query) {
      router.push(`/search?q=${query}`);
    } else {
      router.push("/search");
    }
  };

  const hasActiveFilters =
    minPrice || maxPrice || category || condition || location;

  return (
    <div className="bg-white rounded-lg border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-primary hover:text-primary/80"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range (KES)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Category</Label>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading categories...</p>
        ) : (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.parentCategoryId && "— "}
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Separator />

      {/* Condition */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Condition</Label>
        <RadioGroup value={condition} onValueChange={setCondition}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="all" />
            <Label htmlFor="all" className="font-normal cursor-pointer">
              All Conditions
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="New" id="new" />
            <Label htmlFor="new" className="font-normal cursor-pointer">
              New
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Used" id="used" />
            <Label htmlFor="used" className="font-normal cursor-pointer">
              Used
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Refurbished" id="refurbished" />
            <Label htmlFor="refurbished" className="font-normal cursor-pointer">
              Refurbished
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Input
          type="text"
          placeholder="Enter location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <Separator />

      {/* Apply Button */}
      <Button onClick={updateFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  );
}
