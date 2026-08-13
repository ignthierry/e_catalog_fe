'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // In real app, we'd have a specific API for featured/popular products
        const data = await api.getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch featured products", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-8">
        <h3 className="font-bold text-lg mb-6 text-foreground">Produk Unggulan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="w-full aspect-square rounded-xl" />
              <Skeleton className="w-3/4 h-4 mt-2" />
              <Skeleton className="w-1/2 h-4" />
              <Skeleton className="w-full h-9 mt-2 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl md:text-2xl text-foreground">Produk Unggulan</h3>
          <p className="text-sm text-muted-foreground mt-1">Koleksi terbaik dan terbaru untuk si kecil</p>
        </div>
        <Link 
          href={ROUTES.PRODUCTS} 
          className="hidden md:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Lihat Semua <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="mt-8 md:hidden flex justify-center">
        <Link 
          href={ROUTES.PRODUCTS} 
          className="flex items-center gap-2 text-sm font-medium text-primary px-6 py-2 rounded-full border border-primary hover:bg-primary hover:text-white transition-colors"
        >
          Lihat Semua Produk <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
