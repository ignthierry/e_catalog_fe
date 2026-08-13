'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { ROUTES } from '@/lib/constants';
import { VariantSelector } from '@/components/product/VariantSelector';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, MessageCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, generateWhatsAppMessage, getWhatsAppLink } from '@/lib/whatsapp';

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

  const handleVariantChange = (variantId: string, option: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantId]: option,
    }));
  };

  const handleAddToCart = () => {
    const image = product.images.length > 0 ? product.images[0] : '';
    
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image,
      quantity,
      selectedVariants,
    });

    const variantDesc = Object.values(selectedVariants).join(', ');
    toast.success(`${quantity}x ${product.name} dimasukkan ke keranjang!`, {
      description: variantDesc ? `Varian: ${variantDesc}` : formatCurrency(product.price * quantity),
      action: {
        label: 'Lihat Keranjang',
        onClick: () => router.push(ROUTES.CART),
      },
    });
  };

  const handleDirectWhatsApp = () => {
    const tempItem = {
      id: 'direct-order',
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity,
      selectedVariants,
    };
    
    const message = generateWhatsAppMessage([tempItem], product.price * quantity);
    const link = getWhatsAppLink(message);
    window.open(link, '_blank');
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
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center justify-between border border-input rounded-xl bg-background h-12 px-2 w-full sm:w-36">
          <button 
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 transition-colors"
          >
            -
          </button>
          <span className="w-10 text-center font-bold text-base">
            {quantity}
          </span>
          <button 
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={quantity >= product.stock}
            className="w-8 h-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg disabled:opacity-30 transition-colors"
          >
            +
          </button>
        </div>
        
        {/* Add to Cart Button */}
        <Button 
          size="lg" 
          variant="outline"
          className="flex-1 gap-2 text-sm sm:text-base h-12 font-bold border-primary text-primary hover:bg-primary/10 transition-all active:scale-98"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="w-5 h-5" />
          + Keranjang
        </Button>

        {/* Direct WhatsApp Order Button */}
        <Button 
          size="lg" 
          className="flex-1 gap-2 text-sm sm:text-base h-12 font-bold bg-[#25D366] hover:bg-[#1fa952] text-white shadow-md transition-all active:scale-98"
          onClick={handleDirectWhatsApp}
          disabled={product.stock <= 0}
        >
          <MessageCircle className="w-5 h-5" />
          Beli via WhatsApp
        </Button>
      </div>
    </div>
  );
}
