'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, X, ArrowRight } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types';
import productsData from '@/data/products.json';
import { formatCurrency } from '@/lib/whatsapp';

import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const items = useCartStore((state) => state.items);
  const totalItems = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for search preview
  const searchResults: Product[] = searchQuery.trim()
    ? (productsData as Product[]).filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchOpen(false);
    setShowMobileSearch(false);
    router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    setShowMobileSearch(false);
    setSearchQuery('');
    router.push(`${ROUTES.PRODUCTS}/${productId}`);
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md transition-all shadow-xs">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href={ROUTES.HOME} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white border border-border/80 shadow-xs flex items-center justify-center p-1 group-hover:scale-105 transition-transform flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={APP_CONFIG.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                {APP_CONFIG.name}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground hidden sm:block leading-none">
                E-Katalog Mainan
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-4 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Cari Hot Wheels, Lego, Robot..."
              className="block w-full pl-10 pr-9 py-2 border border-border/80 rounded-full leading-5 bg-muted/40 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="p-2 border-b bg-muted/30 flex justify-between items-center text-xs text-muted-foreground px-3">
                <span>Hasil Pencarian ({searchResults.length})</span>
                <span>Tekan Enter untuk melihat semua</span>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="divide-y divide-border/40 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-muted/60 transition-colors text-left group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0 border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs font-bold text-primary mt-0.5">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 px-3 text-center text-xs font-semibold text-primary hover:bg-primary/5 transition-colors block"
                  >
                    Lihat semua hasil pencarian &quot;{searchQuery}&quot; &rarr;
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Tidak ada produk yang cocok dengan &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
            aria-label="Cari Produk"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Theme Toggle (Dark / Bright Switch) */}
          <ThemeToggle />

          {/* Cart Icon with Live Counter */}
          <Link
            href={ROUTES.CART}
            className="relative p-2.5 text-foreground hover:text-primary hover:bg-muted rounded-full transition-colors"
            aria-label="Keranjang Belanja"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-primary rounded-full shadow-sm animate-in zoom-in-50 duration-200">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar Expansion */}
      {showMobileSearch && (
        <div className="md:hidden p-3 border-t bg-background animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              placeholder="Cari mainan edukasi..."
              className="block w-full pl-9 pr-9 py-2 border rounded-full bg-muted/50 focus:bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      )}
    </header>
  );
}
