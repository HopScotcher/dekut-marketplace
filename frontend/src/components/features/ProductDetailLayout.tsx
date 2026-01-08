/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React from "react";
import { Star, MapPin, Calendar, Tag, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/types";
import { isAuthenticated } from "@/services/authService";
import { useRouter } from "next/navigation";

interface ProductDetailLayoutProps {
  product: Product;
}

// SellerInfoCard component
function SellerInfoCard({
  sellerId,
  sellerName,
}: {
  sellerId: string;
  sellerName: string;
}) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleContactSeller = () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }
    // For MVP: Just show alert with seller info
    // TODO: Implement proper messaging system
    alert(`Contact seller: ${sellerName}\nSeller ID: ${sellerId}`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold text-gray-600">
              {sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{sellerName}</h3>
            </div>
          </div>

          <div className="space-y-2">
            <Button className="w-full" size="sm" onClick={handleContactSeller}>
              {isLoggedIn ? "Contact Seller" : "Sign In to Contact"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => router.push(`/user/${sellerId}`)}
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ProductHeader component
function ProductHeader({ product }: { product: Product }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{product.categoryName}</Badge>
        <Badge variant="outline">{product.condition}</Badge>
        {product.negotiable && (
          <Badge variant="default" className="bg-green-600">
            Negotiable
          </Badge>
        )}
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>{product.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// ProductImageCarousel component
function ProductImageCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [currentImage, setCurrentImage] = React.useState(0);

  // Handle case where images array is empty
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
        <img
          src={images[currentImage]}
          alt={`${title} - Image ${currentImage + 1}`}
          className="w-full h-full object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentImage ? "border-blue-500" : "border-gray-200"
              }`}
            >
              <img
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ProductPrice component
function ProductPrice({
  price,
  negotiable,
}: {
  price: number;
  negotiable: boolean;
}) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleMakeOffer = () => {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }
    // For MVP: Just show alert
    // TODO: Implement proper offer system
    alert("Make an offer feature coming soon!");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Tag className="h-5 w-5 text-green-600" />
        <span className="text-3xl font-bold text-green-600">
          KSh {price.toLocaleString("en-KE")}
        </span>
      </div>
      {negotiable && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">Price is negotiable</p>
          <Button variant="outline" size="sm" onClick={handleMakeOffer}>
            Make an Offer
          </Button>
        </div>
      )}
    </div>
  );
}

// ProductDescription component
function ProductDescription({
  description,
  tags,
}: {
  description: string;
  tags: string[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {description}
        </p>
      </div>

      {tags && tags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main ProductDetailLayout component
export default function ProductDetailLayout({
  product,
}: ProductDetailLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column - Seller Info */}
      <div className="lg:col-span-1">
        <SellerInfoCard
          sellerId={product.sellerId}
          sellerName={product.sellerName}
        />
      </div>

      {/* Right column - Product Content */}
      <div className="lg:col-span-2 space-y-6">
        <ProductHeader product={product} />
        <ProductImageCarousel images={product.images} title={product.name} />
        <ProductPrice price={product.price} negotiable={product.negotiable} />
        <ProductDescription
          description={product.description}
          tags={product.tags}
        />
      </div>
    </div>
  );
}
