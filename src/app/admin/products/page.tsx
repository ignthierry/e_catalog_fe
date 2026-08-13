'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProductModal } from '@/components/admin/ProductModal';
import { Product, Category } from '@/types';
import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/whatsapp';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(productsData as Product[]);
  const [categories] = useState<Category[]>(categoriesData as Category[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (savedProduct: Product) => {
    if (productToEdit) {
      setProducts((prev) =>
        prev.map((p) => (p.id === savedProduct.id ? savedProduct : p))
      );
      toast.success(`Produk "${savedProduct.name}" berhasil diperbarui!`);
    } else {
      setProducts((prev) => [savedProduct, ...prev]);
      toast.success(`Produk baru "${savedProduct.name}" berhasil ditambahkan!`);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${productName}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.error(`Produk "${productName}" telah dihapus.`);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Umum';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Manajemen Produk
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Total {products.length} produk terdaftar dalam sistem katalog.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="gap-2 font-bold shadow-sm">
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Button>
      </div>
      
      <Card className="rounded-2xl border shadow-xs overflow-hidden">
        <CardHeader className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Search className="h-4 w-4" />
              </div>
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk mainan..." 
                className="pl-9 bg-background rounded-xl text-sm" 
              />
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Menampilkan {filteredProducts.length} produk
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Produk</th>
                  <th className="px-5 py-3.5 font-bold">Kategori</th>
                  <th className="px-5 py-3.5 font-bold">Harga</th>
                  <th className="px-5 py-3.5 font-bold">Stok</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                  <th className="px-5 py-3.5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={product.images[0]} 
                            alt={product.name} 
                            className="w-11 h-11 rounded-xl object-cover bg-muted border flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-foreground line-clamp-1 max-w-[240px]">
                              {product.name}
                            </div>
                            {product.isNew && (
                              <span className="text-[10px] font-bold text-primary uppercase">
                                • Produk Baru
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-2.5 py-1 rounded-md text-foreground">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-bold text-primary">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium">{product.stock} pcs</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {product.stock > 0 ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 font-semibold text-[11px]">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="font-semibold text-[11px]">
                            Habis
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenEditModal(product)}
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                            title="Edit Produk"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      Tidak ada produk yang sesuai dengan &quot;{searchQuery}&quot;
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
      />
    </div>
  );
}
