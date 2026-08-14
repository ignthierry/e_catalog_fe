'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import 'swiper/css';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-3xl flex items-center justify-center border">
        <span className="text-muted-foreground text-sm">Tidak ada gambar</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Image Viewport */}
      <div className="aspect-square overflow-hidden rounded-3xl bg-white border border-border/60 relative shadow-xs group">
        <Swiper
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="w-full h-full"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="flex items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Gambar Produk ${index + 1}`}
                className="w-full h-full object-contain p-4 select-none transition-transform duration-300 group-hover:scale-105"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Sleek In-Frame Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => swiperInstance?.slidePrev()}
              disabled={activeIndex === 0}
              className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-900/95 text-foreground hover:bg-white dark:hover:bg-slate-800 shadow-md border border-border/60 flex items-center justify-center transition-all cursor-pointer ${
                activeIndex === 0 
                  ? 'opacity-30 cursor-not-allowed pointer-events-none' 
                  : 'opacity-90 hover:opacity-100 hover:scale-110 active:scale-95'
              }`}
              aria-label="Gambar Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>

            <button
              type="button"
              onClick={() => swiperInstance?.slideNext()}
              disabled={activeIndex === images.length - 1}
              className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 dark:bg-slate-900/95 text-foreground hover:bg-white dark:hover:bg-slate-800 shadow-md border border-border/60 flex items-center justify-center transition-all cursor-pointer ${
                activeIndex === images.length - 1 
                  ? 'opacity-30 cursor-not-allowed pointer-events-none' 
                  : 'opacity-90 hover:opacity-100 hover:scale-110 active:scale-95'
              }`}
              aria-label="Gambar Berikutnya"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>

            {/* Pill Image Counter Badge */}
            <div className="absolute bottom-3 right-3 z-20 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold tracking-wider shadow-sm select-none border border-white/10">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
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
              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-white transition-all cursor-pointer p-1 ${
                activeIndex === index
                  ? 'border-primary ring-2 ring-primary/25 opacity-100 scale-105 shadow-sm'
                  : 'border-border/60 opacity-60 hover:opacity-100 hover:border-primary/40'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
