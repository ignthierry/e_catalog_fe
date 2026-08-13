'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center border">
        <span className="text-muted-foreground text-sm">Tidak ada gambar</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image */}
      <div className="aspect-square overflow-hidden rounded-2xl bg-white border border-border/60 relative shadow-xs">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ type: 'fraction' }}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Gambar Produk ${index + 1}`}
                className="w-full h-full object-contain p-4 select-none"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar py-1">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                swiperInstance?.slideTo(index);
              }}
              className={`relative flex-shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeIndex === index
                  ? 'border-primary ring-2 ring-primary/20 opacity-100 scale-105'
                  : 'border-border/60 opacity-60 hover:opacity-100 hover:border-primary/50'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
