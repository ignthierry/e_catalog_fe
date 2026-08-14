'use client';

import { useState, useEffect } from 'react';
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
  Layers,
  Banknote,
  RotateCcw,
  Check
} from 'lucide-react';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getCategoryIconComponent } from '@/components/home/CategoryGrid';

// Quick price presets
const PRICE_PRESETS = [
  { label: '< Rp 100 rb', min: undefined, max: 100000 },
  { label: 'Rp 100rb - 300rb', min: 100000, max: 300000 },
  { label: 'Rp 300rb - 600rb', min: 300000, max: 600000 },
  { label: '> Rp 600 rb', min: 600000, max: undefined },
];

interface ProductFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (id: string | null) => void;
  minPrice?: number | string;
  maxPrice?: number | string;
  onPriceChange?: (min: number | undefined, max: number | undefined) => void;
  onResetFilters?: () => void;
}

export function ProductFilter({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  minPrice,
  maxPrice,
  onPriceChange,
  onResetFilters
}: ProductFilterProps) {
  const [localMin, setLocalMin] = useState<string>(minPrice !== undefined && minPrice !== '' ? String(minPrice) : '');
  const [localMax, setLocalMax] = useState<string>(maxPrice !== undefined && maxPrice !== '' ? String(maxPrice) : '');

  useEffect(() => {
    setLocalMin(minPrice !== undefined && minPrice !== '' ? String(minPrice) : '');
  }, [minPrice]);

  useEffect(() => {
    setLocalMax(maxPrice !== undefined && maxPrice !== '' ? String(maxPrice) : '');
  }, [maxPrice]);

  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onPriceChange) return;

    const minNum = localMin ? Math.max(0, parseInt(localMin, 10)) : undefined;
    const maxNum = localMax ? Math.max(0, parseInt(localMax, 10)) : undefined;

    onPriceChange(
      isNaN(minNum as any) ? undefined : minNum,
      isNaN(maxNum as any) ? undefined : maxNum
    );
  };

  const handleSelectPreset = (presetMin?: number, presetMax?: number) => {
    setLocalMin(presetMin !== undefined ? String(presetMin) : '');
    setLocalMax(presetMax !== undefined ? String(presetMax) : '');
    if (onPriceChange) {
      onPriceChange(presetMin, presetMax);
    }
  };

  const hasActivePriceFilter = (minPrice !== undefined && minPrice !== '') || (maxPrice !== undefined && maxPrice !== '');
  const hasAnyFilter = selectedCategory !== null || hasActivePriceFilter;

  return (
    <div className="space-y-6">
      {/* Category Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-muted-foreground">
            Kategori Mainan
          </h3>
          {selectedCategory !== null && (
            <button
              type="button"
              onClick={() => onCategorySelect(null)}
              className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        
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
            const Icon = getCategoryIconComponent(category.name, category.slug, category.icon);
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

      {/* Price Range Filter Section */}
      <div className="border-t border-border/70 pt-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-primary" />
            Rentang Harga (Rp)
          </h3>
          {hasActivePriceFilter && (
            <button
              type="button"
              onClick={() => handleSelectPreset(undefined, undefined)}
              className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <form onSubmit={handleApplyPrice} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                Min (Rp)
              </label>
              <Input
                type="number"
                min={0}
                step={10000}
                placeholder="0"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase mb-1 block">
                Maks (Rp)
              </label>
              <Input
                type="number"
                min={0}
                step={10000}
                placeholder="Maksimal"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="sm"
            className="w-full h-8 text-xs font-bold rounded-xl shadow-2xs gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Terapkan Harga
          </Button>
        </form>

        {/* Quick Price Presets */}
        <div className="mt-3.5 space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase px-1 mb-1.5">
            Pilihan Cepat:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRICE_PRESETS.map((preset, idx) => {
              const isActive =
                (preset.min === undefined ? !minPrice : String(minPrice) === String(preset.min)) &&
                (preset.max === undefined ? !maxPrice : String(maxPrice) === String(preset.max));

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset.min, preset.max)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                    isActive
                      ? 'bg-primary/10 border-primary text-primary font-bold'
                      : 'bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Reset Button */}
      {hasAnyFilter && onResetFilters && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 border border-destructive/20 py-2 rounded-xl font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Hapus Semua Filter
          </button>
        </div>
      )}
    </div>
  );
}
