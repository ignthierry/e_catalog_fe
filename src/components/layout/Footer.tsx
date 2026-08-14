'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { MessageCircle } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-card/40 backdrop-blur-xs mt-auto py-4 text-xs text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white border border-border/80 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={APP_CONFIG.name}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-extrabold text-sm text-foreground tracking-tight">
            {APP_CONFIG.name}
          </span>
          <span className="text-muted-foreground/40 hidden sm:inline">•</span>
          <span className="hidden sm:inline text-muted-foreground/80">
            Katalog Mainan Edukatif & Koleksi
          </span>
        </div>

        {/* Center: Quick Links */}
        <nav className="flex items-center justify-center gap-4 font-semibold text-xs">
          <Link href={ROUTES.HOME} className="hover:text-primary transition-colors">
            Beranda
          </Link>
          <Link href={ROUTES.PRODUCTS} className="hover:text-primary transition-colors">
            Katalog
          </Link>
          <Link href={ROUTES.CART} className="hover:text-primary transition-colors">
            Keranjang
          </Link>
          <a 
            href={`https://wa.me/${APP_CONFIG.defaultWhatsApp}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
            WA Admin
          </a>
        </nav>

        {/* Right: Copyright */}
        <div className="text-[11px] text-muted-foreground/70">
          &copy; {currentYear} {APP_CONFIG.name}. Powered by <span className="font-bold text-foreground">Luvion Software</span>
        </div>
      </div>
    </footer>
  );
}
