'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, Search, ArrowRight, Clock, RefreshCw, Truck, 
  CheckCheck, XCircle, ShoppingBag, Loader2, Sparkles, User as UserIcon
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { AuthModal } from '@/components/auth/AuthModal';

export default function MyOrdersPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhoneOrEmail, setSearchPhoneOrEmail] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = async (queryEmail?: string, queryPhone?: string) => {
    try {
      setLoading(true);
      const email = queryEmail || (user?.email || undefined);
      const phone = queryPhone || (user?.phoneNumber || undefined);
      const data = await api.orders.getMyOrders(token, email, phone);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhoneOrEmail.trim()) return;

    if (searchPhoneOrEmail.includes('@')) {
      fetchOrders(searchPhoneOrEmail.trim(), undefined);
    } else {
      fetchOrders(undefined, searchPhoneOrEmail.trim());
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Menunggu Pembayaran
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3 h-3" /> Verifikasi Admin
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Package className="w-3 h-3" /> Sedang Dikemas
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Truck className="w-3 h-3" /> Dikirim
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCheck className="w-3 h-3" /> Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3 h-3" /> Batal
          </span>
        );
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 md:py-12 max-w-5xl space-y-6">
      {/* Title & Auth Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            Pesanan Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Lacak pengiriman dan kelola seluruh transaksi belanja Anda di OMEGA TOYS.
          </p>
        </div>

        {!isAuthenticated ? (
          <Button
            variant="outline"
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-2xl font-bold text-xs gap-1.5 self-start md:self-auto"
          >
            <UserIcon className="w-4 h-4 text-primary" />
            Masuk ke Akun Customer
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-muted/40 px-3.5 py-1.5 rounded-2xl border border-border/80 text-xs font-bold self-start md:self-auto">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[11px]">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-foreground">{user?.name}</span>
          </div>
        )}
      </div>

      {/* Unauthenticated lookup form */}
      {!isAuthenticated && (
        <Card className="rounded-3xl border shadow-xs p-5 sm:p-6 bg-primary/5 border-primary/20 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Masuk untuk Melihat Riwayat Pesanan
              </h3>
              <p className="text-xs text-muted-foreground">
                Masuk atau daftar akun customer untuk melihat semua pesanan Anda secara otomatis.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="rounded-xl text-xs font-extrabold gap-1.5 flex-shrink-0 shadow-xs"
            >
              Masuk / Daftar Akun
            </Button>
          </div>

          <div className="pt-3 border-t border-border/60">
            <p className="text-xs font-bold text-foreground mb-2">
              Atau lacak pesanan secara manual:
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Ketik Nomor WhatsApp atau Email saat pemesanan..."
                  value={searchPhoneOrEmail}
                  onChange={(e) => setSearchPhoneOrEmail(e.target.value)}
                  className="rounded-xl text-xs bg-background"
                />
              </div>
              <Button type="submit" variant="outline" className="rounded-xl text-xs font-bold gap-1.5 flex-shrink-0">
                <Search className="w-3.5 h-3.5" />
                Cari Pesanan
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Filter Tabs (only if has orders) */}
      {orders.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pending', label: 'Belum Bayar' },
            { id: 'paid', label: 'Verifikasi' },
            { id: 'processing', label: 'Diproses' },
            { id: 'shipped', label: 'Dikirim' },
            { id: 'completed', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-xs font-bold text-muted-foreground">Memuat daftar pesanan...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="rounded-3xl border shadow-xs hover:border-primary/40 transition-colors overflow-hidden">
              <div className="p-4 sm:p-5 border-b bg-muted/15 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-foreground block">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Items Preview */}
                <div className="space-y-2.5">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover bg-muted border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.quantity} barang x {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-foreground">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Row */}
                <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs">
                    <span className="text-muted-foreground block">Total Belanja:</span>
                    <span className="font-black text-base text-primary">
                      {formatCurrency(order.grandTotal)}
                    </span>
                  </div>

                  <Button asChild size="sm" className="rounded-xl font-bold text-xs gap-1.5 self-end sm:self-auto">
                    <Link href={`${ROUTES.ORDERS}/${order.orderNumber}`}>
                      Detail & Lacak Pesanan
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed rounded-3xl border-border/60 bg-muted/10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              {!isAuthenticated ? 'Belum Ada Riwayat Ditampilkan' : 'Belum Ada Pesanan'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {!isAuthenticated 
                ? 'Silakan masuk ke akun Anda atau masukkan Nomor HP / Email di atas untuk melacak pesanan.'
                : 'Belum ada riwayat pesanan yang ditemukan. Ayo temukan koleksi mainan favorit si kecil sekarang!'}
            </p>
          </div>
          {!isAuthenticated ? (
            <Button size="sm" onClick={() => setIsAuthModalOpen(true)} className="rounded-xl font-bold">
              Masuk / Daftar Akun
            </Button>
          ) : (
            <Button asChild size="sm" className="rounded-xl font-bold">
              <Link href={ROUTES.PRODUCTS}>Mulai Belanja</Link>
            </Button>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => fetchOrders()}
      />
    </div>
  );
}
