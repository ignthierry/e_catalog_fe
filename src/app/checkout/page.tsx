'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ArrowLeft, 
  CheckCircle2, 
  Truck, 
  QrCode, 
  Building2, 
  Copy, 
  ShieldCheck, 
  Lock, 
  Image as ImageIcon,
  Check,
  AlertCircle,
  LogIn,
  MapPin,
  Loader2,
  Search,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatCurrency } from '@/lib/whatsapp';
import { ROUTES, APP_CONFIG } from '@/lib/constants';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { AuthModal } from '@/components/auth/AuthModal';
import { toast } from 'sonner';

export interface CourierRateOption {
  id: string;
  code: string;
  courierName: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
  name: string;
}

const DEFAULT_FALLBACK_COURIERS: CourierRateOption[] = [
  { id: 'jne_reg', code: 'jne', courierName: 'JNE', service: 'REG', description: 'Layanan Reguler', cost: 18000, etd: '2-3 Hari', name: 'JNE Reguler (2-3 Hari)' },
  { id: 'jnt_ez', code: 'jnt', courierName: 'J&T Express', service: 'EZ', description: 'Reguler', cost: 18000, etd: '1-2 Hari', name: 'J&T Express (1-2 Hari)' },
  { id: 'sicepat_best', code: 'sicepat', courierName: 'SiCepat', service: 'BEST', description: 'Besok Sampai Tujuan', cost: 24000, etd: '1 Hari', name: 'SiCepat BEST (1 Hari)' },
  { id: 'pos_reg', code: 'pos', courierName: 'POS Indonesia', service: 'Pos Reguler', description: 'Reguler', cost: 15000, etd: '2-3 Hari', name: 'POS Indonesia Reguler (2-3 Hari)' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated, user, token } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingDetail, setShippingDetail] = useState('');
  const [notes, setNotes] = useState('');

  // RajaOngkir Dynamic Destination & Couriers
  const [destinationQuery, setDestinationQuery] = useState('');
  const [destinationResults, setDestinationResults] = useState<Array<{
    id: number;
    label: string;
    subdistrict: string;
    city: string;
    province: string;
    zipCode: string;
  }>>([]);
  const [selectedDestination, setSelectedDestination] = useState<{
    id: number;
    label: string;
    subdistrict: string;
    city: string;
    province: string;
    zipCode: string;
  } | null>(null);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);

  // Couriers list
  const [courierOptions, setCourierOptions] = useState<CourierRateOption[]>(DEFAULT_FALLBACK_COURIERS);
  const [selectedCourier, setSelectedCourier] = useState<CourierRateOption>(DEFAULT_FALLBACK_COURIERS[0]);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'Transfer Bank'>('QRIS');
  const [selectedBank, setSelectedBank] = useState(APP_CONFIG.bankAccounts[0]);
  const [paymentProofUrl, setPaymentProofUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setCustomerEmail(user.email);
      if (user.phoneNumber) setCustomerPhone(user.phoneNumber);
    }
  }, [user]);

  // Close destination dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        destinationDropdownRef.current &&
        !destinationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for RajaOngkir destinations
  useEffect(() => {
    if (!destinationQuery || destinationQuery.trim().length < 2) {
      setDestinationResults([]);
      return;
    }

    if (selectedDestination && destinationQuery === selectedDestination.label) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDestinations(true);
      try {
        const results = await api.shipping.searchDestinations(destinationQuery);
        setDestinationResults(results);
        setShowDestinationDropdown(true);
      } catch (err) {
        console.error('Failed to search destinations:', err);
      } finally {
        setIsSearchingDestinations(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [destinationQuery, selectedDestination]);

  // Calculate live shipping cost when destination changes
  const handleSelectDestination = async (dest: {
    id: number;
    label: string;
    subdistrict: string;
    city: string;
    province: string;
    zipCode: string;
  }) => {
    setSelectedDestination(dest);
    setDestinationQuery(dest.label);
    setShowDestinationDropdown(false);

    // Calculate approximate weight (default 1000g per order, or 500g per item)
    const calculatedWeight = Math.max(items.reduce((acc, it) => acc + (it.quantity * 500), 0), 1000);

    setIsLoadingCouriers(true);
    toast.loading('Menghitung tarif ongkir resmi RajaOngkir...', { id: 'calc-shipping' });

    try {
      const rates = await api.shipping.calculateCost(dest.id, calculatedWeight);
      if (rates && rates.length > 0) {
        setCourierOptions(rates);
        setSelectedCourier(rates[0]); // Default to cheapest
        toast.success(`Ditemukan ${rates.length} pilihan kurir pengiriman!`, { id: 'calc-shipping' });
      } else {
        toast.dismiss('calc-shipping');
        setCourierOptions(DEFAULT_FALLBACK_COURIERS);
        setSelectedCourier(DEFAULT_FALLBACK_COURIERS[0]);
      }
    } catch (err) {
      console.error('Failed to calculate shipping rates:', err);
      toast.dismiss('calc-shipping');
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  if (!mounted) {
    return <div className="container mx-auto px-4 py-16 min-h-[60vh]"></div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2 text-foreground">
          Keranjang Belanja Kosong
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Silakan pilih mainan terlebih dahulu sebelum melakukan checkout.
        </p>
        <Button asChild size="lg" className="font-bold rounded-2xl">
          <Link href={ROUTES.PRODUCTS}>Mulai Belanja</Link>
        </Button>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingCost = selectedCourier.cost;
  const grandTotal = subtotal + shippingCost;

  const handleCopyAccount = (number: string, bank: string) => {
    navigator.clipboard.writeText(number.replace(/-/g, ''));
    setCopiedBank(bank);
    toast.success(`Nomor rekening ${bank} disalin!`);
    setTimeout(() => setCopiedBank(null), 2500);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Silakan masuk atau daftar akun terlebih dahulu untuk melakukan transaksi.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !shippingDetail.trim()) {
      toast.error('Mohon lengkapi Nama Penerima, Nomor WhatsApp, dan Detail Alamat');
      return;
    }

    const fullAddress = selectedDestination
      ? `${shippingDetail.trim()} — [${selectedDestination.label}]`
      : shippingDetail.trim();

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || undefined,
        shipping_address: fullAddress,
        courier: selectedCourier.name,
        shipping_cost: shippingCost,
        payment_method: paymentMethod,
        payment_proof: paymentProofUrl || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const res = await api.orders.create(orderPayload, token);

      if (res && res.status === 'success' && res.data) {
        const createdOrder = res.data;
        clearCart();
        toast.success('Pesanan Berhasil Dibuat!', {
          description: `Nomor Pesanan: ${createdOrder.orderNumber}`,
        });
        router.push(`${ROUTES.ORDERS}/${createdOrder.id}`);
      } else {
        toast.error('Gagal membuat pesanan', {
          description: res?.message || 'Terjadi kesalahan sistem, silakan coba lagi.',
        });
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Gagal terhubung ke server', {
        description: 'Pastikan koneksi internet Anda stabil.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">
      {/* Back to Cart */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Link 
          href={ROUTES.CART} 
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">
            Checkout Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tarif ongkir otomatis real-time via RajaOngkir & metode pembayaran resmi.
          </p>
        </div>
      </div>

      {/* Auth Banner if not logged in */}
      {!isAuthenticated && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-destructive/5 border border-destructive/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">
                Login / Pendaftaran Diperlukan
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Anda harus masuk atau mendaftar akun customer terlebih dahulu agar dapat membuat pesanan dan melacak transaksi.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAuthModalOpen(true)}
            className="rounded-xl font-bold text-xs flex-shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Masuk / Daftar Sekarang
          </Button>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Data Pengiriman & Pembayaran */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Alamat Pengiriman & RajaOngkir */}
          <Card className="rounded-3xl border shadow-xs overflow-hidden">
            <div className="p-5 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="font-extrabold text-base text-foreground">
                  Informasi Penerima & Ongkir RajaOngkir
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live RajaOngkir API
              </span>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nama Penerima <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Nama Lengkap"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nomor WhatsApp / HP <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="081234567890"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email (Opsional untuk bukti invoice)
                </label>
                <Input
                  type="email"
                  placeholder="nama@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* RajaOngkir Destination Autocomplete */}
              <div className="space-y-1.5 relative" ref={destinationDropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    Kecamatan / Kota Tujuan <span className="text-destructive">*</span>
                  </span>
                  {selectedDestination && (
                    <span className="text-[10px] text-emerald-500 font-bold">
                      ✓ Terhubung: {selectedDestination.subdistrict || selectedDestination.city}
                    </span>
                  )}
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    {isSearchingDestinations ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama Kecamatan atau Kota (contoh: Grogol, Bandung, Kebayoran, Surabaya)..."
                    value={destinationQuery}
                    onChange={(e) => {
                      setDestinationQuery(e.target.value);
                      if (selectedDestination && e.target.value !== selectedDestination.label) {
                        setSelectedDestination(null);
                      }
                    }}
                    onFocus={() => {
                      if (destinationResults.length > 0) setShowDestinationDropdown(true);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                  />
                </div>

                {/* Dropdown Suggestions */}
                {showDestinationDropdown && destinationResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-card border border-border rounded-2xl shadow-xl divide-y divide-border/60 animate-in fade-in-50 zoom-in-95 duration-150">
                    {destinationResults.map((dest) => (
                      <button
                        key={dest.id}
                        type="button"
                        onClick={() => handleSelectDestination(dest)}
                        className="w-full text-left p-3 hover:bg-muted/40 transition-colors flex items-start gap-2.5 cursor-pointer text-xs"
                      >
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-foreground leading-tight">
                            {dest.subdistrict ? `${dest.subdistrict}, ` : ''}{dest.city}, {dest.province}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {dest.subdistrict ? `Kec. ${dest.subdistrict} • ` : ''}Kode Pos: {dest.zipCode || '-'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail Alamat Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detail Alamat Lengkap <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Nama Jalan, Nomor Bangunan/Rumah, RT/RW, Blok, Patokan, dll."
                  value={shippingDetail}
                  onChange={(e) => setShippingDetail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                />
              </div>

              {/* Kurir Ekspedisi Live */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-primary" /> Pilihan Ekspedisi & Tarif Real-Time
                  </label>
                  {isLoadingCouriers && (
                    <span className="text-[11px] text-primary flex items-center gap-1 font-bold">
                      <Loader2 className="w-3 h-3 animate-spin" /> Memuat tarif...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {courierOptions.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourier(c)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedCourier.id === c.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs'
                          : 'border-border hover:border-primary/40 bg-card'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                            {c.code.toUpperCase()}
                          </span>
                          <p className="text-xs font-bold text-foreground truncate">
                            {c.service} ({c.etd})
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {c.courierName} • {c.description}
                        </p>
                        <p className="text-xs font-extrabold text-primary mt-1">
                          {formatCurrency(c.cost)}
                        </p>
                      </div>

                      {selectedCourier.id === c.id ? (
                        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-border flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Catatan untuk Penjual (Opsional)
                </label>
                <Input
                  placeholder="Misal: Tolong bungkus kado, jangan dibanting, dll."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Metode Pembayaran */}
          <Card className="rounded-3xl border shadow-xs overflow-hidden">
            <div className="p-5 border-b bg-muted/20 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h2 className="font-extrabold text-base text-foreground">
                Pilih Metode Pembayaran
              </h2>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Payment Method Switch */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'QRIS'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <QrCode className="w-6 h-6 text-primary" />
                    {paymentMethod === 'QRIS' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="font-bold text-sm text-foreground">QRIS</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    GoPay, OVO, Dana, BCA, Mandiri, ShopeePay
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Transfer Bank')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentMethod === 'Transfer Bank'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/40 shadow-xs'
                      : 'border-border hover:border-primary/40 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Building2 className="w-6 h-6 text-primary" />
                    {paymentMethod === 'Transfer Bank' && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="font-bold text-sm text-foreground">Transfer Bank</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    BCA, Mandiri, BRI (Verifikasi Bukti)
                  </p>
                </button>
              </div>

              {/* QRIS Instructions */}
              {paymentMethod === 'QRIS' && (
                <div className="p-5 rounded-2xl border bg-muted/20 space-y-4 animate-in fade-in-50 duration-200">
                  <div className="text-center space-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      QRIS Resmi OMEGA TOYS
                    </span>
                    <h3 className="font-bold text-sm text-foreground">
                      Scan QR Code menggunakan Aplikasi E-Wallet / Mobile Banking
                    </h3>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border shadow-xs max-w-[220px] mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo.png"
                      alt="QRIS Logo"
                      className="h-6 object-contain mb-2"
                    />
                    <div className="w-40 h-40 bg-slate-900 rounded-xl p-2 flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-lg p-1.5 flex flex-col items-center justify-center text-center">
                        <QrCode className="w-28 h-28 text-slate-950" />
                        <span className="text-[9px] font-black text-slate-800 tracking-wider">NMID: ID1020039281</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-900 mt-2">
                      OMEGA TOYS INDONESIA
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 bg-background p-3 rounded-xl border">
                    <p className="font-bold text-foreground">Petunjuk Pembayaran QRIS:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                      <li>Buka aplikasi m-Banking atau E-Wallet pilihan Anda.</li>
                      <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                      <li>Masukkan nominal tepat sebesar: <strong className="text-primary">{formatCurrency(grandTotal)}</strong></li>
                      <li>Simpan tangkapan layar / bukti struk pembayaran, lalu unggah di bawah ini.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Transfer Bank Instructions */}
              {paymentMethod === 'Transfer Bank' && (
                <div className="p-5 rounded-2xl border bg-muted/20 space-y-4 animate-in fade-in-50 duration-200">
                  <p className="text-xs font-bold text-foreground">Pilih Rekening Tujuan Transfer:</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {APP_CONFIG.bankAccounts.map((b) => (
                      <button
                        type="button"
                        key={b.bank}
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedBank.bank === b.bank
                            ? 'border-primary bg-background shadow-xs font-bold'
                            : 'border-border hover:bg-muted/40'
                        }`}
                      >
                        <span className="text-xs font-extrabold text-foreground block">{b.bank}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Bank Details Card */}
                  <div className="p-4 bg-background rounded-2xl border space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">Bank Tujuan:</span>
                      <span className="text-xs font-black text-foreground">Bank {selectedBank.bank}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">Nomor Rekening:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-foreground">
                          {selectedBank.number}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyAccount(selectedBank.number, selectedBank.bank)}
                          className="h-7 w-7 rounded-lg text-primary"
                          title="Salin Nomor Rekening"
                        >
                          {copiedBank === selectedBank.bank ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">Atas Nama:</span>
                      <span className="text-xs font-bold text-foreground">{selectedBank.holder}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground font-semibold">Jumlah Transfer:</span>
                      <span className="font-extrabold text-sm text-primary">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Bukti Pembayaran Section */}
              <div className="pt-2 border-t">
                <ImageUpload
                  value={paymentProofUrl}
                  onChange={setPaymentProofUrl}
                  label="Unggah Foto Bukti Transfer / Screenshot Pembayaran"
                  aspectRatio="cover"
                  description="Format: PNG, JPG, WEBP • Disimpan aman di server FTP"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  Bukti pembayaran juga dapat diunggah / diperbarui setelah pesanan dibuat.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Order Items Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border shadow-xs p-6 sticky top-24 space-y-5">
            <h3 className="text-lg font-extrabold pb-3 border-b text-foreground">
              Ringkasan Belanja ({items.reduce((acc, i) => acc + i.quantity, 0)} Item)
            </h3>

            {/* Items List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-border/60 pr-1 space-y-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-muted border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.quantity}x @ {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 pt-3 border-t text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Produk</span>
                <span className="font-semibold text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Ongkos Kirim ({selectedCourier.name.split(' ')[0]})</span>
                <span className="font-semibold text-foreground">{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-primary">{paymentMethod}</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="pt-3 border-t flex justify-between items-baseline">
              <div>
                <span className="font-bold text-sm text-foreground block">Total Pembayaran</span>
                <span className="text-[10px] text-muted-foreground">Sudah termasuk ongkir</span>
              </div>
              <span className="font-black text-2xl text-primary">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            {!isAuthenticated ? (
              <Button
                type="button"
                size="lg"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-6 rounded-2xl font-black text-sm gap-2 shadow-sm bg-primary hover:bg-primary/90"
              >
                <Sparkles className="w-5 h-5" />
                Masuk / Daftar untuk Buat Pesanan
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full py-6 rounded-2xl font-black text-sm gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Memproses Pesanan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Konfirmasi & Buat Pesanan
                  </>
                )}
              </Button>
            )}

            <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
              Dengan mengklik tombol di atas, pesanan Anda akan langsung tercatat di sistem admin OMEGA TOYS untuk segera diproses.
            </p>
          </Card>
        </div>
      </form>

      {/* Auth Modal for Quick Login / Register */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          toast.success('Berhasil login! Anda sekarang dapat menyelesaikan transaksi.');
        }}
      />
    </div>
  );
}
