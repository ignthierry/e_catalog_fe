'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { WhatsAppCheckout } from '@/components/cart/WhatsAppCheckout';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="container mx-auto px-4 py-8 min-h-[50vh]"></div>;
  }

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.error(`"${name}" dihapus dari keranjang`);
  };

  const handleClear = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      clearCart();
      toast.info('Keranjang belanja dikosongkan.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-foreground">
          Keranjang Belanja Kosong
        </h2>
        <p className="text-muted-foreground mb-8 max-w-sm text-sm sm:text-base">
          Belum ada mainan yang dimasukkan. Ayo temukan mainan impian si kecil sekarang!
        </p>
        <Button asChild size="lg" className="font-bold rounded-2xl shadow-sm">
          <Link href={ROUTES.PRODUCTS} className="gap-2">
            <ShoppingCart className="w-5 h-5" />
            Mulai Belanja
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Link 
          href={ROUTES.PRODUCTS} 
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">
            Keranjang Belanja
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Periksa pesanan Anda sebelum checkout ke WhatsApp toko.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 space-y-4">
          <div className="bg-card border rounded-3xl overflow-hidden shadow-xs">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b bg-muted/20">
              <span className="font-bold text-sm sm:text-base text-foreground">
                Daftar Produk ({items.length})
              </span>
              <button 
                onClick={handleClear}
                className="text-xs sm:text-sm text-destructive hover:underline font-semibold"
              >
                Kosongkan Keranjang
              </button>
            </div>
            
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex gap-4 hover:bg-muted/10 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-muted border flex-shrink-0"
                  />
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <Link 
                          href={`${ROUTES.PRODUCTS}/${item.productId}`} 
                          className="font-bold text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1.5">
                            {Object.entries(item.selectedVariants).map(([key, val]) => (
                              <span key={key} className="bg-muted px-2 py-0.5 rounded-md font-medium">
                                {val}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleRemove(item.id, item.name)}
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-end">
                      <span className="font-extrabold text-primary text-base sm:text-lg">
                        {formatCurrency(item.price)}
                      </span>
                      
                      <div className="flex items-center border border-input rounded-xl overflow-hidden bg-background h-9">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2.5 h-full flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 h-full flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-card border rounded-3xl p-6 sticky top-24 shadow-xs space-y-5">
            <h3 className="text-lg font-extrabold pb-3 border-b text-foreground">
              Ringkasan Pesanan
            </h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Item</span>
                <span className="font-medium text-foreground">{items.reduce((acc, i) => acc + i.quantity, 0)} pcs</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Total Harga</span>
                <span className="font-bold text-foreground">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t flex justify-between items-baseline">
              <span className="font-bold text-base text-foreground">Total Estimasi</span>
              <span className="font-extrabold text-2xl text-primary">
                {formatCurrency(getTotalPrice())}
              </span>
            </div>
            
            <WhatsAppCheckout />
            
            <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
              Format rincian nama barang, varian, dan total harga akan disusun otomatis dan diteruskan ke WhatsApp Admin OMEGA TOYS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
