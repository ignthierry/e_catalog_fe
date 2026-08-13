import { Product, Category, Banner, Order, OrderCounts } from '@/types';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import bannersData from '@/data/banners.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface DashboardData {
  stats: {
    totalProducts: number;
    totalCategories: number;
    totalBanners: number;
    totalStock: number;
    lowStockCount: number;
    totalOrders?: number;
    pendingOrders?: number;
    processingOrders?: number;
    totalRevenue?: number;
  };
  recentProducts: {
    id: string;
    name: string;
    slug?: string;
    price: number;
    stock: number;
    categoryId: string;
    categoryName: string;
    image: string;
    createdAt?: string;
  }[];
  recentOrders?: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    grandTotal: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    paymentProof?: string | null;
    itemCount: number;
    createdAt?: string;
  }[];
  categoriesSummary: {
    id: string;
    name: string;
    slug?: string;
    productCount: number;
  }[];
  settings: Record<string, string>;
  system: {
    status: string;
    database: string;
    phpVersion?: string;
    timestamp?: string;
  };
}

async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      console.warn(`API request to ${endpoint} returned status ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.warn(`Failed to connect to backend at ${API_BASE_URL}${endpoint}:`, error);
    return null;
  }
}

export const api = {
  // ==========================================
  // Public Catalog Endpoints
  // ==========================================

  // Get all products (with optional search, category, sort)
  getProducts: async (params?: { search?: string; category?: string; sort?: string }): Promise<Product[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const data = await fetchFromApi<Product[]>(`/products${queryString}`);
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    
    // Fallback to static JSON if backend unavailable
    let result = [...(productsData as Product[])];
    if (params?.category) {
      result = result.filter(p => p.categoryId === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return result;
  },
  
  // Get product by ID or Slug
  getProductById: async (id: string): Promise<Product | undefined> => {
    const data = await fetchFromApi<Product>(`/products/${id}`);
    if (data && data.id) {
      return data;
    }
    return (productsData as Product[]).find(p => p.id === id);
  },
  
  // Get featured products for homepage
  getFeaturedProducts: async (): Promise<Product[]> => {
    const data = await fetchFromApi<Product[]>('/products/featured');
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return (productsData as Product[]).filter(p => p.isNew || p.originalPrice);
  },
  
  // Get products by category
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    const data = await fetchFromApi<Product[]>(`/products?category=${categoryId}`);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return (productsData as Product[]).filter(p => p.categoryId === categoryId);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const data = await fetchFromApi<Category[]>('/categories');
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return categoriesData as Category[];
  },

  getCategoryById: async (id: string): Promise<Category | undefined> => {
    const data = await fetchFromApi<Category>(`/categories/${id}`);
    if (data && data.id) {
      return data;
    }
    return (categoriesData as Category[]).find(c => c.id === id);
  },

  // Banners
  getBanners: async (): Promise<Banner[]> => {
    const data = await fetchFromApi<Banner[]>('/banners');
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    return bannersData as Banner[];
  },

  // Settings
  getSettings: async (): Promise<Record<string, string>> => {
    const data = await fetchFromApi<Record<string, string>>('/settings');
    if (data) {
      return data;
    }
    return {
      store_name: 'OMEGA TOYS',
      store_description: 'Katalog Mainan Edukasi & Koleksi Terbaik',
      whatsapp_number: '6281234567890',
      contact_email: 'hello@omegatoys.com',
      address: 'Jakarta, Indonesia',
    };
  },

  // ==========================================
  // Auth & Customer Operations
  // ==========================================
  auth: {
    register: async (payload: { name: string; email: string; phone_number?: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    },

    login: async (credentials: { username: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    },

    getProfile: async (token: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      return await res.json();
    },
  },

  // ==========================================
  // Customer Orders Endpoints
  // ==========================================
  orders: {
    create: async (orderPayload: any, token?: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });
      return await res.json();
    },

    getMyOrders: async (token?: string | null, email?: string, phone?: string): Promise<Order[]> => {
      const query = new URLSearchParams();
      if (email) query.append('email', email);
      if (phone) query.append('phone', phone);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const headers: Record<string, string> = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/orders${queryString}`, {
        cache: 'no-store',
        headers,
      });

      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json.data) ? json.data : [];
    },

    getById: async (idOrNumber: string): Promise<Order | null> => {
      const data = await fetchFromApi<Order>(`/orders/${idOrNumber}`);
      return data;
    },

    uploadProof: async (orderId: string | number, paymentProofUrl: string) => {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/upload-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ payment_proof: paymentProofUrl }),
      });
      return await res.json();
    },
  },

  // ==========================================
  // Admin Endpoints
  // ==========================================
  admin: {
    getDashboard: async (): Promise<DashboardData | null> => {
      const data = await fetchFromApi<DashboardData>('/admin/dashboard');
      return data;
    },

    login: async (credentials: { username: string; password: string }) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    },

    // Orders Management
    getOrders: async (params?: { status?: string; search?: string }): Promise<{ orders: Order[]; counts: OrderCounts } | null> => {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE_URL}/admin/orders${queryString}`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) return null;
      const json = await res.json();
      return {
        orders: Array.isArray(json.data) ? json.data : [],
        counts: json.counts || { all: 0, pending: 0, verifying: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 },
      };
    },

    updateOrderStatus: async (orderId: string | number, data: { status?: string; payment_status?: string; awb_number?: string; courier?: string; admin_notes?: string }) => {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    },

    saveProduct: async (product: Partial<Product>) => {
      const isEdit = !!product.id && !product.id.startsWith('new-') && !product.id.startsWith('p-');
      const url = isEdit ? `${API_BASE_URL}/admin/products/${product.id}` : `${API_BASE_URL}/admin/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category_id: product.categoryId,
        images: product.images,
        variants: product.variants,
        is_active: true,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    },

    deleteProduct: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      return await res.json();
    },

    saveCategory: async (category: Partial<Category> & { id?: string | number }) => {
      const isEdit = !!category.id && !String(category.id).startsWith('c-');
      const url = isEdit ? `${API_BASE_URL}/admin/categories/${category.id}` : `${API_BASE_URL}/admin/categories`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        name: category.name,
        image: category.image || null,
        parent_id: category.parentId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    },

    deleteCategory: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      return await res.json();
    },

    saveBanner: async (banner: Partial<Banner>) => {
      const isEdit = !!banner.id && !banner.id.startsWith('b-');
      const url = isEdit ? `${API_BASE_URL}/admin/banners/${banner.id}` : `${API_BASE_URL}/admin/banners`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image,
        link: banner.link || '/products',
        is_active: true,
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    },

    deleteBanner: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      return await res.json();
    },

    saveSettings: async (settings: Record<string, any>) => {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await res.json();
    },

    uploadImage: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData,
      });
      return await res.json();
    }
  }
};
