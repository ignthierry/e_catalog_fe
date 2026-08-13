'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check } from 'lucide-react';
import { Product } from '@/types';
import { ROUTES } from '@/lib/constants';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/whatsapp';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has variants, direct user to product detail to choose variant
    if (product.variants && product.variants.length > 0) {
      router.push(`${ROUTES.PRODUCTS}/${product.id}`);
      return;
    }

    // Otherwise add directly to cart
    addItem({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
    });

    toast.success(`${product.name} masuk ke keranjang!`, {
      description: formatCurrency(product.price),
      action: {
        label: 'Lihat Keranjang',
        onClick: () => router.push(ROUTES.CART),
      },
    });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/60 hover:border-primary/40 flex flex-col h-full bg-card">
      <Link href={`${ROUTES.PRODUCTS}/${product.id}`} className="block relative aspect-square overflow-hidden bg-muted/30">
        {/* Fallback */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300">
          <ShoppingCart className="h-12 w-12 opacity-20" />
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <Badge variant="default" className="bg-primary font-bold text-white shadow-sm text-[11px] px-2 py-0.5">
              BARU
            </Badge>
          )}
          {discount > 0 && (
            <Badge variant="destructive" className="font-bold shadow-sm text-[11px] px-2 py-0.5">
              -{discount}%
            </Badge>
          )}
        </div>
      </Link>
      
      <CardContent className="p-3.5 sm:p-4 flex-1 flex flex-col">
        <Link href={`${ROUTES.PRODUCTS}/${product.id}`}>
          <h3 className="font-medium text-sm sm:text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-3 flex flex-col">
          {product.originalPrice && (
            <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
          <span className="font-bold text-base sm:text-lg text-primary">
            {formatCurrency(product.price)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-3.5 sm:p-4 pt-0">
        <Button 
          onClick={handleQuickAdd}
          className="w-full gap-1.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-xs" 
          size="sm"
          variant={product.stock <= 0 ? "secondary" : "default"}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {product.stock <= 0 ? 'Habis' : (product.variants && product.variants.length > 0 ? 'Pilih Varian' : '+ Keranjang')}
        </Button>
      </CardFooter>
    </Card>
  );
}
