export interface Variant {
  id: string;
  name: string;
  options: string[];
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
}
