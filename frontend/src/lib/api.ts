import { api } from './axios';
import { Category, Product, ApiResponse, Order, OrderRequest, CafeSettings, Notification, CafeTable } from '@/types';
import { STATIC_PRODUCTS, STATIC_CATEGORIES } from '@/data/products';

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<ApiResponse<Category[]>>('/categories', { timeout: 2500 });
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data.map(c => {
        const match = STATIC_CATEGORIES.find(sc => sc.name.toLowerCase() === c.name.toLowerCase());
        return {
          ...c,
          image: c.image && !c.image.endsWith('.jpg') ? c.image : (match?.image || c.image)
        };
      });
    }
  } catch (e) {
    // Static fallback for customer website
  }
  return STATIC_CATEGORIES as any;
};

export const createCategory = async (category: Partial<Category>) => {
  const response = await api.post('/categories', category);
  return response.data.data;
};

export const updateCategory = async (id: number, category: Partial<Category>) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data.data;
};

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<ApiResponse<Product[]>>('/products', { timeout: 2500 });
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data.map(p => {
        const match = STATIC_PRODUCTS.find(sp => sp.name.toLowerCase() === p.name.toLowerCase() || sp.id === p.id);
        const img = p.imageUrl || match?.image || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop";
        return {
          ...p,
          imageUrl: img,
          image: img,
          images: [img],
          description: p.description || match?.description || "Freshly prepared to order."
        };
      });
    }
  } catch (e) {
    // Static fallback for customer website
  }
  return STATIC_PRODUCTS as any;
};

export const fetchProductById = async (id: number): Promise<Product> => {
  try {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`, { timeout: 2500 });
    if (response.data && response.data.data) {
      const p = response.data.data;
      const match = STATIC_PRODUCTS.find(sp => sp.id === p.id || sp.name.toLowerCase() === p.name.toLowerCase());
      const img = p.imageUrl || match?.image || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop";
      return {
        ...p,
        imageUrl: img,
        image: img,
        images: [img],
        description: p.description || match?.description || "Freshly prepared to order."
      };
    }
  } catch (e) {
    // Static fallback for customer website
  }
  const match = STATIC_PRODUCTS.find(sp => sp.id === Number(id));
  if (match) return match as any;
  return STATIC_PRODUCTS[0] as any;
};

export const createOrder = async (order: OrderRequest): Promise<Order> => {
  const response = await api.post<ApiResponse<Order>>('/orders', order);
  return response.data.data;
};

export const adminLogin = async (credentials: { username: string; password: string }) => {
  const response = await api.post<ApiResponse<{ token: string; username: string; role: string }>>('/auth/login', credentials);
  return response.data.data;
};

export interface OrderFilters {
  page?: number;
  size?: number;
  status?: string;
  paymentStatus?: string;
  tableNumber?: string;
  startDate?: string;
  endDate?: string;
}

export const fetchOrders = async (filters: OrderFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());
  if (filters.status && filters.status !== 'all') params.append('status', filters.status.toUpperCase());
  if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus.toUpperCase());
  if (filters.tableNumber && filters.tableNumber !== 'all') params.append('tableNumber', filters.tableNumber);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  const response = await api.get(`/orders?${params.toString()}`);
  return response.data.data.content || response.data.data;
};

export const fetchOrderCounts = async (params?: { tableNumber?: string; startDate?: string; endDate?: string }): Promise<Record<string, number>> => {
  const response = await api.get<ApiResponse<Record<string, number>>>('/orders/counts', { params });
  return response.data.data;
};

export const updateOrderStatus = async (id: number, status: string) => {
  const response = await api.patch(`/orders/${id}/status?status=${status}`);
  return response.data.data;
};

export const updateOrderPaymentStatus = async (id: number, paymentStatus: string, paymentMethod?: string) => {
  const response = await api.patch(`/orders/${id}/payment-status`, { paymentStatus, paymentMethod });
  return response.data.data;
};

export const updateOrder = async (id: number, order: OrderRequest): Promise<Order> => {
  const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, order);
  return response.data.data;
};

export const fetchOrderById = async (id: number): Promise<Order> => {
  const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return response.data.data;
};

export const fetchDashboardMetrics = async (filter: string = 'monthly') => {
  const response = await api.get(`/analytics/dashboard?filter=${filter}`);
  return response.data.data;
};

export const fetchTopProductsByRevenue = async (filter: string = 'monthly', limit: number = 10) => {
  const response = await api.get(`/analytics/top-categories?filter=${filter}&limit=${limit}`);
  return response.data.data;
};

export const fetchTopProducts = async () => {
  const response = await api.get('/analytics/top-products');
  return response.data.data;
};

export const createProduct = async (product: Partial<Product & { categoryId: number }>) => {
  const response = await api.post('/products', product);
  return response.data.data;
};

export const updateProduct = async (id: number, product: Partial<Product & { categoryId: number }>) => {
  const response = await api.put(`/products/${id}`, product);
  return response.data.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const deleteOrder = async (id: number) => {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
};

export const fetchSettings = async (): Promise<CafeSettings> => {
  try {
    const response = await api.get<ApiResponse<CafeSettings>>('/settings', { timeout: 2500 });
    if (response.data && response.data.data) {
      return response.data.data;
    }
  } catch (e) {
    // Static fallback
  }
  return {
    cafeName: 'One Folk Cafe',
    address: 'Nashik, Maharashtra',
    phone: '9322331131',
    email: 'hello@onefolkcafe.in',
    openTime: '08:00',
    closeTime: '22:00',
    instagramLink: 'https://instagram.com/onefolkcafe',
    description: 'Crafting artisanal coffees, signature pizzas and cherished memories in Nashik.',
    featuredProductIds: [1, 6, 12, 17]
  };
};

export const updateSettings = async (settings: CafeSettings): Promise<CafeSettings> => {
  const response = await api.put<ApiResponse<CafeSettings>>('/settings', settings);
  return response.data.data;
};

export const uploadGalleryImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ApiResponse<string>>('/settings/upload-gallery-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
};

export const registerCustomer = async (data: { name: string; mobile: string }) => {
  const response = await api.post('/customers', data);
  return response.data.data;
};

export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<Notification[]>('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id: number) => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await api.patch('/notifications/read-all');
};

export const fetchTables = async (): Promise<CafeTable[]> => {
  const response = await api.get<CafeTable[]>('/tables');
  return response.data;
};

export const fetchBackupInfo = async () => {
  const response = await api.get<ApiResponse<{ path: string; exists: boolean; sizeBytes: number; lastModified: string | null }>>('/admin/backup/info');
  return response.data.data;
};

export const exportPublicMenu = async () => {
  const response = await api.post<ApiResponse<{ filePath: string; publishedAt: string; categoriesCount: number; productsCount: number }>>('/admin/publish-menu/export-local');
  return response.data.data;
};

