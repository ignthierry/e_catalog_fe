'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building,
  Sparkles,
  Eye,
  EyeOff,
  Package,
  ArrowRight,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { api, fixMediaUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { AuthModal } from '@/components/auth/AuthModal';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, token, updateUser, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'address' | 'security'>('profile');

  // Profile Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address Form States
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
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
    id: number | string;
    label: string;
    subdistrict: string;
    city: string;
    province: string;
    zipCode: string;
  } | null>(null);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form states from user store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || user.phone_number || '');
      setAddress(user.address || '');
      setPostalCode(user.postalCode || user.postal_code || '');

      if (user.avatarUrl || user.avatar) {
        setAvatarPreview(fixMediaUrl(user.avatarUrl || user.avatar));
      }

      if (user.subdistrictName || user.cityName || user.provinceName) {
        setSelectedDestination({
          id: user.subdistrictId || user.subdistrict_id || 0,
          label: `${user.subdistrictName || user.subdistrict_name || ''}, ${user.cityName || user.city_name || ''}, ${user.provinceName || user.province_name || ''}`,
          subdistrict: user.subdistrictName || user.subdistrict_name || '',
          city: user.cityName || user.city_name || '',
          province: user.provinceName || user.province_name || '',
          zipCode: user.postalCode || user.postal_code || '',
        });
      }
    }
  }, [user]);

  // Handle outside click for destination dropdown
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

  // Destination Search with Debounce
  useEffect(() => {
    if (!destinationQuery.trim() || destinationQuery.length < 2) {
      setDestinationResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDestinations(true);
      try {
        const results = await api.shipping.searchDestinations(destinationQuery.trim());
        setDestinationResults(results);
        setShowDestinationDropdown(true);
      } catch (err) {
        console.error('Failed to search destinations', err);
      } finally {
        setIsSearchingDestinations(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [destinationQuery]);

  // Handle Avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file foto maksimal 5 MB');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    // If authenticated, instantly upload avatar
    if (token) {
      setIsUploadingAvatar(true);
      try {
        const res = await api.auth.uploadAvatar(file, token);
        if (res && res.status === 'success' && res.data) {
          updateUser({
            avatar: res.data.avatar,
            avatarUrl: res.data.avatar_url,
            avatar_url: res.data.avatar_url,
          });
          toast.success('Foto profil berhasil diperbarui!');
        } else {
          toast.error(res?.message || 'Gagal mengunggah foto profil');
        }
      } catch (err) {
        toast.error('Terjadi kesalahan saat mengunggah foto');
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!token) return;
    setIsUploadingAvatar(true);
    try {
      const res = await api.auth.updateProfile({
        name: name || user?.name || '',
        email: email || user?.email || '',
        avatar: '',
      }, token);

      if (res && res.status === 'success') {
        setAvatarPreview(null);
        setAvatarFile(null);
        updateUser({
          avatar: '',
          avatarUrl: '',
          avatar_url: '',
        });
        toast.success('Foto profil dihapus');
      }
    } catch {
      toast.error('Gagal menghapus foto profil');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save Profile Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim() || !email.trim()) {
      toast.error('Nama dan email wajib diisi');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await api.auth.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone_number: phone.trim() || undefined,
      }, token);

      if (res && res.status === 'success' && res.data) {
        updateUser(res.data);
        toast.success('Data profil berhasil diperbarui!');
      } else {
        toast.error(res?.message || 'Gagal memperbarui profil');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Address Details
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingAddress(true);
    try {
      const payload: Record<string, any> = {
        name: name || user?.name || '',
        email: email || user?.email || '',
        phone_number: phone || user?.phoneNumber || '',
        address: address.trim(),
        postal_code: postalCode.trim() || selectedDestination?.zipCode || '',
      };

      if (selectedDestination) {
        payload.subdistrict_id = String(selectedDestination.id);
        payload.subdistrict_name = selectedDestination.subdistrict;
        payload.city_name = selectedDestination.city;
        payload.province_name = selectedDestination.province;
      }

      const res = await api.auth.updateProfile(payload, token);

      if (res && res.status === 'success' && res.data) {
        updateUser(res.data);
        toast.success('Alamat pengiriman berhasil disimpan!');
      } else {
        toast.error(res?.message || 'Gagal menyimpan alamat');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan alamat');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Save Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!currentPassword) {
      toast.error('Masukkan kata sandi saat ini');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await api.auth.updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      }, token);

      if (res && res.status === 'success') {
        toast.success('Kata sandi berhasil diubah!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res?.message || 'Gagal mengubah kata sandi');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat mengubah kata sandi');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!mounted) {
    return null;
  }

  // If user is not authenticated, show sign in prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
          <UserIcon className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">Akses Pengaturan Akun</h1>
          <p className="text-sm text-muted-foreground">
            Silakan masuk atau daftar akun terlebih dahulu untuk mengelola data profil, alamat, dan kata sandi Anda.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            size="lg"
            onClick={() => setIsAuthModalOpen(true)}
            className="font-bold gap-2 rounded-xl"
          >
            <UserIcon className="w-4 h-4" /> Masuk ke Akun
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push(ROUTES.HOME)}
            className="font-bold rounded-xl"
          >
            Kembali ke Beranda
          </Button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-10 space-y-8 max-w-5xl">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Beranda', href: ROUTES.HOME },
          { label: 'Pengaturan Akun' },
        ]}
      />

      {/* Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar with Upload Hover Button */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-primary/30 shadow-md bg-muted/60 flex items-center justify-center flex-shrink-0 relative">
              {avatarPreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarPreview}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-black text-3xl sm:text-4xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* Uploading Overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] mt-1 font-bold">Mengunggah...</span>
                </div>
              )}
            </div>

            {/* Quick Upload Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-background"
              title="Ganti Foto Profil"
              aria-label="Ganti Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Info Header */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground truncate">
                {user.name}
              </h1>
              <Badge variant="outline" className="font-bold border-primary/40 text-primary uppercase text-[11px] px-2.5 py-0.5">
                {user.role === 'admin' ? 'Administrator' : user.role === 'warehouse' ? 'Staff Gudang' : user.role === 'cs' ? 'Customer Service' : 'Member Customer'}
              </Badge>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
              {user.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-muted-foreground">
              {user.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-primary" /> {user.phoneNumber}
                </span>
              )}
              {selectedDestination && (
                <span className="flex items-center gap-1 truncate max-w-[300px]">
                  <MapPin className="w-3.5 h-3.5 text-secondary" /> {selectedDestination.subdistrict}, {selectedDestination.city}
                </span>
              )}
            </div>

            {avatarPreview && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                  className="text-xs text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Foto Profil
                </button>
              </div>
            )}
          </div>

          {/* Quick Order Link */}
          <div className="hidden md:flex flex-col gap-2 items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(ROUTES.MY_ORDERS)}
              className="rounded-xl font-bold gap-2 text-xs h-9 border-border/80"
            >
              <Package className="w-4 h-4 text-primary" />
              <span>Riwayat Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border space-x-2 sm:space-x-8 overflow-x-auto hide-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`py-3.5 px-2 border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Informasi Profil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`py-3.5 px-2 border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'address'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Alamat Pengiriman</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`py-3.5 px-2 border-b-2 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Kata Sandi & Keamanan</span>
        </button>
      </div>

      {/* TAB 1: Profile Information */}
      {activeTab === 'profile' && (
        <div className="bg-card rounded-3xl border p-6 sm:p-8 shadow-xs animate-in fade-in-50 duration-200">
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Data Diri & Kontak</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Perbarui nama lengkap, alamat email, dan nomor WhatsApp untuk notifikasi pemesanan.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-primary" /> Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" /> Alamat Email <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11 font-mono"
                />
                <p className="text-[11px] text-muted-foreground">
                  Email digunakan untuk masuk ke akun dan menerima rincian invoice pembelian.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" /> Nomor WhatsApp / Handphone
                </label>
                <Input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl h-11"
                />
                <p className="text-[11px] text-muted-foreground">
                  Nomor WhatsApp digunakan kurir dan admin untuk konfirmasi pesanan atau resi.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSavingProfile}
                  className="gap-2 font-bold rounded-xl h-11 px-6 shadow-sm"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan Perubahan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Profil
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Address Details */}
      {activeTab === 'address' && (
        <div className="bg-card rounded-3xl border p-6 sm:p-8 shadow-xs animate-in fade-in-50 duration-200">
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Alamat Pengiriman Utama</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Alamat ini akan otomatis terisi saat Anda melakukan checkout di toko.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              {/* Destination Autocomplete Search */}
              <div className="space-y-1.5 relative" ref={destinationDropdownRef}>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-secondary" /> Kecamatan & Kota / Kabupaten
                </label>
                
                {selectedDestination ? (
                  <div className="p-3.5 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold text-foreground truncate">
                          {selectedDestination.subdistrict}, {selectedDestination.city}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Provinsi: {selectedDestination.province} • Kodepos: {selectedDestination.zipCode || '-'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDestination(null);
                        setDestinationQuery('');
                      }}
                      className="text-xs text-secondary hover:text-destructive h-8 px-2 font-bold"
                    >
                      Ubah Wilayah
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Ketik nama kecamatan atau kota (contoh: Gambir, Cibinong, Sukolilo)..."
                      value={destinationQuery}
                      onChange={(e) => setDestinationQuery(e.target.value)}
                      onFocus={() => destinationResults.length > 0 && setShowDestinationDropdown(true)}
                      className="rounded-xl h-11 pr-10"
                    />
                    {isSearchingDestinations && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}

                    {/* Results dropdown */}
                    {showDestinationDropdown && destinationResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-border/40">
                        {destinationResults.map((dest) => (
                          <button
                            key={dest.id}
                            type="button"
                            onClick={() => {
                              setSelectedDestination(dest);
                              if (dest.zipCode && !postalCode) {
                                setPostalCode(dest.zipCode);
                              }
                              setShowDestinationDropdown(false);
                            }}
                            className="w-full p-3 text-left hover:bg-muted transition-colors flex items-center gap-2.5 cursor-pointer text-xs"
                          >
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground truncate">{dest.subdistrict}, {dest.city}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{dest.province} • {dest.zipCode}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Detail Alamat Lengkap
                </label>
                <textarea
                  rows={3}
                  placeholder="Nama Jalan, No. Rumah/Gedung, RT/RW, Blok/Unit, Patokan lokasi..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-y"
                />
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Kode Pos
                </label>
                <Input
                  type="text"
                  placeholder="Contoh: 10110"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="rounded-xl h-11 max-w-xs font-mono"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSavingAddress}
                  className="gap-2 font-bold rounded-xl h-11 px-6 shadow-sm"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan Alamat...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Alamat
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Security & Password */}
      {activeTab === 'security' && (
        <div className="bg-card rounded-3xl border p-6 sm:p-8 shadow-xs animate-in fade-in-50 duration-200">
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Ganti Kata Sandi</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Amankan akun Anda dengan menggunakan kata sandi kombinasi yang kuat dan unik.
              </p>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Kata Sandi Saat Ini <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    required
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Lihat kata sandi"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" /> Kata Sandi Baru (Min. 6 Karakter) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    required
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Lihat kata sandi baru"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Konfirmasi Kata Sandi Baru <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    required
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Lihat konfirmasi kata sandi"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword && (
                  <p className={`text-xs flex items-center gap-1 font-medium ${
                    newPassword === confirmPassword ? 'text-emerald-600' : 'text-destructive'
                  }`}>
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Kata sandi cocok
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" /> Kata sandi tidak cocok
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSavingPassword}
                  className="gap-2 font-bold rounded-xl h-11 px-6 shadow-sm"
                >
                  {isSavingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memperbarui Kata Sandi...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Ubah Kata Sandi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
