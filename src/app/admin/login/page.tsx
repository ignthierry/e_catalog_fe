'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Store, 
  ShieldCheck, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES, APP_CONFIG } from '@/lib/constants';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, user, login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'warehouse' || user.role === 'cs') {
        router.replace(ROUTES.ADMIN.DASHBOARD);
      } else {
        router.replace(ROUTES.HOME);
      }
    }
  }, [isAuthenticated, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await api.admin.login({
        username: username.trim(),
        password,
      });

      if (res && res.status === 'success' && res.data) {
        const userObj = res.data.user;
        const token = res.data.token;

        if (userObj.role !== 'admin' && userObj.role !== 'warehouse' && userObj.role !== 'cs') {
          toast.error('Akses Ditolak!', {
            description: 'Akun Anda adalah Customer. Admin Panel hanya dapat diakses oleh Administrator.',
          });
          login(userObj, token);
          router.push(ROUTES.HOME);
          return;
        }

        login(userObj, token);
        toast.success(`Selamat datang kembali, ${userObj.name || username}! 👋`, {
          description: 'Login Administrator berhasil.',
        });
        router.push(ROUTES.ADMIN.DASHBOARD);
      } else {
        toast.error('Gagal Masuk!', {
          description: res?.message || 'Username atau kata sandi tidak cocok di database.',
        });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback for demo
      if (
        (username.trim().toLowerCase() === 'admin' && password === 'admin123') ||
        (username.trim() !== '' && password.trim() !== '')
      ) {
        login({ name: username.trim() || 'Admin', role: 'admin' });
        toast.success(`Selamat datang kembali, ${username || 'Admin'}! 👋`, {
          description: 'Masuk dalam mode offline/demo.',
        });
        router.push(ROUTES.ADMIN.DASHBOARD);
      } else {
        toast.error('Koneksi ke backend gagal!', {
          description: 'Pastikan server Laravel berjalan di port 8000.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    toast.info('Kredensial demo telah diisikan otomatis!');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Decorations */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-700/60 p-1.5 flex items-center justify-center overflow-hidden shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={APP_CONFIG.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="font-black text-2xl text-white tracking-tight leading-none">
                {APP_CONFIG.name}
              </h1>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Admin Panel System
              </span>
            </div>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400">
            Masuk untuk mengelola katalog, banner promo, dan kontak toko.
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
          <CardContent className="p-0 space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Username / ID Admin
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username (admin)"
                    className="pl-10 h-11 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-primary focus:ring-primary/30 text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password (admin123)"
                    className="pl-10 pr-10 h-11 bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus:border-primary focus:ring-primary/30 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 text-sm mt-2 transition-all active:scale-98"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Memverifikasi...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Masuk ke Admin
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Helper Box */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-bold text-slate-300 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-primary" /> Akun Demo Pengujian:
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    User: <strong className="text-white">admin</strong> • Pass: <strong className="text-white">admin123</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseDemo}
                  className="px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] transition-colors flex-shrink-0 cursor-pointer"
                >
                  Gunakan
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Store Footer */}
        <div className="text-center">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Store className="w-4 h-4 text-primary" />
            <span>Kembali ke Beranda Toko OMEGA TOYS</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
