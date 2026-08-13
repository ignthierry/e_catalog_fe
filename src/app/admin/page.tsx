'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Grid, 
  Image as ImageIcon, 
  Boxes, 
  Plus, 
  ArrowUpRight, 
  MessageCircle, 
  Settings, 
  Store, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Server,
  ExternalLink,
  Layers,
  ShoppingBag,
  Clock,
  Eye,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/lib/constants';
import { api, DashboardData } from '@/lib/api';
import { formatCurrency } from '@/lib/whatsapp';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const res = await api.admin.getDashboard();
      if (res) {
        setData(res);
        if (showToast) {
          toast.success('Data dashboard berhasil diperbarui dari database!');
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (showToast) {
        toast.error('Gagal memperbarui data dari server');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const stats = [
    {
      title: 'Pesanan Perlu Diproses',
      value: loading ? '...' : (data?.stats.pendingOrders?.toString() || '0'),
      subtext: 'Menunggu konfirmasi bayar / kirim',
      icon: ShoppingBag,
      iconColor: 'text-amber-500',
      bgGlow: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      href: ROUTES.ADMIN.ORDERS,
      change: data?.stats.pendingOrders ? `${data.stats.pendingOrders} Perlu Tindakan` : 'Semua Beres',
      changeType: (data?.stats.pendingOrders || 0) > 0 ? 'warning' : 'positive',
    },
    {
      title: 'Total Pendapatan',
      value: loading ? '...' : formatCurrency(data?.stats.totalRevenue || 0),
      subtext: `${data?.stats.totalOrders || 0} total transaksi masuk`,
      icon: DollarSign,
      iconColor: 'text-emerald-500',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      href: ROUTES.ADMIN.ORDERS,
      change: 'Omset Transaksi',
      changeType: 'positive',
    },
    {
      title: 'Total Produk Mainan',
      value: loading ? '...' : (data?.stats.totalProducts?.toString() || '0'),
      subtext: `${data?.stats.totalStock || 0} pcs total stok fisik`,
      icon: Package,
      iconColor: 'text-blue-500',
      bgGlow: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      href: ROUTES.ADMIN.PRODUCTS,
      change: 'Katalog Aktif',
      changeType: 'positive',
    },
    {
      title: 'Kategori & Promo',
      value: loading ? '...' : `${data?.stats.totalCategories || 0} / ${data?.stats.totalBanners || 0}`,
      subtext: 'Kategori / Banner Promo',
      icon: Grid,
      iconColor: 'text-purple-500',
      bgGlow: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
      href: ROUTES.ADMIN.CATEGORIES,
      change: 'Live di Menu',
      changeType: 'neutral',
    },
  ];

  const quickActions = [
    {
      title: 'Kelola Pesanan',
      desc: 'Verifikasi bukti transfer & resi',
      icon: ShoppingBag,
      href: ROUTES.ADMIN.ORDERS,
      color: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
    },
    {
      title: 'Tambah Produk',
      desc: 'Masukkan katalog mainan baru',
      icon: Plus,
      href: ROUTES.ADMIN.PRODUCTS,
      color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
    },
    {
      title: 'Kelola Kategori',
      desc: 'Atur grup mainan & filter',
      icon: Grid,
      href: ROUTES.ADMIN.CATEGORIES,
      color: 'bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white',
    },
    {
      title: 'Atur Banner Promo',
      desc: 'Kelola slide diskon beranda',
      icon: ImageIcon,
      href: ROUTES.ADMIN.BANNERS,
      color: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
    },
  ];

  const currentWhatsApp = data?.settings?.whatsapp_number || '6281234567890';
  const storeName = data?.settings?.store_name || 'OMEGA TOYS';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Aktif & Terhubung
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan data transaksi, pesanan customer, dan katalog mainan secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing || loading}
            className="font-semibold text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Refresh Data'}</span>
          </Button>

          <Button asChild size="sm" className="font-bold shadow-xs">
            <Link href={ROUTES.ADMIN.ORDERS} className="gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              Lihat Pesanan
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href} className="block group">
            <Card className="p-5 rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-card flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${stat.bgGlow}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-foreground">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.subtext}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  {stat.changeType === 'warning' ? (
                    <span className="text-amber-500 font-black">{stat.change}</span>
                  ) : (
                    <span className="text-emerald-500 font-bold">{stat.change}</span>
                  )}
                </span>
                <span className="text-[11px] text-primary font-semibold flex items-center gap-0.5 group-hover:underline">
                  Buka &rarr;
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Grid */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Aksi Cepat
                </CardTitle>
                <span className="text-xs text-muted-foreground">Menu pintas admin</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action, i) => (
                  <Link
                    key={i}
                    href={action.href}
                    className="group p-4 rounded-xl border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30 transition-all duration-200 flex items-center gap-3.5 shadow-xs"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                        {action.title}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders Overview (Live from DB) */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Pesanan Masuk Terbaru
                </CardTitle>
                <Link 
                  href={ROUTES.ADMIN.ORDERS}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Kelola Semua Pesanan &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Memuat transaksi pesanan...</p>
                </div>
              ) : data?.recentOrders && data.recentOrders.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {data.recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-foreground">
                            {order.orderNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-foreground truncate">
                          {order.customerName} ({order.customerPhone})
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {order.itemCount} barang • {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 space-y-1">
                        <span className="font-black text-sm text-primary block">
                          {formatCurrency(order.grandTotal)}
                        </span>
                        <Button asChild size="sm" variant="outline" className="h-7 text-xs font-bold rounded-lg px-2.5">
                          <Link href={ROUTES.ADMIN.ORDERS}>
                            <Eye className="w-3 h-3 mr-1" /> Kelola
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Belum ada pesanan masuk di sistem.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Products Overview (from Backend DB) */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Daftar Produk Terbaru (Database Live)
                </CardTitle>
                <Link 
                  href={ROUTES.ADMIN.PRODUCTS}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat Semua ({data?.stats.totalProducts || 0}) &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground text-sm space-y-2">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p>Memuat produk dari database...</p>
                </div>
              ) : data?.recentProducts && data.recentProducts.length > 0 ? (
                <div className="divide-y divide-border/40">
                  {data.recentProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80'}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-muted border flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-foreground line-clamp-1">
                            {product.name}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                              {product.categoryName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Stok: <strong className="text-foreground">{product.stock} pcs</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-black text-sm text-primary block">
                          {formatCurrency(product.price)}
                        </span>
                        <Badge variant="default" className="text-[10px] bg-emerald-500 mt-1 font-bold">
                          Aktif
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Belum ada produk di database.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          
          {/* WhatsApp Status Card */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-emerald-500/5">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="w-5 h-5" />
                Integrasi Toko & WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nomor Admin Toko
                </span>
                <p className="font-black text-lg text-foreground font-mono">
                  +{currentWhatsApp}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Database Aktif
                  </span>
                  <a 
                    href={`https://wa.me/${currentWhatsApp}?text=Halo%20Admin%20${encodeURIComponent(storeName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    Tes Chat <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 leading-relaxed">
                <p>Nama Toko: <strong>{storeName}</strong></p>
                <p>Metode Pembayaran: <strong>QRIS & Transfer Bank</strong></p>
              </div>

              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="w-full font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <Link href={ROUTES.ADMIN.SETTINGS}>
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Ubah Pengaturan Toko
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Category Breakdown Card */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  Kategori Mainan
                </CardTitle>
                <Link 
                  href={ROUTES.ADMIN.CATEGORIES}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Kelola &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {data?.categoriesSummary && data.categoriesSummary.length > 0 ? (
                data.categoriesSummary.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="p-2.5 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-foreground truncate">{cat.name}</span>
                    <Badge variant="outline" className="font-bold font-mono">
                      {cat.productCount} pcs
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Belum ada kategori.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
