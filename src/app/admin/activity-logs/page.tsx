'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Search, 
  RefreshCw, 
  Trash2, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  Activity, 
  Globe, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  Code, 
  X, 
  AlertCircle, 
  Sparkles,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '@/lib/api';
import { ActivityLog, ActivityLogsResponse } from '@/types';
import { toast } from 'sonner';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    todayLogins: 0,
    uniqueIps: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
    hasMorePages: false,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  // Modals
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<ActivityLog | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearOption, setClearOption] = useState<'30' | '7' | 'all'>('30');
  const [isClearing, setIsClearing] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.admin.getActivityLogs({
        page,
        per_page: 20,
        search: search.trim() || undefined,
        action: selectedAction !== 'ALL' ? selectedAction : undefined,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        date: selectedDate !== 'ALL' ? selectedDate : undefined,
      });

      if (res && res.status === 'success') {
        setLogs(res.data || []);
        if (res.stats) setStats(res.stats);
        if (res.pagination) setPagination(res.pagination);
        if (res.availableActions) setAvailableActions(res.availableActions);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      toast.error('Gagal memuat data log aktivitas');
    } finally {
      setLoading(false);
    }
  }, [search, selectedAction, selectedRole, selectedDate]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`Alamat IP ${ip} disalin ke clipboard`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      const days = clearOption === 'all' ? 0 : parseInt(clearOption, 10);
      const res = await api.admin.clearActivityLogs(days);
      if (res && res.status === 'success') {
        toast.success(res.message || 'Log berhasil dibersihkan');
        setShowClearModal(false);
        fetchLogs(1);
      } else {
        toast.error('Gagal membersihkan log aktivitas');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat membersihkan log');
    } finally {
      setIsClearing(false);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 30) return 'Baru saja';
      if (diffInSeconds < 60) return `${diffInSeconds} dtk lalu`;
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) return `${diffInMinutes} mnt lalu`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} jam lalu`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} hari lalu`;

      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return {
          label: 'Login Sukses',
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case 'FAILED_LOGIN':
        return {
          label: 'Login Gagal',
          bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse',
          dot: 'bg-rose-500',
        };
      case 'LOGOUT':
        return {
          label: 'Logout',
          bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          dot: 'bg-slate-500',
        };
      case 'CREATE_PRODUCT':
      case 'CREATE_CATEGORY':
      case 'CREATE_BANNER':
        return {
          label: 'Tambah Data',
          bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'UPDATE_PRODUCT':
      case 'UPDATE_CATEGORY':
      case 'UPDATE_BANNER':
      case 'UPDATE_SETTINGS':
        return {
          label: 'Edit Data',
          bg: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
          dot: 'bg-sky-500',
        };
      case 'DELETE_PRODUCT':
      case 'DELETE_CATEGORY':
      case 'DELETE_BANNER':
        return {
          label: 'Hapus Data',
          bg: 'bg-red-500/10 text-red-500 border-red-500/20',
          dot: 'bg-red-500',
        };
      case 'UPDATE_ORDER_STATUS':
        return {
          label: 'Status Pesanan',
          bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          dot: 'bg-purple-500',
        };
      case 'UPLOAD_IMAGE':
        return {
          label: 'Upload Gambar',
          bg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
          dot: 'bg-indigo-500',
        };
      default:
        return {
          label: action,
          bg: 'bg-primary/10 text-primary border-primary/20',
          dot: 'bg-primary',
        };
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">Admin</span>;
      case 'warehouse':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Gudang</span>;
      case 'cs':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">CS</span>;
      case 'customer':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Pembeli</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border">Tamu</span>;
    }
  };

  const getDeviceIcon = (deviceStr: string) => {
    const lower = (deviceStr || '').toLowerCase();
    if (lower.includes('iphone') || lower.includes('android')) {
      return <Smartphone className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />;
    }
    if (lower.includes('ipad') || lower.includes('tablet')) {
      return <Tablet className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />;
    }
    if (lower.includes('mac') || lower.includes('windows') || lower.includes('linux')) {
      return <Laptop className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />;
    }
    return <Monitor className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Audit Trail & Activity Tracer
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Log Aktivitas Sistem
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pantau jejak aktivitas pengguna, status login, alamat IP, dan perangkat yang mengakses admin secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLogs(pagination.currentPage)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold text-xs border border-destructive/20 shadow-xs transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Logs */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Total Log</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground mt-2">
            {stats.total.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-bold">●</span> Tercatat di database
          </p>
        </div>

        {/* Today's Activity */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Aksi Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-sky-500 mt-2">
            {stats.today.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Aktivitas 24 jam terakhir
          </p>
        </div>

        {/* Today's Logins */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Sesi Login Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500 mt-2">
            {stats.todayLogins.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Autentikasi berhasil
          </p>
        </div>

        {/* Unique IP Addresses */}
        <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">IP Unik Terlacak</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-500 mt-2">
            {stats.uniqueIps.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Jejak jaringan berbeda
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama, email, alamat IP, perangkat, atau deskripsi aksi..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-muted/40 border border-border rounded-xl focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-medium"
            />
          </form>

          {/* Action Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold px-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            {/* Action Select */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-muted/40 border border-border rounded-xl focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
            >
              <option value="ALL">Semua Aksi</option>
              <option value="LOGIN">Login Sukses</option>
              <option value="FAILED_LOGIN">Login Gagal</option>
              <option value="LOGOUT">Logout</option>
              <option value="UPDATE_ORDER_STATUS">Status Pesanan</option>
              <option value="CREATE_PRODUCT">Tambah Produk</option>
              <option value="UPDATE_PRODUCT">Edit Produk</option>
              <option value="DELETE_PRODUCT">Hapus Produk</option>
              <option value="CREATE_CATEGORY">Tambah Kategori</option>
              <option value="UPDATE_CATEGORY">Edit Kategori</option>
              <option value="DELETE_CATEGORY">Hapus Kategori</option>
              <option value="CREATE_BANNER">Tambah Banner</option>
              <option value="UPDATE_BANNER">Edit Banner</option>
              <option value="DELETE_BANNER">Hapus Banner</option>
              <option value="UPDATE_SETTINGS">Pengaturan Toko</option>
              <option value="UPLOAD_IMAGE">Upload Gambar</option>
            </select>

            {/* Role Select */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-muted/40 border border-border rounded-xl focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
            >
              <option value="ALL">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="warehouse">Gudang</option>
              <option value="cs">CS</option>
              <option value="customer">Pembeli</option>
              <option value="guest">Tamu / Sistem</option>
            </select>

            {/* Date Select */}
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-muted/40 border border-border rounded-xl focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
            >
              <option value="ALL">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="yesterday">Kemarin</option>
              <option value="7days">7 Hari Terakhir</option>
              <option value="30days">30 Hari Terakhir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Activity Log Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/30 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Aksi</th>
                <th className="py-3.5 px-4">Deskripsi Aktivitas</th>
                <th className="py-3.5 px-4">Alamat IP</th>
                <th className="py-3.5 px-4">Perangkat & Browser</th>
                <th className="py-3.5 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                      <p className="font-bold">Memuat log aktivitas...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-1">
                        <History className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-foreground">Tidak Ada Log Aktivitas Ditemukan</p>
                      <p className="text-xs text-muted-foreground">
                        Belum ada aktivitas yang cocok dengan kriteria pencarian atau filter yang dipilih.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = getActionBadge(log.action);

                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-muted/25 transition-colors group"
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-foreground">
                          {formatRelativeTime(log.created_at)}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 min-w-[160px]">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[11px] flex-shrink-0">
                            {log.user_name ? log.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">{log.user_name || 'Tamu / Sistem'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getRoleBadge(log.user_role)}
                              {log.user_email && log.user_email !== '-' && (
                                <span className="text-[10px] text-muted-foreground truncate font-mono hidden sm:inline">
                                  {log.user_email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Action Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-medium text-foreground leading-relaxed">
                          {log.description}
                        </p>
                      </td>

                      {/* IP Address */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-muted/40 hover:bg-muted px-2 py-1 rounded-lg border border-border/80 font-mono text-[11px] text-foreground transition-colors">
                          <Globe className="w-3 h-3 text-muted-foreground" />
                          <span>{log.ip_address}</span>
                          <button
                            onClick={() => handleCopyIp(log.ip_address)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer ml-1 p-0.5 rounded hover:bg-background"
                            title="Salin IP"
                          >
                            {copiedIp === log.ip_address ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Device & Browser */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          {getDeviceIcon(log.device)}
                          <span className="truncate max-w-[180px]" title={log.device || log.user_agent || ''}>
                            {log.device || 'Perangkat Standar'}
                          </span>
                        </div>
                      </td>

                      {/* Options / Inspect JSON Payload */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {log.properties ? (
                          <button
                            onClick={() => setSelectedLogForDetail(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            <Code className="w-3 h-3" />
                            <span>Payload</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground/40 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p className="font-medium">
            Menampilkan <span className="font-bold text-foreground">{logs.length}</span> dari{' '}
            <span className="font-bold text-foreground">{pagination.total}</span> total log aktivitas
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3 py-1 font-bold text-foreground">
              Halaman {pagination.currentPage} / {pagination.lastPage || 1}
            </span>

            <button
              onClick={() => fetchLogs(pagination.currentPage + 1)}
              disabled={!pagination.hasMorePages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Payload Inspection Modal */}
      {selectedLogForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">
                    Detail Metadata Aktivitas #{selectedLogForDetail.id}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Aksi: {selectedLogForDetail.action} ({selectedLogForDetail.user_name})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-2xl border border-border/60">
                <div>
                  <span className="text-muted-foreground font-semibold">Waktu Kejadian:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {new Date(selectedLogForDetail.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Alamat IP:</span>
                  <p className="font-mono font-bold text-foreground mt-0.5">
                    {selectedLogForDetail.ip_address}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Perangkat / OS:</span>
                  <p className="font-medium text-foreground mt-0.5">
                    {selectedLogForDetail.device}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">Pengguna:</span>
                  <p className="font-bold text-foreground mt-0.5">
                    {selectedLogForDetail.user_name} ({selectedLogForDetail.user_role})
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-foreground mb-1.5 block">
                  Data Tambahan (JSON Properties Payload):
                </span>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-border/80 shadow-inner">
                  {JSON.stringify(selectedLogForDetail.properties, null, 2)}
                </pre>
              </div>

              {selectedLogForDetail.user_agent && (
                <div>
                  <span className="font-bold text-foreground mb-1 block">
                    Full User-Agent Header:
                  </span>
                  <p className="p-2.5 rounded-xl bg-muted/40 text-muted-foreground font-mono text-[10px] break-all border border-border/60">
                    {selectedLogForDetail.user_agent}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end bg-muted/10">
              <button
                onClick={() => setSelectedLogForDetail(null)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-destructive">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-black text-base text-foreground leading-tight">
                  Bersihkan Log Aktivitas
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pilih rentang data log yang ingin dihapus dari database.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                clearOption === '30' ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="clearOption"
                    checked={clearOption === '30'}
                    onChange={() => setClearOption('30')}
                    className="accent-primary"
                  />
                  <span>Hapus log yang lebih lama dari 30 hari</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Rekomendasi</span>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                clearOption === '7' ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="clearOption"
                    checked={clearOption === '7'}
                    onChange={() => setClearOption('7')}
                    className="accent-primary"
                  />
                  <span>Hapus log yang lebih lama dari 7 hari</span>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                clearOption === 'all' ? 'border-destructive bg-destructive/5 text-destructive' : 'border-border bg-card text-muted-foreground'
              }`}>
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="clearOption"
                    checked={clearOption === 'all'}
                    onChange={() => setClearOption('all')}
                    className="accent-destructive"
                  />
                  <span className="text-destructive font-bold">Kosongkan seluruh log aktivitas</span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-destructive/10 text-destructive">Hati-hati</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-bold text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                disabled={isClearing}
                className="px-4 py-2.5 rounded-xl bg-destructive text-white hover:bg-destructive/90 font-bold text-xs shadow-xs cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isClearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isClearing ? 'Membersihkan...' : 'Hapus Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
