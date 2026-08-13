'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilter } from '@/components/product/ProductFilter';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { SlidersHorizontal, ArrowUpDown, Search, X, Tag } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'discount' | 'newest';

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam || '');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam || '');
  }, [searchParam]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        
        setAllProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        result.sort((a, b) => {
          const discountA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discountB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discountB - discountA;
        });
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  const activeCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setSortBy('default');
    router.push(ROUTES.PRODUCTS);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">
            {activeCategoryName ? `Kategori: ${activeCategoryName}` : 'Katalog Mainan'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Menampilkan {filteredProducts.length} mainan pilihan
          </p>
        </div>

        {/* Sort & Mobile Filter Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sorting Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2 text-xs sm:text-sm font-medium bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <option value="default">Paling Sesuai</option>
              <option value="price-asc">Harga: Terendah</option>
              <option value="price-desc">Harga: Tertinggi</option>
              <option value="discount">Diskon Terbesar</option>
              <option value="newest">Produk Terbaru</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            className="lg:hidden flex items-center gap-1.5 h-9 rounded-xl font-medium"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Active Filter Tags Bar */}
      {(selectedCategory || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-3 rounded-xl border">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" /> Filter Aktif:
          </span>
          {activeCategoryName && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
              Kategori: {activeCategoryName}
              <button onClick={() => setSelectedCategory(null)} className="hover:text-primary-foreground hover:bg-primary rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full">
              Kata Kunci: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery('')} className="hover:text-secondary-foreground hover:bg-secondary rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-xs text-destructive hover:underline font-medium ml-auto"
          >
            Reset Semua
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-card p-5 rounded-2xl border shadow-xs">
            <ProductFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategorySelect={(id) => {
                setSelectedCategory(id);
                if (id) {
                  router.push(`${ROUTES.PRODUCTS}?category=${id}`);
                } else {
                  router.push(ROUTES.PRODUCTS);
                }
              }} 
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showMobileFilter && (
          <div className="lg:hidden p-4 bg-card rounded-2xl border mb-4 animate-in slide-in-from-top duration-200">
            <ProductFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategorySelect={(id) => {
                setSelectedCategory(id);
                setShowMobileFilter(false);
                if (id) {
                  router.push(`${ROUTES.PRODUCTS}?category=${id}`);
                } else {
                  router.push(ROUTES.PRODUCTS);
                }
              }} 
            />
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="w-full aspect-square rounded-2xl" />
                  <Skeleton className="w-3/4 h-4 mt-2" />
                  <Skeleton className="w-1/2 h-4" />
                  <Skeleton className="w-full h-9 mt-2 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-muted/30 border rounded-2xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Tidak Ada Produk yang Ditemukan</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Coba ubah kata kunci pencarian Anda atau pilih kategori mainan lainnya.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-xl"
                onClick={handleClearFilters}
              >
                Hapus Semua Filter
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <Suspense fallback={
        <div>
          <Skeleton className="w-48 h-8 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-full aspect-square rounded-2xl" />)}
          </div>
        </div>
      }>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
