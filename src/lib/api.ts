import { Product, Category, Banner } from '@/types';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import bannersData from '@/data/banners.json';

// Simulate API delay for development
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Products
  getProducts: async (): Promise<Product[]> => {
    await delay(500);
    return productsData as Product[];
  },
  
  getProductById: async (id: string): Promise<Product | undefined> => {
    await delay(300);
    return (productsData as Product[]).find(p => p.id === id);
  },
  
  getFeaturedProducts: async (): Promise<Product[]> => {
    await delay(400);
    return (productsData as Product[]).filter(p => p.isNew || p.originalPrice);
  },
  
  getProductsByCategory: async (categoryId: string): Promise<Product[]> => {
    await delay(400);
    return (productsData as Product[]).filter(p => p.categoryId === categoryId);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    await delay(300);
    return categoriesData as Category[];
  },

  // Banners
  getBanners: async (): Promise<Banner[]> => {
    await delay(300);
    return bannersData as Banner[];
  }
};
