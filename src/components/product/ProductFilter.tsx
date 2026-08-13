'use client';

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
  Layers
} from 'lucide-react';
import { Category } from '@/types';

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

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (id: string | null) => void;
}

export function ProductFilter({ categories, selectedCategory, onCategorySelect }: ProductFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Kategori Mainan
        </h3>
        
        <div className="space-y-1.5">
          {/* Semua Produk */}
          <button
            type="button"
            onClick={() => onCategorySelect(null)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === null
                ? 'bg-primary text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Semua Produk</span>
            </div>
            {selectedCategory === null && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            )}
          </button>
          
          {/* List Categories */}
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || LayoutGrid;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategorySelect(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-white shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`} />
                  <span className="truncate">{category.name}</span>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
