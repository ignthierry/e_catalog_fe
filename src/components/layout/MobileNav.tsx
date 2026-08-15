'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingCart, Package, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export function MobileNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const totalItems = mounted ? items.reduce((total, item) => total + item.quantity, 0) : 0;

  const { isAuthenticated, user } = useAuthStore();
  const isAdminUser = Boolean(
    mounted &&
    isAuthenticated &&
    user &&
    (user.role === 'admin' || user.role === 'warehouse' || user.role === 'cs')
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Base navigation items: Only display Admin if authenticated as an Admin/Staff
  const navItems = [
    { name: 'Beranda', href: ROUTES.HOME, icon: Home },
    { name: 'Katalog', href: ROUTES.PRODUCTS, icon: Grid },
    { name: 'Keranjang', href: ROUTES.CART, icon: ShoppingCart, isCart: true },
    isAdminUser
      ? { name: 'Admin', href: ROUTES.ADMIN.DASHBOARD, icon: ShieldCheck }
      : { name: 'Pesanan', href: ROUTES.MY_ORDERS, icon: Package },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== ROUTES.HOME && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-12 py-1 rounded-xl transition-all duration-200 ${
                isActive ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.isCart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-black text-white bg-primary rounded-full shadow-xs animate-in zoom-in-50 duration-200">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight mt-1 whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
