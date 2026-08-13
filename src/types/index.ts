export interface Variant {
  id: string;
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  isNew?: boolean;
  stock: number;
  variants?: Variant[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
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
