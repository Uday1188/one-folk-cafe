export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  available: boolean;
  // UI-only fields for TemplateUI
  rating?: number;
  reviewCount?: number;
  image?: string;
  images?: string[];
  ingredients?: string[];
  prepTime?: number;
  tags?: string[];
  category?: string; // legacy category string
}

export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface Customer {
  id?: number;
  name: string;
  mobile: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  productName?: string;
  quantity: number;
  price?: number;
}

export interface Order {
  id: number;
  customer: Customer;
  tableNumber?: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderRequest {
  customerName?: string;
  customerMobile?: string;
  tableNumber: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface Notification {
  id: number;
  message: string;
  orderId: number;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CafeSettings {
  cafeName: string;
  address: string;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;
  instagramLink?: string;
  description?: string;
  ourStoryImage?: string;
  featuredProductIds?: number[];
}

export interface CafeTable {
  id: number;
  tableNumber: string;
  capacity: number;
  status: string;
}
