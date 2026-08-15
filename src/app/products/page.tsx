'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilter } from '@/components/product/ProductFilter';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Search, 
  X, 
  Tag, 
  Flame, 
  Sparkles, 
  ArrowDownNarrowWide, 
  ArrowUpNarrowWide,
  Percent,
  Banknote,
  RotateCcw
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/whatsapp';

type SortOption = 'default' | 'bestseller' | 'newest' | 'price-asc' | 'price-desc' | 'discount';

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const minPriceParam = searchParams.get('min_price');
  const maxPriceParam = searchParams.get('max_price');
  const sortParam = searchParams.get('sort') as SortOption | null;
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam || '');
  const [minPrice, setMinPrice] = useState<number | undefined>(minPriceParam ? Number(minPriceParam) : undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(maxPriceParam ? Number(maxPriceParam) : undefined);
  const [sortBy, setSortBy] = useState<SortOption>(sortParam || 'default');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam || '');
  }, [searchParam]);

  useEffect(() => {
    if (minPriceParam) setMinPrice(Number(minPriceParam));
    else setMinPrice(undefined);
  }, [minPriceParam]);

  useEffect(() => {
    if (maxPriceParam) setMaxPrice(Number(maxPriceParam));
    else setMaxPrice(undefined);
  }, [maxPriceParam]);

  useEffect(() => {
    if (sortParam) setSortBy(sortParam);
  }, [sortParam]);

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

  // Update URL Query Parameters
  const updateUrlParams = (newCategory?: string | null, newMin?: number, newMax?: number, newSort?: SortOption) => {
    const params = new URLSearchParams();
    const cat = newCategory !== undefined ? newCategory : selectedCategory;
    const min = newMin !== undefined ? newMin : minPrice;
    const max = newMax !== undefined ? newMax : maxPrice;
    const srt = newSort !== undefined ? newSort : sortBy;

    if (cat) params.set('category', cat);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (min !== undefined) params.set('min_price', String(min));
    if (max !== undefined) params.set('max_price', String(max));
    if (srt && srt !== 'default') params.set('sort', srt);

    const queryString = params.toString();
    router.push(queryString ? `${ROUTES.PRODUCTS}?${queryString}` : ROUTES.PRODUCTS);
  };

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    updateUrlParams(catId, minPrice, maxPrice, sortBy);
  };

  const handlePriceChange = (min?: number, max?: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrlParams(selectedCategory, min, max, sortBy);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    updateUrlParams(selectedCategory, minPrice, maxPrice, sort);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // 1. Filter by Category
    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // 3. Filter by Price Range
    if (minPrice !== undefined) {
      result = result.filter(p => p.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      result = result.filter(p => p.price <= maxPrice);
    }

    // 4. Sorting
    switch (sortBy) {
      case 'bestseller':
        result.sort((a, b) => {
          const soldA = a.soldCount ?? a.sold ?? 0;
          const soldB = b.soldCount ?? b.sold ?? 0;
          return soldB - soldA;
        });
        break;
      case 'newest':
        result.sort((a, b) => {
          if (b.isNew && !a.isNew) return 1;
          if (!b.isNew && a.isNew) return -1;
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
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
      default:
        break;
    }

    return result;
  }, [allProducts, selectedCategory, searchQuery, minPrice, maxPrice, sortBy]);

  const activeCategoryName = categories.find(c => c.id === selectedCategory)?.name;

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('default');
    router.push(ROUTES.PRODUCTS);
  };

  // Quick sort tab options
  const sortTabs = [
    { value: 'default', label: 'Paling Sesuai', icon: null },
    { value: 'bestseller', label: 'Terlaris', icon: Flame },
    { value: 'newest', label: 'Terbaru', icon: Sparkles },
    { value: 'price-asc', label: 'Termurah', icon: ArrowDownNarrowWide },
    { value: 'price-desc', label: 'Termahal', icon: ArrowUpNarrowWide },
    { value: 'discount', label: 'Diskon', icon: Percent },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">
            {activeCategoryName ? `Kategori: ${activeCategoryName}` : 'Katalog Mainan'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Menampilkan <strong className="text-foreground">{filteredProducts.length}</strong> produk pilihan
          </p>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1.5 h-9 rounded-xl font-bold border-primary/40 text-primary w-full justify-center shadow-xs"
            onClick={() => setShowMobileFilter(!showMobileFilter)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Kategori & Harga</span>
            {(selectedCategory || minPrice !== undefined || maxPrice !== undefined) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </div>
      </div>

      {/* Quick Sort Bar (Pills / Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-0.5">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap pl-1 hidden md:inline">
            Urutkan:
          </span>
          {sortTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = sortBy === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleSortChange(tab.value as SortOption)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs scale-102'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Standard Sort Select Dropdown */}
        <div className="relative flex items-center flex-shrink-0">
          <ArrowUpDown className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="pl-9 pr-8 py-1.5 text-xs font-bold bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/40 focus:outline-none appearance-none cursor-pointer hover:bg-muted/40 transition-colors w-full sm:w-auto"
          >
            <option value="default">Urutan: Paling Sesuai</option>
            <option value="bestseller">🔥 Terlaris (Paling Banyak)</option>
            <option value="newest">✨ Produk Terbaru</option>
            <option value="price-asc">💰 Harga: Terendah ke Tertinggi</option>
            <option value="price-desc">💎 Harga: Tertinggi ke Terendah</option>
            <option value="discount">🏷️ Diskon Terbesar</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      {(selectedCategory || searchQuery || minPrice !== undefined || maxPrice !== undefined || sortBy !== 'default') && (
        <div className="flex flex-wrap items-center gap-2 bg-muted/40 p-3 rounded-2xl border">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-primary" /> Filter Aktif:
          </span>

          {activeCategoryName && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full">
              Kategori: {activeCategoryName}
              <button 
                type="button"
                onClick={() => handleCategoryChange(null)} 
                className="hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 cursor-pointer ml-1"
                title="Hapus Kategori"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(minPrice !== undefined || maxPrice !== undefined) && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-secondary/10 text-secondary border border-secondary/20 px-2.5 py-1 rounded-full">
              <Banknote className="w-3 h-3" />
              Harga: {minPrice !== undefined ? formatCurrency(minPrice) : 'Rp 0'} - {maxPrice !== undefined ? formatCurrency(maxPrice) : 'Maks'}
              <button 
                type="button"
                onClick={() => handlePriceChange(undefined, undefined)} 
                className="hover:text-secondary-foreground hover:bg-secondary rounded-full p-0.5 cursor-pointer ml-1"
                title="Hapus Filter Harga"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Cari: &quot;{searchQuery}&quot;
              <button 
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  updateUrlParams(selectedCategory, minPrice, maxPrice, sortBy);
                }} 
                className="hover:text-amber-800 rounded-full p-0.5 cursor-pointer ml-1"
                title="Hapus Pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {sortBy !== 'default' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-muted text-foreground border px-2.5 py-1 rounded-full">
              Urutan: {sortTabs.find(t => t.value === sortBy)?.label}
              <button 
                type="button"
                onClick={() => handleSortChange('default')} 
                className="hover:text-destructive rounded-full p-0.5 cursor-pointer ml-1"
                title="Reset Urutan"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs text-destructive hover:underline font-bold ml-auto flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Semua
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-card p-5 rounded-3xl border shadow-xs">
            <ProductFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategorySelect={handleCategoryChange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              onResetFilters={handleClearFilters}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {showMobileFilter && (
          <div className="lg:hidden w-full p-5 bg-card rounded-3xl border shadow-md mb-4 animate-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b">
              <h3 className="font-extrabold text-sm text-foreground">Filter Produk</h3>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ProductFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategorySelect={(id) => {
                handleCategoryChange(id);
                setShowMobileFilter(false);
              }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={(min, max) => {
                handlePriceChange(min, max);
                setShowMobileFilter(false);
              }}
              onResetFilters={() => {
                handleClearFilters();
                setShowMobileFilter(false);
              }}
            />
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1 w-full min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col gap-2 p-3 bg-card border rounded-3xl">
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
            <div className="text-center py-16 px-4 bg-muted/20 border rounded-3xl flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-foreground">Tidak Ada Produk yang Sesuai</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-md">
                Tidak ditemukan produk pada rentang harga atau filter yang Anda pilih. Coba sesuaikan rentang harga atau pilih kategori lain.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-xl font-bold gap-2"
                onClick={handleClearFilters}
              >
                <RotateCcw className="w-4 h-4" />
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-10 pb-24 md:pb-10">
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
