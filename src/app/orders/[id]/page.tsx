'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Clock, Package, Truck, CheckCheck, 
  XCircle, Copy, Check, UploadCloud, MessageCircle, ExternalLink, RefreshCw, Loader2
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { api } from '@/lib/api';
import { APP_CONFIG, ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { toast } from 'sonner';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const orderIdOrNumber = resolvedParams.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [newProofUrl, setNewProofUrl] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await api.orders.getById(orderIdOrNumber);
      if (data) {
        setOrder(data);
        if (data.paymentProof) {
          setNewProofUrl(data.paymentProof);
        }
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderIdOrNumber]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success('Nomor Invoice disalin!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveProof = async () => {
    if (!newProofUrl || !order) {
      toast.error('Silakan pilih foto bukti pembayaran terlebih dahulu');
      return;
    }

    try {
      setIsUploadingProof(true);
      const res = await api.orders.uploadProof(order.id, newProofUrl);
      if (res && res.status === 'success' && res.data) {
        setOrder(res.data);
        toast.success('Bukti pembayaran berhasil disimpan! Menunggu verifikasi admin.');
      } else {
        toast.error('Gagal memperbarui bukti pembayaran');
      }
    } catch (err: any) {
      toast.error('Gagal mengirim bukti pembayaran ke server');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3.5 h-3.5" /> Menunggu Verifikasi Admin
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Package className="w-3.5 h-3.5" /> Sedang Dikemas
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Truck className="w-3.5 h-3.5" /> Sedang Dikirim
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCheck className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3.5 h-3.5" /> Dibatalkan
          </span>
        );
    }
  };

  const steps = [
    { title: 'Pesanan Dibuat', done: true },
    { title: 'Verifikasi Bayar', done: order?.status !== 'pending' && order?.status !== 'cancelled' },
    { title: 'Dikemas', done: order?.status === 'processing' || order?.status === 'shipped' || order?.status === 'completed' },
    { title: 'Dikirim', done: order?.status === 'shipped' || order?.status === 'completed' },
    { title: 'Selesai', done: order?.status === 'completed' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center min-h-[60vh]">
        <h2 className="text-2xl font-black text-foreground mb-2">Pesanan Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Nomor invoice atau ID pesanan tidak terdaftar di sistem kami.
        </p>
        <Button asChild size="lg" className="font-bold rounded-2xl">
          <Link href={ROUTES.MY_ORDERS}>Lihat Pesanan Saya</Link>
        </Button>
      </div>
    );
  }

  // WA chat link
  const waText = encodeURIComponent(
    `Halo Admin OMEGA TOYS, saya ingin menanyakan status pesanan nomor invoice *${order.orderNumber}* atas nama *${order.customerName}* (Total: ${formatCurrency(order.grandTotal)}).`
  );
  const waUrl = `https://wa.me/${APP_CONFIG.defaultWhatsApp}?text=${waText}`;

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href={ROUTES.MY_ORDERS} 
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                Invoice {order.orderNumber}
              </h1>
              <button
                onClick={() => handleCopy(order.orderNumber)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Salin Nomor Invoice"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dibuat pada {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(order.status)}
          <Button asChild variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-1.5">
            <a href={waUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              Chat Admin WA
            </a>
          </Button>
        </div>
      </div>

      {/* Tracking Stepper */}
      {order.status !== 'cancelled' && (
        <Card className="rounded-3xl border shadow-xs overflow-hidden">
          <div className="p-6">
            <h3 className="font-extrabold text-sm text-foreground mb-6">Status Pelacakan Pesanan</h3>
            <div className="grid grid-cols-5 gap-2 relative">
              {steps.map((step, idx) => (
                <div key={step.title} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                      step.done
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-muted text-muted-foreground border'
                    }`}
                  >
                    {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[11px] font-bold leading-tight ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>

            {/* AWB / Resi info if shipped */}
            {order.awbNumber && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Pesanan Anda Sedang Dikirim via {order.courier}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-foreground">
                      No. Resi (AWB): {order.awbNumber}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.awbNumber || '');
                    toast.success('Nomor Resi disalin!');
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Salin Resi
                </button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Grid: Details + Proof Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 cols: Items & Shipping Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Items */}
          <Card className="rounded-3xl border shadow-xs overflow-hidden">
            <div className="p-5 border-b bg-muted/20">
              <h3 className="font-extrabold text-sm text-foreground">
                Rincian Produk ({order.items.length} Item)
              </h3>
            </div>
            <div className="p-5 divide-y divide-border/60">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 rounded-2xl object-cover bg-muted border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-extrabold text-sm text-foreground">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping & Recipient */}
          <Card className="rounded-3xl border shadow-xs p-5 sm:p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-foreground pb-2 border-b">
              Informasi Pengiriman
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block font-semibold">Penerima:</span>
                <span className="font-extrabold text-foreground text-sm">{order.customerName}</span>
                <span className="text-muted-foreground block">{order.customerPhone}</span>
              </div>

              <div>
                <span className="text-muted-foreground block font-semibold">Kurir:</span>
                <span className="font-extrabold text-foreground">{order.courier}</span>
                <span className="text-muted-foreground block font-semibold mt-1">Metode Pembayaran:</span>
                <span className="font-bold text-primary">{order.paymentMethod}</span>
              </div>
            </div>

            <div className="pt-2 border-t text-xs">
              <span className="text-muted-foreground block font-semibold mb-1">Alamat Tujuan:</span>
              <p className="text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border">
                {order.shippingAddress}
              </p>
            </div>

            {order.notes && (
              <div className="text-xs">
                <span className="text-muted-foreground block font-semibold mb-1">Catatan Pesanan:</span>
                <p className="italic text-foreground">{order.notes}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right 5 cols: Payment Summary & Bukti Transfer Upload */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Summary */}
          <Card className="rounded-3xl border shadow-xs p-6 space-y-4">
            <h3 className="font-extrabold text-base pb-3 border-b text-foreground">
              Rincian Pembayaran
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-foreground">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Biaya Pengiriman</span>
                <span className="font-semibold text-foreground">{formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Status Pembayaran</span>
                <span className="font-bold uppercase text-primary">{order.paymentStatus}</span>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-between items-baseline">
              <span className="font-bold text-sm text-foreground">Total Tagihan</span>
              <span className="font-black text-2xl text-primary">
                {formatCurrency(order.grandTotal)}
              </span>
            </div>
          </Card>

          {/* Bukti Transfer Upload Card */}
          <Card className="rounded-3xl border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-primary" />
                Bukti Pembayaran / Transfer
              </h3>
              {order.paymentProof && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Terunggah
                </span>
              )}
            </div>

            <ImageUpload
              value={newProofUrl}
              onChange={setNewProofUrl}
              label="Foto Struk / Screenshot QRIS"
              aspectRatio="cover"
              description="Unggah bukti pembayaran agar admin segera memproses pesanan"
            />

            {newProofUrl !== order.paymentProof && (
              <Button
                onClick={handleSaveProof}
                disabled={isUploadingProof || !newProofUrl}
                className="w-full font-bold rounded-xl text-xs gap-2 py-5 shadow-xs"
              >
                {isUploadingProof ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan Bukti...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Simpan & Kirim Bukti ke Admin
                  </>
                )}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
