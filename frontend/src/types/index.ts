// ==========================================
// SPORTIKA - TypeScript Type Definitions
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  category: 'men' | 'women' | 'unisex';
  subcategory: 'tshirts' | 'shorts' | 'jackets' | 'track-pants' | 'shoes' | 'accessories';
  sport?: string;
  images: string[];
  price: number;
  originalPrice: number;
  discount: number;
  sizes: ProductSize[];
  colors: ProductColor[];
  rating: number;
  reviewCount: number;
  stock: number;
  sold: number;
  tags: string[];
  featured: boolean;
  newArrival: boolean;
  bestseller: boolean;
  active: boolean;
  createdAt: string;
}

export interface ProductSize {
  size: string;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  payment: OrderPayment;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  notes?: string;
  tracking?: OrderTracking[];
  createdAt: string;
  updatedAt: string;
  expectedDelivery?: string;
}

export interface OrderItem {
  productId: string;
  product: Product;
  name: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  originalPrice: number;
}

export interface OrderPayment {
  method: 'razorpay' | 'upi' | 'cod';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  upiTransactionId?: string;
  paidAt?: string;
  amount: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export interface OrderTracking {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface Review {
  id: string;
  userId: string;
  user: Pick<User, 'name' | 'avatar'>;
  productId: string;
  rating: number;
  title: string;
  body: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'men' | 'women' | 'unisex';
  description: string;
  image: string;
  productCount: number;
}

export interface FilterState {
  category: string;
  subcategory: string;
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
  rating: number;
  sort: SortOption;
  search: string;
  inStock: boolean;
  onSale: boolean;
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'bestselling';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Admin types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
  recentOrders: Order[];
  topProducts: Array<{ product: Product; sold: number; revenue: number }>;
  salesChart: Array<{ date: string; revenue: number; orders: number }>;
}

export interface AdminProduct extends Product {
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'order' | 'review' | 'stock' | 'user';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
