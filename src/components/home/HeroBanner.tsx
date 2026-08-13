'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Banner } from '@/types';
import { api } from '@/lib/api';
import { Sparkles, ArrowRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { Skeleton } from '@/components/ui/Skeleton';

export function HeroBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await api.getBanners();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]">
        <Skeleton className="w-full h-full rounded-3xl" />
      </div>
    );
  }

  if (!banners.length) return null;

  return (
    <div className="w-full relative rounded-3xl overflow-hidden shadow-md border border-border/40">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id} className="bg-slate-950">
            <div className="relative w-full h-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 overflow-hidden flex items-center">
              
              {/* Background Image with Dark Vignette for ultra-high contrast */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={banner.image} 
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent"></div>
              
              <div className="relative z-10 px-6 sm:px-10 md:px-16 py-6 max-w-2xl text-white">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-2.5 text-white border border-white/30 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Promo Pilihan
                </span>
                
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-2 drop-shadow-md leading-tight text-white">
                  {banner.title}
                </h2>
                
                <p className="text-xs sm:text-base md:text-lg mb-5 md:mb-6 opacity-95 drop-shadow-sm max-w-lg text-slate-100 font-medium line-clamp-2 sm:line-clamp-none">
                  {banner.subtitle}
                </p>
                
                <Link
                  href={banner.link}
                  className="inline-flex items-center gap-2 h-10 sm:h-12 px-5 sm:px-7 rounded-2xl bg-white !text-orange-600 hover:bg-slate-100 font-black text-xs sm:text-sm md:text-base shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <span>Belanja Sekarang</span>
                  <ArrowRight className="w-4 h-4 text-orange-600" />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
