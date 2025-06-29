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
}

export default function ProductCard({
  product,
  showOwnerActions = false,
}: ProductCardProps) {
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

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
          {discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-500 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {showOwnerActions && (
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex-1">
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
