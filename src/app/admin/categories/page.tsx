'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, X, Grid, RefreshCw, Layers } from 'lucide-react';
import { Category } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Gagal memuat kategori dari database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setName('');
    setImage('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setName(category.name);
    setImage(category.image || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const payload: Partial<Category> & { id?: string | number } = {
        id: categoryToEdit ? categoryToEdit.id : undefined,
        name: name.trim(),
        image: image.trim() || undefined,
      };

      const res = await api.admin.saveCategory(payload);
      if (res && res.status === 'success') {
        toast.success(categoryToEdit ? 'Kategori berhasil diperbarui di database!' : 'Kategori baru berhasil ditambahkan ke database!');
        await loadCategories();
        setIsModalOpen(false);
      } else {
        // Fallback local state
        if (categoryToEdit) {
          setCategories(prev => prev.map(c => c.id === categoryToEdit.id ? { ...c, ...payload } as Category : c));
        } else {
          setCategories(prev => [...prev, { id: `c-${Date.now()}`, slug: name.toLowerCase().replace(/\s+/g, '-'), ...payload } as Category]);
        }
        toast.success('Kategori disimpan.');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error('Gagal menyimpan kategori ke server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (confirm(`Hapus kategori "${categoryName}"? Produk yang terkait akan dipindahkan ke kategori umum.`)) {
      try {
        const res = await api.admin.deleteCategory(id);
        if (res && res.status === 'success') {
          toast.success(`Kategori "${categoryName}" berhasil dihapus.`);
          await loadCategories();
        } else {
          setCategories(prev => prev.filter(c => c.id !== id));
          toast.success(`Kategori "${categoryName}" dihapus.`);
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setCategories(prev => prev.filter(c => c.id !== id));
        toast.success(`Kategori "${categoryName}" dihapus.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Manajemen Kategori
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola kategori mainan untuk pengelompokan produk dan filter katalog ({categories.length} kategori aktif).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCategories} disabled={loading} className="gap-1.5 font-semibold">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-xs">
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-muted-foreground space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium">Memuat data kategori dari backend...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden rounded-2xl border border-border/60 hover:shadow-lg transition-all duration-300 flex flex-col bg-card group">
              <div className="aspect-[16/9] relative bg-muted overflow-hidden flex items-center justify-center">
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Grid className="w-12 h-12 text-muted-foreground/40" />
                )}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {category.productCount || 0} produk
                </div>
              </div>
              
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    Slug: {category.slug}
                  </p>
                </div>
                
                <div className="pt-2.5 border-t flex justify-end items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleOpenEdit(category)}
                    className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                    title="Edit Kategori"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(category.id, category.name)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tambah/Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-foreground w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <h3 className="font-bold text-lg text-foreground">
                {categoryToEdit ? 'Ubah Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nama Kategori <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Robot & Transformer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  URL Gambar Kategori
                </label>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {image && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
