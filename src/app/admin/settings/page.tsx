'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, Store, MessageCircle, Mail, MapPin, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState(APP_CONFIG.name);
  const [storeDesc, setStoreDesc] = useState(APP_CONFIG.description);
  const [whatsapp, setWhatsapp] = useState(APP_CONFIG.defaultWhatsApp);
  const [email, setEmail] = useState(APP_CONFIG.contactEmail);
  const [address, setAddress] = useState('Jakarta, Indonesia');
  
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [savingWA, setSavingWA] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await api.getSettings();
      if (settings) {
        if (settings.store_name) setStoreName(settings.store_name);
        if (settings.store_description) setStoreDesc(settings.store_description);
        if (settings.whatsapp_number) setWhatsapp(settings.whatsapp_number);
        if (settings.contact_email) setEmail(settings.contact_email);
        if (settings.address) setAddress(settings.address);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      toast.error('Gagal memuat pengaturan dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingStore(true);
      const payload = {
        store_name: storeName.trim(),
        store_description: storeDesc.trim(),
        contact_email: email.trim(),
        address: address.trim(),
      };

      const res = await api.admin.saveSettings(payload);
      if (res && res.status === 'success') {
        toast.success('Informasi toko berhasil disimpan ke database!');
      } else {
        toast.success('Informasi toko disimpan.');
      }
    } catch (err) {
      console.error('Error saving store info:', err);
      toast.error('Gagal menyimpan ke server');
    } finally {
      setSavingStore(false);
    }
  };

  const handleSaveWA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingWA(true);
      const cleanWA = whatsapp.replace(/\D/g, '');
      const payload = {
        whatsapp_number: cleanWA,
      };

      const res = await api.admin.saveSettings(payload);
      if (res && res.status === 'success') {
        toast.success('Nomor WhatsApp Admin berhasil disimpan ke database!');
      } else {
        toast.success('Nomor WhatsApp Admin diperbarui.');
      }
    } catch (err) {
      console.error('Error saving WhatsApp:', err);
      toast.error('Gagal menyimpan nomor WhatsApp');
    } finally {
      setSavingWA(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Pengaturan Sistem
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Konfigurasi informasi toko, alamat, dan nomor WhatsApp penerima pesanan.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSettings} disabled={loading} className="gap-1.5 font-semibold">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Memuat pengaturan dari database...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Form WhatsApp Checkout */}
          <form onSubmit={handleSaveWA}>
            <Card className="rounded-2xl border border-emerald-500/20 shadow-xs overflow-hidden">
              <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 p-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <MessageCircle className="w-5 h-5" />
                    Konfigurasi Checkout WhatsApp
                  </CardTitle>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terintegrasi
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Nomor WhatsApp Admin (Penerima Order) <span className="text-destructive">*</span>
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-mono text-sm">
                        +
                      </div>
                      <Input 
                        required
                        value={whatsapp} 
                        onChange={(e) => setWhatsapp(e.target.value)} 
                        placeholder="Misal: 628123456789" 
                        className="pl-7 font-mono font-bold text-sm"
                      />
                    </div>
                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=Halo%20Admin%20${encodeURIComponent(storeName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors border flex-shrink-0"
                      >
                        Tes Chat <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Format internasional tanpa spasi atau simbol (Contoh: <strong>6281234567890</strong>). Setiap klik &ldquo;Order via WhatsApp&rdquo; dari keranjang pembeli akan langsung membuka chat ke nomor ini.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 pb-4 bg-muted/20 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={savingWA}
                  className="gap-2 font-bold shadow-xs bg-[#25D366] hover:bg-[#1fa952] text-white"
                >
                  <Save className="w-4 h-4" />
                  {savingWA ? 'Menyimpan...' : 'Simpan Nomor WhatsApp'}
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Form Informasi Toko */}
          <form onSubmit={handleSaveStore}>
            <Card className="rounded-2xl border shadow-xs overflow-hidden">
              <CardHeader className="bg-muted/10 border-b p-5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  Informasi Profil Toko
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Nama Toko <span className="text-destructive">*</span>
                    </label>
                    <Input 
                      required
                      value={storeName} 
                      onChange={(e) => setStoreName(e.target.value)} 
                      placeholder="OMEGA TOYS"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Kontak
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input 
                        type="email"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="hello@omegatoys.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Deskripsi / Tagline Toko
                  </label>
                  <Input 
                    value={storeDesc} 
                    onChange={(e) => setStoreDesc(e.target.value)} 
                    placeholder="Katalog Mainan Edukasi & Koleksi Terbaik"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Alamat Fisik / Lokasi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <Input 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Jakarta, Indonesia"
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 pb-4 bg-muted/20 flex justify-end">
                <Button type="submit" disabled={savingStore} className="gap-2 font-bold shadow-xs">
                  <Save className="w-4 h-4" />
                  {savingStore ? 'Menyimpan...' : 'Simpan Informasi Toko'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      )}
    </div>
  );
}
