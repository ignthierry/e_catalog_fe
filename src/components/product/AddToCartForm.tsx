'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { ROUTES } from '@/lib/constants';
import { VariantSelector } from '@/components/product/VariantSelector';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, ShoppingBag, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/whatsapp';

interface AddToCartFormProps {
  product: Product;
}

export function AddToCartForm({ product }: AddToCartFormProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  
  // Initialize default variants if available
  const initialVariants: Record<string, string> = {};
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((v) => {
      if (v.options.length > 0) {
        initialVariants[v.id] = v.options[0];
      }
    });
  }
  
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(initialVariants);
  const [quantity, setQuantity] = useState(1);

  // Calculate dynamic unit price based on selected variants
  let additionalPrice = 0;
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((v) => {
      const selectedOption = selectedVariants[v.id];
      if (selectedOption && v.items) {
        const match = v.items.find((i) => i.name === selectedOption);
        if (match?.additionalPrice && Number(match.additionalPrice) > 0) {
          additionalPrice += Number(match.additionalPrice);
        }
      }
    });
  }

  const currentUnitPrice = product.price + additionalPrice;
  const grandTotal = currentUnitPrice * quantity;

  const handleVariantChange = (variantId: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: option,
    }));
  };

  const handleAddToCart = (redirectToCart = false) => {
    const image = product.images.length > 0 ? product.images[0] : '';

    // Resolve the ProductVariant id for the first selected variant option (if any)
    let variantId: string | null = null;
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        const selectedOption = selectedVariants[v.id];
        if (selectedOption && v.items) {
          const match = v.items.find((i) => i.name === selectedOption);
          if (match?.id) {
            variantId = String(match.id);
            break;
          }
        }
      }
    }
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: currentUnitPrice,
      image,
      quantity,
      selectedVariants,
      variantId,
    });

    const variantDesc = Object.values(selectedVariants).join(', ');
    
    if (redirectToCart) {
      toast.success(`${quantity}x ${product.name} siap di-checkout!`);
      router.push(ROUTES.CART);
    } else {
      toast.success(`${quantity}x ${product.name} dimasukkan ke keranjang!`, {
        description: variantDesc ? `Varian: ${variantDesc} • ${formatCurrency(grandTotal)}` : formatCurrency(grandTotal),
        action: {
          label: 'Lihat Keranjang',
          onClick: () => router.push(ROUTES.CART),
        },
      });
    }
  };

  return (
    <div className="space-y-5 my-6">
      {product.variants && product.variants.length > 0 && (
        <VariantSelector 
          variants={product.variants} 
          selectedVariants={selectedVariants} 
          onChange={handleVariantChange} 
        />
      )}

      {/* Dynamic Price Display if variant has custom price */}
      {additionalPrice > 0 && (
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Tag className="w-4 h-4" />
            <span>Harga Varian Terpilih:</span>
          </div>
          <span className="font-black text-base text-primary">
            {formatCurrency(currentUnitPrice)} <span className="text-xs font-normal text-muted-foreground">/ pcs</span>
          </span>
        </div>
      )}
      
      {/* Quantity & Action Controls */}
      <div className="space-y-3">
        {/* Quantity selector */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
            Jumlah:
          </span>
          <div className="flex items-center border border-input rounded-xl bg-background h-10 px-1 shadow-2xs">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || product.stock <= 0}
              className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Kurangi jumlah"
            >
              -
            </button>
            <span className="w-10 text-center font-bold text-sm sm:text-base text-foreground select-none">
              {quantity}
            </span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.stock || product.stock <= 0}
              className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Add to Cart Button */}
          <Button 
            type="button"
            size="lg" 
            variant="outline"
            className="w-full gap-2 text-sm sm:text-base h-12 font-bold border-primary text-primary hover:bg-primary/10 transition-all rounded-xl cursor-pointer"
            onClick={() => handleAddToCart(false)}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span>+ Keranjang</span>
          </Button>

          {/* Buy Now Button (Direct to Cart / In-App Checkout) */}
          <Button 
            type="button"
            size="lg" 
            className="w-full gap-2 text-sm sm:text-base h-12 font-extrabold shadow-sm transition-all rounded-xl cursor-pointer"
            onClick={() => handleAddToCart(true)}
            disabled={product.stock <= 0}
          >
            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
            <span>Beli Sekarang</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
