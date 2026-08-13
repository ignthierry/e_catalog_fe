'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, X, ExternalLink, Image as ImageIcon } from 'lucide-react';
import bannersData from '@/data/banners.json';
import { Banner } from '@/types';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>(bannersData as Banner[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');

  const handleOpenAdd = () => {
    setBannerToEdit(null);
    setTitle('');
    setSubtitle('');
    setImage('https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1600&q=80');
    setLink('/products?category=c1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setBannerToEdit(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle);
    setImage(banner.image);
    setLink(banner.link);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (bannerToEdit) {
      setBanners(prev => prev.map(b => b.id === bannerToEdit.id ? { ...b, title, subtitle, image, link } : b));
      toast.success('Banner promosi berhasil diperbarui!');
    } else {
      const newBanner: Banner = {
        id: `b-${Date.now()}`,
        title,
        subtitle,
        image,
        link,
      };
      setBanners(prev => [...prev, newBanner]);
      toast.success('Banner promosi baru berhasil ditambahkan!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    if (confirm(`Hapus banner "${bannerTitle}"?`)) {
      setBanners(prev => prev.filter(b => b.id !== id));
      toast.error('Banner berhasil dihapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Banner Promo
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola slide banner promosi yang tampil di halaman beranda toko.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-xs">
          <Plus className="w-4 h-4" />
          Tambah Banner
        </Button>
      </div>
      
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
                  {banner.subtitle}
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
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Judul Banner
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
                  URL Gambar Banner
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
                  placeholder="/products?category=c1"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="font-bold">
                  Simpan Banner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
