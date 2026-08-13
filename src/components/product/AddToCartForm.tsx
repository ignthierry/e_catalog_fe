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
        if (match?.additionalPrice) {
          additionalPrice += match.additionalPrice;
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
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: currentUnitPrice,
      image,
      quantity,
      selectedVariants,
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
    <div className="space-y-6 my-6">
      {product.variants && product.variants.length > 0 && (
        <VariantSelector 
          variants={product.variants} 
          selectedVariants={selectedVariants} 
          onChange={handleVariantChange} 
        />
      )}

      {/* Dynamic Price Display if variant has custom price */}
      {additionalPrice > 0 && (
        <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Tag className="w-4 h-4" />
            <span>Harga Varian Terpilih:</span>
          </div>
          <span className="font-black text-base text-primary">
            {formatCurrency(currentUnitPrice)} <span className="text-xs font-normal text-muted-foreground">/ pcs</span>
          </span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center justify-between border border-input rounded-xl bg-background h-12 px-2 w-full sm:w-36 flex-shrink-0">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="w-10 text-center font-bold text-base text-foreground">
            {quantity}
          </span>
          <button 
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= product.stock}
            className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
        
        {/* Add to Cart Button */}
        <Button 
          type="button"
          size="lg" 
          variant="outline"
          className="flex-1 gap-2 text-sm sm:text-base h-12 font-bold border-primary text-primary hover:bg-primary/10 transition-all rounded-xl cursor-pointer"
          onClick={() => handleAddToCart(false)}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="w-5 h-5" />
          + Keranjang
        </Button>

        {/* Buy Now Button (Direct to Cart / In-App Checkout) */}
        <Button 
          type="button"
          size="lg" 
          className="flex-1 gap-2 text-sm sm:text-base h-12 font-extrabold shadow-sm transition-all rounded-xl cursor-pointer"
          onClick={() => handleAddToCart(true)}
          disabled={product.stock <= 0}
        >
          <ShoppingBag className="w-5 h-5" />
          Beli Sekarang
        </Button>
      </div>
    </div>
  );
}
