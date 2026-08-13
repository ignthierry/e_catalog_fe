'use client';

import { useState, useEffect } from 'react';
import { 
  Package, Search, CheckCircle2, Clock, RefreshCw, Truck, 
  CheckCheck, XCircle, Eye, MessageCircle, ExternalLink, Image as ImageIcon,
  Check, X, AlertCircle, Loader2, ShieldCheck, User as UserIcon, Phone, MapPin, Tag
} from 'lucide-react';
import { Order, OrderStatus, OrderCounts } from '@/types';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/whatsapp';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<OrderCounts>({
    all: 0,
    pending: 0,
    verifying: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [awbInput, setAwbInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const loadOrders = async (status = statusFilter, search = searchQuery) => {
    try {
      setLoading(true);
      const res = await api.admin.getOrders({
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
      });

      if (res) {
        setOrders(res.orders);
        setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      toast.error('Gagal memuat data pesanan admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(statusFilter, searchQuery);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders(statusFilter, searchQuery);
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setAwbInput(order.awbNumber || '');
    setAdminNotesInput(order.adminNotes || '');
  };

  const handleUpdateStatus = async (
    status: OrderStatus, 
    paymentStatus?: string, 
    awb?: string, 
    notes?: string
  ) => {
    if (!selectedOrder) return;

    try {
      setIsUpdatingStatus(true);
      const payload: any = { status };
      if (paymentStatus) payload.payment_status = paymentStatus;
      if (awb !== undefined) payload.awb_number = awb;
      if (notes !== undefined) payload.admin_notes = notes;

      const res = await api.admin.updateOrderStatus(selectedOrder.id, payload);

      if (res && res.status === 'success' && res.data) {
        setSelectedOrder(res.data);
        toast.success(`Status pesanan ${res.data.orderNumber} berhasil diperbarui!`);
        loadOrders(statusFilter, searchQuery);
      } else {
        toast.error('Gagal memperbarui status');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat mengupdate pesanan');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: OrderStatus, paymentStatus?: string) => {
    if (paymentStatus === 'verifying') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 animate-pulse">
          <RefreshCw className="w-3.5 h-3.5" /> Butuh Verifikasi
        </span>
      );
    }

    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Menunggu Bayar
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" /> Terbayar
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Package className="w-3 h-3" /> Diproses
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Truck className="w-3 h-3" /> Dikirim
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCheck className="w-3 h-3" /> Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3 h-3" /> Dibatalkan
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">
            Kelola Pesanan Masuk
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Verifikasi bukti transfer, proses pengemasan, dan perbarui nomor resi pengiriman.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadOrders()}
          className="rounded-xl font-bold text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'Semua Pesanan', count: counts.all },
          { id: 'verifying', label: 'Perlu Verifikasi', count: counts.verifying, highlight: counts.verifying > 0 },
          { id: 'pending', label: 'Belum Bayar', count: counts.pending },
          { id: 'processing', label: 'Diproses', count: counts.processing },
          { id: 'shipped', label: 'Dikirim', count: counts.shipped },
          { id: 'completed', label: 'Selesai', count: counts.completed },
          { id: 'cancelled', label: 'Batal', count: counts.cancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : tab.highlight
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                : 'bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              statusFilter === tab.id ? 'bg-primary-foreground/20 text-white' : 'bg-muted'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <Card className="rounded-2xl border shadow-xs p-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan Nomor Invoice, Nama Customer, No. HP, atau Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs rounded-xl bg-background"
            />
          </div>
          <Button type="submit" size="sm" className="rounded-xl font-bold text-xs px-4">
            Cari
          </Button>
        </form>
      </Card>

      {/* Orders Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-xs font-bold text-muted-foreground">Memuat data pesanan...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="rounded-2xl border shadow-xs hover:border-primary/40 transition-colors overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Invoice & Customer Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-foreground">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status, order.paymentStatus)}
                    <span className="text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-primary" /> {order.customerName}
                    </span>
                    <span>{order.customerPhone}</span>
                    <span>{order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}</span>
                  </div>

                  {/* Items summary */}
                  <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                    {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </p>
                </div>

                {/* Middle: Bukti Transfer indicator */}
                <div className="flex items-center gap-3">
                  {order.paymentProof ? (
                    <div 
                      onClick={() => handleOpenDetail(order)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/80 cursor-pointer hover:bg-muted"
                      title="Klik untuk melihat bukti transfer"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.paymentProof}
                        alt="Bukti Transfer"
                        className="w-10 h-10 rounded-lg object-cover bg-muted flex-shrink-0"
                      />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                          Ada Bukti Bayar
                        </span>
                        <span className="text-muted-foreground text-[10px]">Klik pratinjau</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      Belum upload bukti
                    </span>
                  )}
                </div>

                {/* Right: Total & Action */}
                <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Total Tagihan
                    </span>
                    <span className="font-black text-base text-primary">
                      {formatCurrency(order.grandTotal)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleOpenDetail(order)}
                    className="rounded-xl font-bold text-xs gap-1.5 shadow-xs"
                  >
                    <Eye className="w-4 h-4" />
                    Kelola
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed rounded-3xl border-border/60 bg-muted/10 space-y-3">
          <Package className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-extrabold text-base text-foreground">Tidak Ada Pesanan</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tidak ditemukan pesanan dengan filter status atau kata kunci yang dipilih.
          </p>
        </div>
      )}

      {/* Modal Detail & Verifikasi Pesanan */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground w-full max-w-3xl rounded-3xl border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between bg-muted/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-foreground">
                      Kelola Invoice {selectedOrder.orderNumber}
                    </h3>
                    {getStatusBadge(selectedOrder.status, selectedOrder.paymentStatus)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dibuat {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('id-ID') : '-'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-muted/20 border space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <UserIcon className="w-3.5 h-3.5 text-primary" /> Data Pembeli
                  </span>
                  <div>
                    <p className="font-black text-sm text-foreground">{selectedOrder.customerName}</p>
                    <p className="text-muted-foreground">{selectedOrder.customerPhone}</p>
                    <p className="text-muted-foreground font-mono">{selectedOrder.customerEmail || '-'}</p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs font-bold rounded-lg gap-1 mt-1">
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo ${selectedOrder.customerName}, kami dari Admin OMEGA TOYS mengonfirmasi pesanan Anda #${selectedOrder.orderNumber}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      Chat WhatsApp Customer
                    </a>
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-muted/20 border space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> Alamat & Ekspedisi
                  </span>
                  <p className="text-foreground leading-relaxed font-medium">{selectedOrder.shippingAddress}</p>
                  <div className="pt-1 flex justify-between border-t border-border/40 font-semibold">
                    <span>Kurir: <strong className="text-foreground">{selectedOrder.courier}</strong></span>
                    <span>Metode: <strong className="text-primary">{selectedOrder.paymentMethod}</strong></span>
                  </div>
                </div>
              </div>

              {/* Bukti Transfer Photo Verification Section */}
              <div className="p-5 rounded-2xl bg-muted/20 border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Foto Bukti Pembayaran / Transfer
                  </span>
                  {selectedOrder.paymentProof && (
                    <a
                      href={selectedOrder.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Ukuran Penuh
                    </a>
                  )}
                </div>

                {selectedOrder.paymentProof ? (
                  <div className="space-y-3">
                    <div className="aspect-[16/9] max-h-72 w-full rounded-xl overflow-hidden bg-slate-950 border flex items-center justify-center relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedOrder.paymentProof}
                        alt="Bukti Transfer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Quick Verification Button */}
                    {selectedOrder.paymentStatus !== 'paid' && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                        <div className="text-xs">
                          <p className="font-bold text-emerald-800 dark:text-emerald-300">
                            Bukti Transfer Perlu Diverifikasi
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Jika dana sudah masuk rekening, klik tombol di sebelah kanan.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus('processing', 'paid', selectedOrder.awbNumber || undefined, 'Pembayaran diverifikasi valid oleh admin')}
                          disabled={isUpdatingStatus}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Konfirmasi Pembayaran Valid
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed rounded-xl bg-muted/10 text-muted-foreground text-xs">
                    Customer belum mengunggah foto bukti pembayaran.
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-foreground uppercase tracking-wider">
                  Daftar Barang Belanja ({selectedOrder.items.length} Item)
                </h4>
                <div className="border rounded-2xl divide-y divide-border/60 overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center gap-3 bg-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover bg-muted border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{item.productName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {item.quantity}x @ {formatCurrency(item.price)}
                        </p>
                      </div>
                      <span className="text-xs font-black text-foreground">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                  <div className="p-3.5 bg-muted/20 space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal Produk:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ongkos Kirim ({selectedOrder.courier}):</span>
                      <span className="font-semibold text-foreground">{formatCurrency(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-black text-sm text-foreground">
                      <span>Total Tagihan:</span>
                      <span className="text-primary text-base">{formatCurrency(selectedOrder.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping AWB & Admin Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-primary" /> Nomor Resi Ekspedisi (AWB)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Contoh: JNE829384729"
                      value={awbInput}
                      onChange={(e) => setAwbInput(e.target.value)}
                      className="rounded-xl font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleUpdateStatus('shipped', selectedOrder.paymentStatus, awbInput, adminNotesInput)}
                      disabled={isUpdatingStatus || !awbInput}
                      className="font-bold text-xs rounded-xl flex-shrink-0"
                    >
                      Kirim Resi
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    Catatan Internal Admin
                  </label>
                  <Input
                    placeholder="Catatan verifikasi..."
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateStatus('cancelled', 'rejected', undefined, 'Pesanan dibatalkan oleh admin')}
                  disabled={isUpdatingStatus || selectedOrder.status === 'cancelled'}
                  className="text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Batalkan Pesanan
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.status === 'processing' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus('shipped', 'paid', awbInput || undefined, adminNotesInput)}
                    disabled={isUpdatingStatus}
                    className="rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Tandai Sedang Dikirim
                  </Button>
                )}

                {selectedOrder.status === 'shipped' && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus('completed', 'paid', awbInput, adminNotesInput)}
                    disabled={isUpdatingStatus}
                    className="rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai Pesanan Selesai
                  </Button>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl font-bold text-xs"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
