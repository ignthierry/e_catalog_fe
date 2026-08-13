'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'button' | 'switch' | 'pill';
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = 'button',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder of same size to prevent hydration layout shift
    if (variant === 'switch') {
      return (
        <div
          className={`w-14 h-8 rounded-full bg-muted/60 border border-border/80 opacity-50 ${className}`}
        />
      );
    }
    return (
      <div
        className={`w-9 h-9 rounded-full bg-muted/50 border border-border/50 opacity-50 ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // 1. Physical animated pill switch
  if (variant === 'switch') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Ganti ke Mode Terang (Bright)' : 'Ganti ke Mode Gelap (Dark)'}
        onClick={toggleTheme}
        className={`group relative inline-flex h-8 w-15 items-center rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
          isDark
            ? 'bg-slate-800 border border-slate-700 shadow-inner'
            : 'bg-amber-100/90 border border-amber-200 shadow-inner'
        } ${className}`}
        title={isDark ? 'Mode Gelap Aktif (Klik untuk Mode Terang)' : 'Mode Terang Aktif (Klik untuk Mode Gelap)'}
      >
        {/* Background icon hints */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] pointer-events-none">
          <Sun className={`w-3.5 h-3.5 text-amber-500 transition-opacity duration-200 ${isDark ? 'opacity-30' : 'opacity-100'}`} />
          <Moon className={`w-3.5 h-3.5 text-indigo-300 transition-opacity duration-200 ${isDark ? 'opacity-100' : 'opacity-30'}`} />
        </div>

        {/* Sliding Thumb */}
        <span
          className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-spring ${
            isDark
              ? 'translate-x-7 bg-slate-900 text-indigo-300 shadow-indigo-950/50'
              : 'translate-x-0 bg-white text-amber-500 shadow-amber-500/20'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-12" />
          ) : (
            <Sun className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-45" />
          )}
        </span>
      </button>
    );
  }

  // 2. Pill button with label
  if (variant === 'pill' || showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer ${
          isDark
            ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600 shadow-xs'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/80 shadow-xs'
        } ${className}`}
        title={isDark ? 'Ganti ke Mode Terang (Bright)' : 'Ganti ke Mode Gelap (Dark)'}
        aria-label="Toggle Theme"
      >
        <span className="relative flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-indigo-400 animate-in zoom-in-50 duration-200" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-in zoom-in-50 duration-200" />
          )}
        </span>
        <span className="font-semibold text-xs">
          {isDark ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      </button>
    );
  }

  // 3. Default: Circular icon button with micro-animation
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-90 shadow-xs ${
        isDark
          ? 'bg-slate-800/90 text-amber-400 border-slate-700/80 hover:bg-slate-700 hover:border-slate-600 hover:text-amber-300'
          : 'bg-muted/60 text-slate-700 border-border/80 hover:bg-muted hover:text-primary hover:border-primary/40'
      } ${className}`}
      title={isDark ? 'Ganti ke Mode Terang (Bright)' : 'Ganti ke Mode Gelap (Dark)'}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
    >
      <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-300 absolute ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none'
              : 'opacity-100 rotate-0 scale-100 text-amber-500'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-all duration-300 absolute ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-amber-400'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
      </div>
    </button>
  );
}
