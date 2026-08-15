'use client';

import { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { APP_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, defaultTab = 'login', onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login: setAuthLogin } = useAuthStore();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Silakan isi email dan kata sandi');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.login({ username: email, password });
      if (res && res.status === 'success' && res.data) {
        setAuthLogin(res.data.user, res.data.token);
        toast.success(`Selamat datang kembali, ${res.data.user.name}! 👋`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.message || 'Email atau kata sandi tidak cocok.');
      }
    } catch (err: any) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Nama, email, dan kata sandi wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.register({
        name,
        email,
        phone_number: phone || undefined,
        password,
      });

      if (res && res.status === 'success' && res.data) {
        setAuthLogin(res.data.user, res.data.token);
        toast.success(`Akun berhasil dibuat! Selamat datang di ${APP_CONFIG.name}, ${res.data.user.name}! 🎉`);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.message || 'Gagal mendaftar akun');
      }
    } catch (err: any) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-3xl border border-border/80 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto relative">
        
        {/* Glow background accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer z-20"
          aria-label="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header with Logo & Animation */}
        <div className="p-6 pb-5 pt-7 border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent text-center flex flex-col items-center">
          {/* Logo with pulsing glowing ring */}
          <div className="relative mb-3 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-3xl blur-sm opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-2xl bg-white border border-border/80 p-1.5 flex items-center justify-center shadow-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={APP_CONFIG.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          <h3 className="font-black text-xl text-foreground tracking-tight flex items-center gap-1.5">
            {tab === 'login' ? 'Masuk ke' : 'Bergabung dengan'} {APP_CONFIG.name}
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
            {tab === 'login' 
              ? 'Kelola pesanan, riwayat belanja, dan nikmati promo eksklusif.'
              : 'Daftar akun gratis untuk kemudahan transaksi & pelacakan pesanan.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 bg-muted/40 border-b border-border/40">
          <div className="grid grid-cols-2 p-1 bg-background/80 rounded-2xl border border-border/60 text-xs font-bold shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setShowPassword(false);
              }}
              className={`py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-primary text-white shadow-sm font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setShowPassword(false);
              }}
              className={`py-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-primary text-white shadow-sm font-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daftar Baru</span>
            </button>
          </div>
        </div>

        {/* Form Body with Smooth Transition */}
        <div className="p-5 sm:p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in-50 slide-in-from-left-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email / No. WhatsApp / Username
                </label>
                <div className="relative">
                  <Input
                    required
                    type="text"
                    placeholder="nama@email.com atau 0812..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl bg-background text-xs sm:text-sm pl-3.5 pr-3 focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-primary" /> Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan kata sandi..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-xl bg-background text-xs sm:text-sm pl-3.5 pr-10 focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-black text-sm gap-2 mt-2 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 active:scale-98 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setShowPassword(false);
                  }}
                  className="text-primary font-black hover:underline cursor-pointer"
                >
                  Daftar Sekarang &rarr;
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5 animate-in fade-in-50 slide-in-from-right-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-primary" /> Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 rounded-xl text-xs sm:text-sm pl-3.5 bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Email <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl text-xs sm:text-sm pl-3.5 bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Nomor WhatsApp / Telepon
                </label>
                <Input
                  type="tel"
                  placeholder="081234567890 (opsional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-xl text-xs sm:text-sm pl-3.5 bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Kata Sandi (Min. 6 Karakter) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat kata sandi aman..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 rounded-xl text-xs sm:text-sm pl-3.5 pr-10 bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-black text-sm gap-2 mt-2 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 active:scale-98 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mendaftarkan Akun...
                  </>
                ) : (
                  <>
                    Daftar Akun Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setShowPassword(false);
                  }}
                  className="text-primary font-black hover:underline cursor-pointer"
                >
                  Masuk ke Akun &rarr;
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Trust Footer */}
        <div className="py-2.5 px-4 bg-muted/40 border-t border-border/40 text-center flex items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Data Terenkripsi </span>
        </div>

      </div>
    </div>
  );
}

