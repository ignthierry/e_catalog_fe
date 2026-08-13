'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Image as ImageIcon } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  categories: Category[];
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategoryId(productToEdit.categoryId);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setStock(productToEdit.stock);
      setImageUrl(productToEdit.images[0] || '');
      setIsNew(Boolean(productToEdit.isNew));
    } else {
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '1');
      setPrice(150000);
      setOriginalPrice(undefined);
      setStock(20);
      setImageUrl('https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80');
      setIsNew(true);
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedProduct: Product = {
      id: productToEdit ? productToEdit.id : `p-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Mainan anak berkualitas terbaik dari OMEGA TOYS.',
      categoryId,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      images: [imageUrl || 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80'],
      isNew,
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="bg-white dark:bg-slate-900 text-foreground w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {productToEdit ? 'Ubah Data Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Isi formulir di bawah ini untuk menyimpan ke katalog mainan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900">
          {/* Image Preview & URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Gambar Produk
            </label>
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <p className="text-[11px] text-muted-foreground">
                  Masukkan link gambar online (Unsplash/CDN)
                </p>
              </div>
            </div>
          </div>

          {/* Nama Produk */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Nama Mainan <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: LEGO City Fire Rescue"
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Kategori & Status Baru */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Label Khusus
              </label>
              <label className="flex items-center gap-2 h-10 px-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-md cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-sm font-medium">Tandai sebagai Produk Baru</span>
              </label>
            </div>
          </div>

          {/* Harga & Diskon */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Harga Jual (Rp) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                required
                min={1000}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Harga Coret (Opsional)
              </label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={originalPrice || ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Misal: 250000"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Jumlah Stok <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                required
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deskripsi Lengkap
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan fitur, bahan, dan usia rekomendasi mainan..."
              className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="font-bold">
              {productToEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
