import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl">Marketplace</span>
            </div>
            <p className="text-sm text-gray-600 max-w-xs">
              Your trusted online marketplace for quality products from verified sellers.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/products" className="text-sm text-gray-600 hover:text-primary transition-colors">
                All Products
              </Link>
              <Link href="/categories" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/search" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Search
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Customer Service</h3>
            <div className="flex flex-col space-y-2">
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Help Center
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Shipping Info
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Returns
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <div className="flex flex-col space-y-2">
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-600">
            © 2024 Marketplace. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">Follow us:</p>
            {/* Social media links would go here */}
          </div>
        </div>
      </div>
    </footer>
  );
}