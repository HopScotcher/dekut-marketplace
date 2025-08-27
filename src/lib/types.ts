// Product related types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  condition: 'new' | 'used' | 'refurbished';
  // inStock: boolean;
  // stockQuantity: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  location?: string; // Optional location for the product
  user: {
    id: string;
    name: string;
    avatar: string;
    // rating: number;
    // reviewCount: number;
  };
  status: 'draft' | 'published';  
  userId: string;  
}

// User related types (mock user)
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// Category related types
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  parentId?: string;
  slug: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
}

// Order related types
export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  deliveryDate?: string;
}

// Address type
export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Search related types
export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}

export interface SearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: SearchFilters;
}