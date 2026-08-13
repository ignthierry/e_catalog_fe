import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground my-4 flex-wrap gap-1">
      <Link 
        href={ROUTES.HOME} 
        className="flex items-center gap-1 hover:text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only sm:not-sr-only sm:inline-block">Beranda</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
            {item.href && !isLast ? (
              <Link 
                href={item.href} 
                className="hover:text-primary transition-colors line-clamp-1 max-w-[150px] sm:max-w-none"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium line-clamp-1 max-w-[180px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
