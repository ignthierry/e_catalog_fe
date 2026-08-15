'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Grid,
  Image as ImageIcon, 
  Settings, 
  Store, 
  Sparkles, 
  LogOut, 
  User,
  ShieldCheck,
  ShoppingBag,
  History
} from 'lucide-react';
import { ROUTES, APP_CONFIG } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  const isLoginPage = pathname === ROUTES.ADMIN.LOGIN;
  const isAdmin = Boolean(
    isAuthenticated && 
    user && 
    (user.role === 'admin' || user.role === 'warehouse' || user.role === 'cs')
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strict role and session protection:
  // If not logged in, no session, or role is customer -> redirect to home '/'
  useEffect(() => {
    if (mounted && !isLoginPage) {
      if (!isAuthenticated || !user || !isAdmin) {
        if (isAuthenticated && user && user.role === 'customer') {
          toast.error('Akses Ditolak!', {
            description: 'Akun Anda adalah Customer. Admin Panel hanya dapat diakses oleh Administrator.',
          });
        } else if (!isAuthenticated) {
          toast.error('Akses Terbatas', {
            description: 'Silakan login terlebih dahulu sebagai Administrator untuk mengakses Admin Panel.',
          });
        }
        router.replace(ROUTES.HOME);
      }
    }
  }, [mounted, isLoginPage, isAuthenticated, user, isAdmin, router]);

  // Fetch pending count periodically if admin
  useEffect(() => {
    if (mounted && isAdmin) {
      api.admin.getOrders().then((res) => {
        if (res?.counts) {
          setPendingOrdersCount((res.counts.verifying || 0) + (res.counts.pending || 0));
        }
      }).catch(() => {});
    }
  }, [mounted, isAdmin, pathname]);

  // If on login page, render children directly without sidebar/nav
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading / Restricted state while checking auth
  if (!mounted || !isAuthenticated || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-400 animate-pulse text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-200">Memverifikasi Otorisasi Administrator...</p>
            <p className="text-xs text-slate-500 mt-1">Hanya akun dengan role Admin yang diizinkan.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.info('Anda telah keluar dari Admin Panel.');
    router.push(ROUTES.HOME);
  };

  const sidebarItems = [
    { name: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { 
      name: 'Pesanan', 
      href: ROUTES.ADMIN.ORDERS, 
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined 
    },
    { name: 'Produk', href: ROUTES.ADMIN.PRODUCTS, icon: Package },
    { name: 'Kategori', href: ROUTES.ADMIN.CATEGORIES, icon: Grid },
    { name: 'Banner Promo', href: ROUTES.ADMIN.BANNERS, icon: ImageIcon },
    { name: 'Log Aktivitas', href: ROUTES.ADMIN.ACTIVITY_LOGS, icon: History },
    { name: 'Pengaturan', href: ROUTES.ADMIN.SETTINGS, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-200">
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex w-64 bg-card border-r flex-col fixed inset-y-0 left-0 z-40 shadow-xs">
        {/* Brand Header */}
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white border border-border/80 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={APP_CONFIG.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm text-foreground leading-tight truncate">
                {APP_CONFIG.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Admin
              </span>
            </div>
          </div>
          
          <ThemeToggle />
        </div>
        
        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Menu Utama
          </p>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-primary' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer Admin Info & Logout */}
        <div className="p-4 border-t bg-muted/20 space-y-2">
          {/* User info */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-emerald-500 font-semibold leading-none">Role: {user?.role || 'admin'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Link to public store */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors w-full"
          >
            <Store className="w-4 h-4 text-primary" />
            <span>Lihat Toko Publik &rarr;</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-card border-b sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white border border-border/80 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={APP_CONFIG.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm text-foreground">{APP_CONFIG.name} Admin</span>
            <span className="block text-[10px] text-muted-foreground">Admin: {user?.name || 'Admin'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link 
            href={ROUTES.HOME}
            className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-xl transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            Toko
          </Link>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 max-w-6xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Admin) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 pb-safe shadow-lg">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto hide-scrollbar scroll-smooth touch-pan-x">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[68px] px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white font-bold shadow-xs shadow-primary/30 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                  {item.badge && (
                    <span
                      className={`absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full text-[9px] font-black flex items-center justify-center ${
                        isActive ? 'bg-white text-primary' : 'bg-red-500 text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1 text-[11px] leading-tight whitespace-nowrap">
                  {item.name === 'Banner Promo' ? 'Banner' : item.name === 'Log Aktivitas' ? 'Aktivitas' : item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
