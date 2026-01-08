"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "createdAt|desc", label: "Newest First" },
  { value: "createdAt|asc", label: "Oldest First" },
  { value: "price|asc", label: "Price: Low to High" },
  { value: "price|desc", label: "Price: High to Low" },
  { value: "name|asc", label: "Name: A to Z" },
  { value: "name|desc", label: "Name: Z to A" },
];

export default function SearchSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current sort from URL
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const isDescending = searchParams.get("isDescending") === "true";
  const currentSort = `${sortBy}|${isDescending ? "desc" : "asc"}`;

  const handleSortChange = (value: string) => {
    const [newSortBy, direction] = value.split("|");
    const params = new URLSearchParams(searchParams.toString());

    params.set("sortBy", newSortBy);
    params.set("isDescending", direction === "desc" ? "true" : "false");

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Sort by:</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
