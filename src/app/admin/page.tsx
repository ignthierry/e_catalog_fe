'use client';

import Link from 'next/link';
import { 
  Package, 
  Grid, 
  Image as ImageIcon, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  MessageCircle, 
  Settings, 
  Store, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES, APP_CONFIG } from '@/lib/constants';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import bannersData from '@/data/banners.json';
import { formatCurrency, getWhatsAppLink } from '@/lib/whatsapp';

export default function AdminDashboardPage() {
  const products = productsData;
  const categories = categoriesData;
  const banners = bannersData;

  const stats = [
    {
      title: 'Total Produk',
      value: products.length.toString(),
      subtext: 'Produk terdaftar',
      icon: Package,
      iconColor: 'text-blue-500',
      bgGlow: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
      change: '+2 baru minggu ini',
      changeType: 'positive',
    },
    {
      title: 'Kategori Aktif',
      value: categories.length.toString(),
      subtext: 'Kategori mainan',
      icon: Grid,
      iconColor: 'text-purple-500',
      bgGlow: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
      change: 'Semua aktif',
      changeType: 'neutral',
    },
    {
      title: 'Banner Promosi',
      value: banners.length.toString(),
      subtext: 'Slide aktif di beranda',
      icon: ImageIcon,
      iconColor: 'text-amber-500',
      bgGlow: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      change: 'Musim promo',
      changeType: 'neutral',
    },
    {
      title: 'Estimasi Pengunjung',
      value: '1,248',
      subtext: 'Dilihat hari ini',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
      change: '+18.4% vs kemarin',
      changeType: 'positive',
    },
  ];

  const quickActions = [
    {
      title: 'Tambah Produk',
      desc: 'Masukkan katalog mainan baru',
      icon: Plus,
      href: ROUTES.ADMIN.PRODUCTS,
      color: 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white',
    },
    {
      title: 'Atur Banner Promo',
      desc: 'Kelola slide diskon beranda',
      icon: ImageIcon,
      href: ROUTES.ADMIN.BANNERS,
      color: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white',
    },
    {
      title: 'Pengaturan WhatsApp',
      desc: 'Ubah nomor penerima order',
      icon: MessageCircle,
      href: ROUTES.ADMIN.SETTINGS,
      color: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white',
    },
    {
      title: 'Lihat Toko Publik',
      desc: 'Cek tampilan katalog pembeli',
      icon: Store,
      href: ROUTES.HOME,
      color: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Dashboard
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              v1.2
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan operasional dan performa E-Katalog OMEGA TOYS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistem Aktif & Siap Order
          </div>
          <Button asChild size="sm" className="font-bold shadow-xs">
            <Link href={ROUTES.ADMIN.PRODUCTS} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Tambah Produk
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="group p-5 rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-card flex flex-col justify-between"
          >
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
                <h3 className="text-3xl font-black tracking-tight text-foreground">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                {stat.changeType === 'positive' && <span className="text-emerald-500 font-bold">{stat.change}</span>}
                {stat.changeType === 'neutral' && <span className="text-muted-foreground">{stat.change}</span>}
              </span>
              <span className="text-[11px] text-muted-foreground/60 font-mono">Bulan ini</span>
            </div>
          </Card>
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

          {/* Recent Products Overview */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  Daftar Produk Terbaru
                </CardTitle>
                <Link 
                  href={ROUTES.ADMIN.PRODUCTS}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat Semua ({products.length}) &rarr;
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {products.slice(0, 4).map((product) => (
                  <div 
                    key={product.id} 
                    className="p-4 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-muted border flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-foreground line-clamp-1">
                          {product.name}
                        </h5>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Stok: <span className="font-semibold text-foreground">{product.stock} pcs</span>
                        </p>
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
                Integrasi WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Nomor Admin Penerima
                </span>
                <p className="font-black text-base text-foreground font-mono">
                  +{APP_CONFIG.defaultWhatsApp}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Tersambung ke Checkout
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p>
                  Setiap pembeli menekan tombol <strong>Order via WhatsApp</strong>, rincian pesanan akan otomatis terkirim ke nomor ini.
                </p>
              </div>

              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="w-full font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                <Link href={ROUTES.ADMIN.SETTINGS}>
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  Ganti Nomor WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Panduan Sistem Card */}
          <Card className="rounded-2xl border border-border/60 shadow-xs overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b bg-muted/10">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                Panduan Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3.5 text-xs text-muted-foreground leading-relaxed">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>
                  <strong>Kelola Produk:</strong> Tambah, edit foto, atau ubah harga dan stok mainan di menu <em>Produk</em>.
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>
                  <strong>Banner Promo:</strong> Ganti gambar promo musiman yang tampil di halaman beranda toko.
                </p>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>
                  <strong>WhatsApp Checkout:</strong> Seluruh order masuk langsung tanpa potongan komisi pihak ketiga.
                </p>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[11px] leading-relaxed">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Saat ini frontend berjalan dalam <strong>Mode Simulasi Interaktif</strong>. Integrasi database penuh siap disambungkan ke Backend Laravel.
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
