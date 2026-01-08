/* eslint-disable @typescript-eslint/no-unused-vars */

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  showOwnerActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductCard({
  product,
  showOwnerActions = false,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {product.categoryName}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              KSh {product.price.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>

      {showOwnerActions && (
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              onEdit?.();
            }}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.preventDefault();
              onDelete?.();
            }}
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
