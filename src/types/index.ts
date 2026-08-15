export interface VariantItem {
  id?: string;
  name: string;
  additionalPrice?: number;
  price?: number;
  stock?: number;
}

export interface Variant {
  id: string;
  name: string;
  options: string[];
  items?: VariantItem[];
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  isNew?: boolean;
  stock: number;
  rating?: number;
  soldCount?: number;
  sold?: number;
  variants?: Variant[];
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  image?: string;
  parentId?: string | null;
  productCount?: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link: string;
  order?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
  /** ProductVariant id of the selected variant option (for stock deduction) */
  variantId?: string | null;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  phoneNumber?: string;
  phone_number?: string;
  avatar?: string;
  avatarUrl?: string;
  avatar_url?: string;
  role: 'admin' | 'customer' | 'warehouse' | 'cs';
  address?: string;
  provinceId?: string | number;
  province_id?: string | number;
  provinceName?: string;
  province_name?: string;
  cityId?: string | number;
  city_id?: string | number;
  cityName?: string;
  city_name?: string;
  subdistrictId?: string | number;
  subdistrict_id?: string | number;
  subdistrictName?: string;
  subdistrict_name?: string;
  postalCode?: string;
  postal_code?: string;
  createdAt?: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug?: string;
  variantName?: string | null;
  image: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'verifying' | 'paid' | 'rejected' | 'failed';

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  shippingCost: number;
  grandTotal: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentProof?: string | null;
  courier: string;
  awbNumber?: string | null;
  shippingAddress: string;
  notes?: string | null;
  adminNotes?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  items: OrderItem[];
}

export interface OrderCounts {
  all: number;
  pending: number;
  verifying: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
}

export interface ActivityLog {
  id: number | string;
  user_id?: number | string | null;
  user_name: string;
  user_email?: string | null;
  user_role: string;
  action: string;
  description: string;
  ip_address: string;
  user_agent?: string | null;
  device: string;
  properties?: Record<string, any> | null;
  created_at: string;
  updated_at?: string;
}

export interface ActivityLogStats {
  total: number;
  today: number;
  todayLogins: number;
  uniqueIps: number;
}

export interface ActivityLogsResponse {
  status?: string;
  message?: string;
  data: ActivityLog[];
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    hasMorePages: boolean;
  };
  stats: ActivityLogStats;
  availableActions: string[];
}
