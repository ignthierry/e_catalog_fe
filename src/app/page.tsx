import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6 md:space-y-10">
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
