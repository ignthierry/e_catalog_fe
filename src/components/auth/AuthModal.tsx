'use client';

import { useState } from 'react';
import { X, User as UserIcon, Mail, Lock, Phone, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
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
        toast.success(`Selamat datang kembali, ${res.data.user.name}!`);
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
        toast.success(`Akun berhasil dibuat! Selamat datang, ${res.data.user.name}!`);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-snug text-foreground">
                {tab === 'login' ? 'Masuk ke OMEGA TOYS' : 'Daftar Akun Customer'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {tab === 'login' ? 'Kelola pesanan & belanja lebih cepat' : 'Nikmati kemudahan order dan tracking'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-2 bg-muted/40 border-b border-border/40 text-xs font-bold">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`py-2 rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`py-2 rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" /> Email / No. Handphone
              </label>
              <Input
                required
                type="text"
                placeholder="nama@email.com atau 0812..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" /> Kata Sandi
              </label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-xl font-extrabold text-sm gap-2 mt-2 shadow-sm"
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

            <div className="pt-2 text-center text-xs text-muted-foreground">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Daftar Sekarang
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <UserIcon className="w-3.5 h-3.5" /> Nama Lengkap <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" /> Email <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5" /> Nomor WhatsApp / Telepon
              </label>
              <Input
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" /> Kata Sandi (Min. 6 Karakter) <span className="text-destructive">*</span>
              </label>
              <Input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-xl font-extrabold text-sm gap-2 mt-3 shadow-sm"
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

            <div className="pt-2 text-center text-xs text-muted-foreground">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Masuk ke Akun
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
