'use client';

import { useState, useEffect } from 'react';
import { Product, Category, Variant, VariantItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { 
  X, Plus, Trash2, Star, Image as ImageIcon, 
  Layers, Sparkles, Tag, Check, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/whatsapp';

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
  const [isNew, setIsNew] = useState(false);

  // Multi-Photo States
  const [images, setImages] = useState<string[]>([]);
  const [tempUploadUrl, setTempUploadUrl] = useState('');

  // Variant States with Individual Pricing
  const [variantItems, setVariantItems] = useState<VariantItem[]>([]);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantAddPrice, setNewVariantAddPrice] = useState<number>(0);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategoryId(productToEdit.categoryId);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setStock(productToEdit.stock);
      setImages(productToEdit.images || []);
      setIsNew(Boolean(productToEdit.isNew));

      // Extract existing variant items
      if (productToEdit.variants && productToEdit.variants.length > 0) {
        const primaryVariant = productToEdit.variants[0];
        if (primaryVariant.items && primaryVariant.items.length > 0) {
          setVariantItems(primaryVariant.items);
        } else if (primaryVariant.options && primaryVariant.options.length > 0) {
          setVariantItems(
            primaryVariant.options.map((opt) => ({
              name: opt,
              additionalPrice: 0,
              price: productToEdit.price,
            }))
          );
        } else {
          setVariantItems([]);
        }
      } else {
        setVariantItems([]);
      }
    } else {
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '1');
      setPrice(150000);
      setOriginalPrice(undefined);
      setStock(20);
      setImages([]);
      setVariantItems([]);
      setIsNew(true);
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  // Handle adding uploaded image to gallery
  const handleAddImage = (url: string) => {
    if (!url) return;
    if (!images.includes(url)) {
      setImages((prev) => [...prev, url]);
      toast.success('Foto berhasil ditambahkan ke galeri produk!');
    }
    setTempUploadUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [primary] = copy.splice(indexToPrimary, 1);
      return [primary, ...copy];
    });
    toast.info('Foto utama produk diperbarui!');
  };

  // Handle adding variant option with pricing
  const handleAddVariant = () => {
    const trimmed = newVariantName.trim();
    if (!trimmed) {
      toast.error('Ketik nama varian terlebih dahulu');
      return;
    }
    if (variantItems.some((v) => v.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Varian dengan nama ini sudah ada');
      return;
    }

    const addPrice = Number(newVariantAddPrice) || 0;
    setVariantItems((prev) => [
      ...prev,
      {
        name: trimmed,
        additionalPrice: addPrice,
        price: Number(price) + addPrice,
      },
    ]);
    setNewVariantName('');
    setNewVariantAddPrice(0);
    toast.success(`Varian "${trimmed}" ditambahkan!`);
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariantItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleUpdateVariantPrice = (index: number, newAddPrice: number) => {
    setVariantItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        additionalPrice: newAddPrice,
        price: Number(price) + newAddPrice,
      };
      return copy;
    });
  };

  const handleQuickAddTemplate = (options: { name: string; addPrice: number }[]) => {
    setVariantItems((prev) => {
      const existingNames = new Set(prev.map((v) => v.name.toLowerCase()));
      const toAdd = options
        .filter((opt) => !existingNames.has(opt.name.toLowerCase()))
        .map((opt) => ({
          name: opt.name,
          additionalPrice: opt.addPrice,
          price: Number(price) + opt.addPrice,
        }));
      return [...prev, ...toAdd];
    });
    toast.success('Template varian ditambahkan!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Nama mainan wajib diisi');
      return;
    }

    const finalImages = images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=800&q=80'];

    const formattedVariants: Variant[] = variantItems.length > 0
      ? [
          {
            id: 'v1',
            name: 'Pilihan Varian',
            options: variantItems.map((v) => v.name),
            items: variantItems.map((v) => ({
              ...v,
              additionalPrice: Number(v.additionalPrice) || 0,
              price: Number(price) + (Number(v.additionalPrice) || 0),
            })),
          },
        ]
      : [];

    const updatedProduct: Product = {
      id: productToEdit ? productToEdit.id : `p-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Mainan anak berkualitas terbaik dari OMEGA TOYS.',
      categoryId,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      images: finalImages,
      variants: formattedVariants,
      isNew,
    };

    onSave(updatedProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in-0 duration-200">
      <div className="bg-card text-card-foreground w-full max-w-3xl rounded-3xl border border-border shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60 bg-muted/20 flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-foreground">
              {productToEdit ? 'Ubah Data Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lengkapi foto produk, harga varian, stok, dan deskripsi mainan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* 1. SECTION: GALERI FOTO PRODUK (MULTI-PHOTO UPLOAD VIA FTP) */}
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-primary" />
                Galeri Foto Produk ({images.length} Foto) <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Foto pertama otomatis menjadi <strong>Foto Utama</strong>
              </span>
            </div>

            {/* Existing Uploaded Photos Grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((imgUrl, index) => (
                  <div 
                    key={index}
                    className={`relative rounded-2xl overflow-hidden bg-muted border group aspect-square flex items-center justify-center ${
                      index === 0 ? 'ring-2 ring-primary border-primary shadow-xs' : 'border-border/80'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {index === 0 ? (
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Utama
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className="absolute top-2 left-2 bg-black/70 hover:bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Jadikan Foto Utama"
                      >
                        Set Utama
                      </button>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area for New Photos */}
            <div className="pt-2">
              <ImageUpload
                value={tempUploadUrl}
                onChange={handleAddImage}
                label={images.length > 0 ? '+ Tambah Foto Tambahan / Sudut Lain' : 'Upload Foto Pertama Produk'}
                aspectRatio="square"
                description="Upload foto via FTP (Server 192.168.1.103) • JPG, PNG, WEBP hingga 10MB"
              />
            </div>
          </div>

          {/* 2. SECTION: INFORMASI DASAR PRODUK */}
          <div className="space-y-4">
            {/* Nama Produk */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nama Mainan <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: LEGO City Fire Rescue 60280"
                className="bg-background rounded-xl"
              />
            </div>

            {/* Kategori & Status Baru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Kategori Mainan
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
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
                  Label Promo
                </label>
                <label className="flex items-center gap-2 h-10 px-3.5 border border-input bg-background rounded-xl cursor-pointer hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs font-bold">Tandai sebagai Produk Baru (Badge NEW)</span>
                </label>
              </div>
            </div>

            {/* Harga Dasar, Diskon & Stok */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Harga Dasar (Rp) <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="bg-background rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Harga Coret / Asli (Opsional)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Rp..."
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-background rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Jumlah Stok (Pcs) <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="bg-background rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Deskripsi Lengkap Produk
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan spesifikasi mainan, bahan aman non-toxic, batere yang dibutuhkan, dll."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* 3. SECTION: MANAJEMEN VARIAN DENGAN HARGA BERBEDA */}
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/70 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-500" />
                  Pilihan Varian & Harga Khusus ({variantItems.length} Varian)
                </label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Anda dapat memberikan harga yang berbeda pada setiap varian (misal: Deluxe +Rp 50.000, Paket Jumbo +Rp 100.000).
                </p>
              </div>
            </div>

            {/* Table / List of current variants */}
            {variantItems.length > 0 ? (
              <div className="space-y-2">
                <div className="border rounded-2xl overflow-hidden divide-y divide-border/60 bg-background">
                  <div className="p-3 bg-muted/40 grid grid-cols-12 gap-2 text-[11px] font-black uppercase text-muted-foreground">
                    <span className="col-span-5">Nama Varian</span>
                    <span className="col-span-3">Tambahan Harga (+Rp)</span>
                    <span className="col-span-3 text-right">Harga Final</span>
                    <span className="col-span-1 text-center">Aksi</span>
                  </div>

                  {variantItems.map((item, idx) => {
                    const finalVariantPrice = Number(price) + (Number(item.additionalPrice) || 0);

                    return (
                      <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-5 font-bold text-foreground flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>

                        <div className="col-span-3">
                          <Input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.additionalPrice || 0}
                            onChange={(e) => handleUpdateVariantPrice(idx, Number(e.target.value))}
                            className="h-8 text-xs font-bold rounded-lg bg-muted/30"
                          />
                        </div>

                        <div className="col-span-3 text-right font-black text-primary">
                          {formatCurrency(finalVariantPrice)}
                        </div>

                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="Hapus Varian"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic bg-background/50 p-3.5 rounded-2xl border border-dashed text-center">
                Belum ada varian ditambahkan (produk dijual dengan harga dasar standar).
              </p>
            )}

            {/* Add Variant Form with Additional Price Input */}
            <div className="p-3.5 rounded-2xl bg-background border space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                Tambah Pilihan Varian Baru
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-6">
                  <Input
                    placeholder="Nama varian (contoh: Deluxe Edition, 200 Pcs, Warna Biru)..."
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddVariant();
                      }
                    }}
                    className="text-xs bg-muted/20 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="+ Tambahan Rp (0 jika sama)"
                    value={newVariantAddPrice || ''}
                    onChange={(e) => setNewVariantAddPrice(Number(e.target.value))}
                    className="text-xs bg-muted/20 rounded-xl"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full font-bold text-xs rounded-xl gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    + Tambah
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Templates with Price Adjustments */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-muted-foreground block">
                Template Cepat dengan Estimasi Harga:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickAddTemplate([
                    { name: 'Standard Edition', addPrice: 0 },
                    { name: 'Deluxe Edition (+Aksesoris)', addPrice: 50000 },
                  ])}
                  className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold border cursor-pointer"
                >
                  + Edisi (Standard Rp 0, Deluxe +Rp 50.000)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddTemplate([
                    { name: 'Isi 100 Pcs', addPrice: 0 },
                    { name: 'Isi 200 Pcs', addPrice: 100000 },
                    { name: 'Isi 500 Pcs Jumbo', addPrice: 250000 },
                  ])}
                  className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold border cursor-pointer"
                >
                  + Isi Blok (100 Pcs +0, 200 Pcs +100rb, 500 Pcs +250rb)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAddTemplate([
                    { name: 'Merah', addPrice: 0 },
                    { name: 'Biru', addPrice: 0 },
                    { name: 'Kuning', addPrice: 0 },
                  ])}
                  className="px-2.5 py-1 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] font-bold border cursor-pointer"
                >
                  + Warna (Harga Sama)
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl font-bold text-xs h-10"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto rounded-xl font-black text-xs px-6 shadow-sm h-10"
            >
              {productToEdit ? 'Simpan Perubahan Produk' : 'Simpan Produk Baru'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
