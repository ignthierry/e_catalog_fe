import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-10 space-y-8 md:space-y-12">
      <section>
        <HeroBanner />
      </section>
      
      <section>
        <CategoryGrid />
      </section>
      
      <section>
        <FeaturedProducts />
      </section>
    </div>
  );
}
