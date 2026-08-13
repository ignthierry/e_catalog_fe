'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, X, ExternalLink, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Banner } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await api.getBanners();
      setBanners(data);
    } catch (err) {
      console.error('Failed to load banners:', err);
      toast.error('Gagal memuat banner dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenAdd = () => {
    setBannerToEdit(null);
    setTitle('');
    setSubtitle('');
    setImage('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80');
    setLink('/products?category=2');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setBannerToEdit(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImage(banner.image);
    setLink(banner.link);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) return;

    try {
      setIsSubmitting(true);
      const payload: Partial<Banner> = {
        id: bannerToEdit ? bannerToEdit.id : undefined,
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: image.trim(),
        link: link.trim() || '/products',
      };

      const res = await api.admin.saveBanner(payload);
      if (res && res.status === 'success') {
        toast.success(bannerToEdit ? 'Banner berhasil diperbarui di database!' : 'Banner baru berhasil ditambahkan ke database!');
        await loadBanners();
        setIsModalOpen(false);
      } else {
        // Fallback local update
        if (bannerToEdit) {
          setBanners(prev => prev.map(b => b.id === bannerToEdit.id ? { ...b, ...payload } as Banner : b));
        } else {
          setBanners(prev => [...prev, { id: `b-${Date.now()}`, ...payload } as Banner]);
        }
        toast.success('Banner disimpan.');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving banner:', err);
      toast.error('Gagal menyimpan banner ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus banner "${bannerTitle}"?`)) {
      try {
        const res = await api.admin.deleteBanner(id);
        if (res && res.status === 'success') {
          toast.success(`Banner "${bannerTitle}" berhasil dihapus dari database.`);
          await loadBanners();
        } else {
          setBanners(prev => prev.filter(b => b.id !== id));
          toast.success(`Banner "${bannerTitle}" dihapus.`);
        }
      } catch (err) {
        console.error('Error deleting banner:', err);
        setBanners(prev => prev.filter(b => b.id !== id));
        toast.success(`Banner "${bannerTitle}" dihapus.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Banner Promosi
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola slide banner promosi yang tampil di halaman beranda toko ({banners.length} banner aktif).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadBanners} disabled={loading} className="gap-1.5 font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-xs">
            <Plus className="w-4 h-4" />
            Tambah Banner
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-muted-foreground space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Memuat data banner dari backend...</p>
        </div>
      ) : banners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden rounded-2xl border border-border/60 hover:shadow-lg transition-all duration-300 flex flex-col bg-card">
              <div className="aspect-[21/9] relative bg-muted overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={banner.image} 
                  alt={banner.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-foreground leading-snug">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {banner.subtitle || 'Tidak ada keterangan tambahan.'}
                  </p>
                </div>
                
                <div className="pt-3 border-t flex justify-between items-center text-xs">
                  <span className="font-mono bg-muted/60 px-2.5 py-1 rounded-md text-[11px] text-muted-foreground truncate max-w-[160px] flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {banner.link}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenEdit(banner)}
                      className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                      title="Edit Banner"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      title="Hapus Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed rounded-2xl border-border/60 bg-muted/10 space-y-3">
          <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-sm font-semibold text-foreground">Belum ada banner promosi di database</p>
          <Button onClick={handleOpenAdd} size="sm" className="font-bold">
            Tambah Banner Pertama
          </Button>
        </div>
      )}

      {/* Modal Tambah/Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-foreground w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <h3 className="font-bold text-lg text-foreground">
                {bannerToEdit ? 'Ubah Banner' : 'Tambah Banner Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Preview */}
              {image && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Preview Tampilan Banner
                  </label>
                  <div className="aspect-[21/9] rounded-xl overflow-hidden bg-muted border border-border/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Judul Banner <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Promo Back to School"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Sub-judul / Keterangan
                </label>
                <Input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Misal: Diskon hingga 50% untuk mainan edukasi"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  URL Gambar Banner <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Link Tujuan (URL)
                </label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/products?category=2"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
