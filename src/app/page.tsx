/* eslint-disable @typescript-eslint/no-unused-vars */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ProductGrid from '@/components/features/ProductGrid';
import CategoryGrid from '@/components/features/CategoryGrid';
import SearchBar from '@/components/common/SearchBar';
import { mockProducts, mockCategories } from '@/data/mock-data';
import Link from 'next/link';
import { ArrowRight, Star, Shield, Truck } from 'lucide-react';

export default function HomePage() {
  // Get featured products (first 4)
  const featuredProducts = mockProducts.slice(0, 4);
  
  // Get featured categories (first 3)
  const featuredCategories = mockCategories.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Amazing Products
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Shop from thousands of trusted sellers and find exactly what youre looking for
          </p>
          <div className="max-w-md mx-auto mb-8">
            <SearchBar placeholder="What are you looking for?" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/products">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/sell">Sell</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure Shopping</h3>
              <p className="text-gray-600">Your data and payments are protected with industry-leading security</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping to your doorstep</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
              <p className="text-gray-600">Carefully curated products from trusted sellers</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <Button variant="outline" asChild>
            <Link href="/categories">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CategoryGrid categories={featuredCategories} />
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <Button variant="outline" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <ProductGrid products={mockProducts} />
      </section>
    </div>
  );
}