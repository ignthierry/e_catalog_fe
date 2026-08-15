'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Bot, 
  Car, 
  Blocks, 
  Heart, 
  Gamepad2, 
  Bike, 
  Palette, 
  LayoutGrid, 
  ArrowRight,
  Sparkles,
  Theater,
  Glasses,
  Trophy,
  Waves,
  Puzzle,
  Baby,
  Crown,
  Rocket,
  Gem,
  Award
} from 'lucide-react';
import { Category } from '@/types';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/Skeleton';

// Map icon names from backend or data to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Bot,
  Car,
  Blocks,
  Heart,
  Gamepad2,
  Bike,
  Palette,
  Theater,
  Glasses,
  Trophy,
  Waves,
  Puzzle,
  Baby,
  Crown,
  Rocket,
  Gem,
  Award,
  LayoutGrid,
};

// Smart fallback icon resolver based on category name or slug
export function getCategoryIconComponent(name?: string, slug?: string, iconName?: string): React.ElementType {
  // If iconName is known and not generic LayoutGrid
  if (iconName && iconMap[iconName] && iconName !== 'LayoutGrid') {
    return iconMap[iconName];
  }

  const target = `${slug || ''} ${name || ''}`.toLowerCase();

  if (target.includes('kendaraan') || target.includes('mobil') || target.includes('car') || target.includes('truk') || target.includes('diecast') || target.includes('hot wheels')) {
    return Car;
  }
  if (target.includes('boneka') || target.includes('plush') || target.includes('teddy') || target.includes('heart') || target.includes('barbie')) {
    return Heart;
  }
  if (target.includes('edukasi') || target.includes('edukatif') || target.includes('logic') || target.includes('belajar') || target.includes('brain') || target.includes('pintar')) {
    return BrainCircuit;
  }
  if (target.includes('peran') || target.includes('roleplay') || target.includes('kostum') || target.includes('drama') || target.includes('theater') || target.includes('profesi') || target.includes('dapur') || target.includes('masak')) {
    return Theater;
  }
  if (target.includes('renang') || target.includes('kacamata') || target.includes('swim') || target.includes('water') || target.includes('air') || target.includes('pantai') || target.includes('glasses') || target.includes('waves')) {
    return Glasses;
  }
  if (target.includes('robot') || target.includes('action figure') || target.includes('figure') || target.includes('bot') || target.includes('gundam') || target.includes('hero') || target.includes('marvel') || target.includes('avengers')) {
    return Bot;
  }
  if (target.includes('koleksi') || target.includes('hobi') || target.includes('hobby') || target.includes('kartu') || target.includes('trophy') || target.includes('gem') || target.includes('rare') || target.includes('board game') || target.includes('gamepad')) {
    return Trophy;
  }
  if (target.includes('balok') || target.includes('lego') || target.includes('brick') || target.includes('blocks') || target.includes('susun')) {
    return Blocks;
  }
  if (target.includes('sepeda') || target.includes('bike') || target.includes('outdoor') || target.includes('olahraga') || target.includes('skuter')) {
    return Bike;
  }
  if (target.includes('seni') || target.includes('kreasi') || target.includes('lukis') || target.includes('gambar') || target.includes('palette') || target.includes('craft') || target.includes('warna')) {
    return Palette;
  }
  if (target.includes('puzzle') || target.includes('teka-teki') || target.includes('rubik')) {
    return Puzzle;
  }
  if (target.includes('bayi') || target.includes('balita') || target.includes('baby')) {
    return Baby;
  }

  return LayoutGrid;
}

// Curated distinctive pastel color accents
const COLOR_ACCENTS = [
  'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
  'bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white',
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
  'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
  'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-500 group-hover:text-white',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500 group-hover:text-white',
];

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-2">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-36 h-6 rounded-lg" />
          <Skeleton className="w-20 h-4 rounded-lg" />
        </div>
        {/* Mobile Skeleton */}
        <div className="grid grid-cols-4 gap-3 sm:hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="w-12 h-3 rounded" />
            </div>
          ))}
        </div>
        {/* Desktop Skeleton */}
        <div className="hidden sm:flex flex-wrap justify-center gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-11 w-44 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-3">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
            Kategori Mainan
          </h3>
        </div>
        <Link 
          href={ROUTES.PRODUCTS} 
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group"
        >
          Lihat Semua ({categories.length})
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      
      {/* 1. Mobile View: Space-Saving 4-Column App-Style Grid (Super Compact & Clean) */}
      <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 sm:hidden py-1">
        {categories.map((category, index) => {
          const Icon = getCategoryIconComponent(category.name, category.slug, category.icon);
          const accentColor = COLOR_ACCENTS[index % COLOR_ACCENTS.length];

          return (
            <Link 
              key={category.id} 
              href={`${ROUTES.PRODUCTS}?category=${category.id}`}
              className="group flex flex-col items-center text-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            >
              {/* Squircle Icon Badge */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-border/70 shadow-2xs group-hover:scale-105 group-hover:shadow-md transition-all duration-200 ${accentColor}`}>
                <Icon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-6" />
              </div>

              {/* Category Name */}
              <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight px-0.5">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* 2. Desktop View: Symmetrical Horizontal Category Pills */}
      <div className="hidden sm:flex flex-wrap justify-center items-center gap-2.5 sm:gap-3.5 py-1">
        {categories.map((category, index) => {
          const Icon = getCategoryIconComponent(category.name, category.slug, category.icon);
          const accentColor = COLOR_ACCENTS[index % COLOR_ACCENTS.length];
          
          return (
            <Link 
              key={category.id} 
              href={`${ROUTES.PRODUCTS}?category=${category.id}`}
              className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border/70 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
            >
              {/* Animated Icon Badge */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-2xs ${accentColor}`}>
                <Icon className="w-4 h-4 transition-transform duration-300" />
              </div>

              {/* Category Name */}
              <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap pr-0.5">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
