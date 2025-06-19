import { Product, Category, Order } from '@/lib/types';

// Mock Categories
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Electronics',
    description: 'Latest electronic devices and accessories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    slug: 'electronics',
    productCount: 156,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
    
  },
  {
    id: 'cat-2',
    name: 'Clothing',
    description: 'Fashion and apparel for all occasions',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    slug: 'clothing',
    productCount: 234,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-3',
    name: 'Home & Garden',
    description: 'Everything for your home and garden',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    slug: 'home-garden',
    productCount: 89,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-4',
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    slug: 'sports-outdoors',
    productCount: 67,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'cat-5',
    name: 'Books',
    description: 'Books across all genres and topics',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    slug: 'books',
    productCount: 123,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z'
  }
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 199.99,
    originalPrice: 299.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'
    ],
    category: 'Electronics',
    categoryId: 'cat-1',
    brand: 'AudioTech',
    condition: "new",
    rating: 4.5,
    reviewCount: 128,
    // inStock: true,
    // stockQuantity: 45,
    tags: ['wireless', 'bluetooth', 'noise-cancelling', 'headphones'],
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-01-25T14:20:00Z',
    seller: {
      id: 'seller-001',
      name: 'TechStore Pro',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 2456
    }
  },
  {
    id: 'prod-2',
    name: 'Classic Cotton T-Shirt',
    description: 'Comfortable and stylish cotton t-shirt available in multiple colors.',
    price: 24.99,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1583743814966-8936f37f4036?w=400'
    ],
    category: 'Clothing',
    categoryId: 'cat-2',
    brand: 'ComfortWear',
    rating: 4.2,
    reviewCount: 89,
    // inStock: true,
    // stockQuantity: 120,
    condition: "used",
    tags: ['cotton', 't-shirt', 'casual', 'comfortable'],
    createdAt: '2024-01-18T12:15:00Z',
    updatedAt: '2024-01-22T09:45:00Z',
    seller: {
      id: 'seller-002',
      name: 'Techy',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 2456
    }
  },
  {
    id: 'prod-3',
    name: 'Smart Home Security Camera',
    description: '1080p HD security camera with night vision and mobile app control.',
    price: 89.99,
    originalPrice: 129.99,
    images: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      'https://images.unsplash.com/photo-1574613918121-2c17c2e7e3e5?w=400'
    ],
    category: 'Electronics',
    categoryId: 'cat-1',
    brand: 'SecureHome',
    rating: 4.7,
    reviewCount: 203,
    // inStock: true,
    // stockQuantity: 28,
     condition: "refurbished",
    tags: ['security', 'camera', 'smart-home', '1080p'],
    createdAt: '2024-01-19T16:20:00Z',
    updatedAt: '2024-01-24T11:30:00Z',
    seller: {
      id: 'seller-003',
      name: 'FashionHub',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 2456
    }
  },
  {
    id: 'prod-4',
    name: 'Ceramic Plant Pot Set',
    description: 'Beautiful set of 3 ceramic plant pots with drainage holes.',
    price: 34.99,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'
    ],
    category: 'Home & Garden',
    categoryId: 'cat-3',
    brand: 'GreenThumb',
    rating: 4.3,
    reviewCount: 67,
    // inStock: true,
    // stockQuantity: 85,
    condition: "new",
    tags: ['ceramic', 'plant-pot', 'garden', 'set'],
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-21T10:00:00Z',
    seller: {
      id: 'seller-004',
      name: 'HomeDecor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 2456
    }
  },
  {
    id: 'prod-5',
    name: 'Professional Tennis Racket',
    description: 'High-performance tennis racket for professional and amateur players.',
    price: 159.99,
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
      'https://images.unsplash.com/photo-1544737151750-6ef4b9ce71cc?w=400'
    ],
    category: 'Sports & Outdoors',
    categoryId: 'cat-4',
    brand: 'ProSport',
    rating: 4.6,
    reviewCount: 45,
    // inStock: true,
    // stockQuantity: 15,
     condition: "refurbished",
    tags: ['tennis', 'racket', 'professional', 'sports'],
    createdAt: '2024-01-22T14:30:00Z',
    updatedAt: '2024-01-23T08:15:00Z',
    seller: {
      id: 'seller-005',
      name: 'Sporty',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 2456
    }
  },
  {
    id: 'prod-6',
    name: 'JavaScript Programming Guide',
    description: 'Complete guide to modern JavaScript programming with practical examples.',
    price: 39.99,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
    ],
    category: 'Books',
    categoryId: 'cat-5',
    brand: 'TechBooks',
    rating: 4.8,
    reviewCount: 312,
    // inStock: true,
    // stockQuantity: 50,
     condition: "new",
    tags: ['javascript', 'programming', 'guide', 'book'],
    createdAt: '2024-01-17T09:45:00Z',
    updatedAt: '2024-01-20T13:20:00Z',
    seller: {
      id: 'seller-006',
      name: 'BookWorld',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 2456
    }
  }
];

// Mock Orders (just a few examples)
export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        product: mockProducts[0],
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99
      }
    ],
    totalAmount: 199.99,
    status: 'delivered',
    shippingAddress: {
      id: 'addr-1',
      street: '123 Main St',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00100',
      country: 'Kenya'
    },
    billingAddress: {
      id: 'addr-1',
      street: '123 Main St',
      city: 'Nairobi',
      state: 'Nairobi County',
      postalCode: '00100',
      country: 'Kenya'
    },
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    deliveryDate: '2024-01-18T16:45:00Z'
  }
];