'use client';

import { Variant } from '@/types';

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
          <h4 className="text-sm font-medium mb-2">{variant.name}</h4>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isSelected = selectedVariants[variant.id] === option;
              
              return (
                <button
                  key={option}
                  onClick={() => onChange(variant.id, option)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
