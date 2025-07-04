/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React from 'react';
import { Star, MapPin, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
 
interface ProductDetailLayoutProps {
  product: Product;
}

// SellerInfoCard component
function SellerInfoCard({ seller }: { seller: Product['seller'] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <img
              src={seller.avatar}
              alt={seller.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-lg">{seller.name}</h3>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{seller.rating}</span>
                <span className="text-sm text-gray-500">({seller.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button className="w-full" size="sm">
              Contact Seller
            </Button>
            <Button variant="outline" className="w-full" size="sm">
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
        <Badge variant="secondary">{product.category}</Badge>
        <Badge variant="outline">{product.condition}</Badge>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        {/* <div className="flex items-center space-x-1">
          <MapPin className="h-4 w-4" />
          <span>{product.location}</span>
        </div> */}
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>Listed {new Date(product.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// ProductImageCarousel component
function ProductImageCarousel({ images, title }: { images: string[]; title: string }) {
  const [currentImage, setCurrentImage] = React.useState(0);

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
        <img
          src={images[currentImage]}
          alt={`${title} - Image ${currentImage + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentImage ? 'border-blue-500' : 'border-gray-200'
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
function ProductPrice({ price }: { price: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Tag className="h-5 w-5 text-green-600" />
        <span className="text-3xl font-bold text-green-600">
          ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <p className="text-sm text-gray-500">Free shipping available</p>
    </div>
  );
}

// ProductDescription component
function ProductDescription({ description }: { description: string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Description</h2>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

// ProductCTA component
function ProductCTA() {
  return (
    <div className="space-y-3">
      <div className="flex space-x-3">
        <Button className="flex-1" size="lg">
          Contact Seller
        </Button>
         
      </div>
      <Button variant="ghost" className="w-full" size="sm">
        Add to Wishlist
      </Button>
    </div>
  );
}

// Main ProductDetailLayout component
export default function ProductDetailLayout({ product }: ProductDetailLayoutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left column - Seller Info */}
      <div className="lg:col-span-1">
        <SellerInfoCard seller={product.seller} />
      </div>

      {/* Right column - Product Content */}
      <div className="lg:col-span-2 space-y-6">
        <ProductHeader product={product} />
        <ProductImageCarousel images={product.images} title={product.name} />
        <ProductPrice price={product.price} />
        <ProductDescription description={product.description} />
        <ProductCTA />
      </div>
    </div>
  );
}