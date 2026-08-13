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
  Sparkles
} from 'lucide-react';
import { Category } from '@/types';
import { api } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/Skeleton';

// Map icon names from data to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
  BrainCircuit,
  Bot,
  Car,
  Blocks,
  Heart,
  Gamepad2,
  Bike,
  Palette,
};

// Subtle color accents per category for delightful micro-visuals
const colorAccents: Record<string, string> = {
  c1: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white',
  c2: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
  c3: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
  c4: 'bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white',
  c5: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 group-hover:bg-pink-500 group-hover:text-white',
  c6: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white',
  c7: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
  c8: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white',
};

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
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="w-36 h-6 rounded-lg" />
          <Skeleton className="w-20 h-4 rounded-lg" />
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-11 w-40 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
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
      
      {/* Compact Elongated Horizontal Pills (2 rows on mobile, flexible wrap on desktop) */}
      <div className="grid grid-rows-2 grid-flow-col auto-cols-max sm:flex sm:flex-wrap gap-2.5 overflow-x-auto pb-2 pt-0.5 px-1 hide-scrollbar snap-x">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || LayoutGrid;
          const accentColor = colorAccents[category.id] || 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white';
          
          return (
            <Link 
              key={category.id} 
              href={`${ROUTES.PRODUCTS}?category=${category.id}`}
              className="group inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-card border border-border/70 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer snap-start flex-shrink-0 shadow-2xs"
            >
              {/* Animated Icon Badge */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-2xs ${accentColor}`}>
                <Icon className="w-4 h-4 transition-transform duration-300" />
              </div>

              {/* Category Name */}
              <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap pr-1">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
