import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryDto } from "@/lib/types";

interface CategoryCardProps {
  category: CategoryDto;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-0">
          {/* Category Icon */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <div className="text-6xl">{category.icon || "📦"}</div>
          </div>

          {/* Category Info */}
          <div className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xl group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <Badge variant="secondary">
                {category.productCount} products
              </Badge>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">
              {category.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
