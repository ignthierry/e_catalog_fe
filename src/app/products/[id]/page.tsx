import { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductGallery } from '@/components/product/ProductGallery';
import { AddToCartForm } from '@/components/product/AddToCartForm';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ProductShareButtons } from '@/components/product/ProductShareButtons';
import { ShieldCheck, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { notFound } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/whatsapp';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await api.getProductById(resolvedParams.id);
  
  if (!product) {
    return { title: 'Produk Tidak Ditemukan' };
  }
  
  return {
    title: `${product.name} | OMEGA TOYS`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await api.getProductById(resolvedParams.id);
  
  if (!product) {
    notFound();
  }

  // Fetch categories and related products for breadcrumb & recommendations
  const [categories, relatedProducts] = await Promise.all([
    api.getCategories(),
    api.getProductsByCategory(product.categoryId),
  ]);

  const category = categories.find((c) => c.id === product.categoryId);
  const otherProducts = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const breadcrumbItems = [
    { label: 'Katalog Mainan', href: ROUTES.PRODUCTS },
    ...(category ? [{ label: category.name, href: `${ROUTES.PRODUCTS}?category=${category.id}` }] : []),
    { label: product.name },
  ];

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 space-y-10">
      {/* Breadcrumbs */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Product Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-card p-4 sm:p-8 rounded-3xl border shadow-xs">
        {/* Left: Product Gallery */}
        <div className="w-full lg:w-1/2">
          <ProductGallery images={product.images} />
        </div>
        
        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.isNew && (
                <Badge className="bg-primary font-bold text-white shadow-xs">BARU</Badge>
              )}
              {category && (
                <Badge variant="outline" className="font-semibold text-muted-foreground">
                  {category.name}
                </Badge>
              )}
              <Badge 
                variant={product.stock > 0 ? "secondary" : "destructive"} 
                className="ml-auto text-xs"
              >
                {product.stock > 0 ? `Stok: ${product.stock} pcs` : 'Stok Habis'}
              </Badge>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-3 my-4">
              <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <Badge variant="destructive" className="font-bold">
                    -{discount}%
                  </Badge>
                </>
              )}
            </div>

            <div className="border-t pt-4 my-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Deskripsi Produk:</h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
            </div>

            <AddToCartForm product={product} />

            <ProductShareButtons productName={product.name} />
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">Produk Original</h4>
                <p className="text-[11px] text-muted-foreground">100% Bergaransi Resmi</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 border">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">Packing Aman</h4>
                <p className="text-[11px] text-muted-foreground">Gratis Bubble Wrap</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {otherProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                Mainan Sejenis Lainnya
              </h2>
            </div>
            {category && (
              <Link
                href={`${ROUTES.PRODUCTS}?category=${category.id}`}
                className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {otherProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
