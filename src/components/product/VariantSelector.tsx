'use client';

import { Variant } from '@/types';
import { formatCurrency } from '@/lib/whatsapp';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariants: Record<string, string>;
  onChange: (variantId: string, option: string) => void;
}

export function VariantSelector({ variants, selectedVariants, onChange }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4 py-4 border-y border-border">
      {variants.map((variant) => (
        <div key={variant.id}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {variant.name}
            </h4>
            {selectedVariants[variant.id] && (
              <span className="text-xs font-bold text-primary">
                Pilihan: {selectedVariants[variant.id]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selectedVariants[variant.id] === option;
              const itemData = variant.items?.find((i) => i.name === option);
              const addPrice = itemData?.additionalPrice !== undefined ? Number(itemData.additionalPrice) : 0;
              const hasAddPrice = !isNaN(addPrice) && addPrice > 0;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(variant.id, option)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs scale-102' 
                      : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  <span>{option}</span>
                  {hasAddPrice && (
                    <span className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      +{formatCurrency(addPrice)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
