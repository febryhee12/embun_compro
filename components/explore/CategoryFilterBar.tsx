'use client';

import React, { useEffect, useState } from 'react';

export interface CategoryItem {
  id: string;
  label: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'Semua Tipe' },
  { id: 'Glamping', label: 'Glamping' },
  { id: 'Cabin', label: 'Cabin' },
  { id: 'Saung', label: 'Saung' },
  { id: 'Campervan', label: 'Campervan' },
  { id: 'Motocamp', label: 'Motocamp' },
  { id: 'Bikecamp', label: 'Bikecamp' },
  { id: 'Ground', label: 'Ground' },
];

interface CategoryFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  const [isVisibleMobile, setIsVisibleMobile] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 20) {
        setIsAtTop(true);
        setIsVisibleMobile(true);
      } else {
        setIsAtTop(false);
        // Scroll UP -> muncul di mobile
        if (currentScrollY < lastScrollY - 6) {
          setIsVisibleMobile(true);
        }
        // Scroll DOWN -> sembunyikan di mobile
        else if (currentScrollY > lastScrollY + 6) {
          setIsVisibleMobile(false);
        }
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`w-full border-b border-border bg-white/95 backdrop-blur-md sticky top-[var(--explore-header-height,130px)] md:top-20 z-30 py-3 shadow-xs transition-all duration-300 ease-in-out ${
        isAtTop
          ? 'translate-y-0 opacity-100'
          : isVisibleMobile
          ? 'max-md:translate-y-0 max-md:opacity-100 max-md:pointer-events-auto'
          : 'max-md:-translate-y-full max-md:opacity-0 max-md:pointer-events-none'
      } md:translate-y-0 md:opacity-100 md:pointer-events-auto`}
    >
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 select-none ${
                  isSelected
                    ? 'bg-brand-blue text-white shadow-2xs font-bold'
                    : 'bg-surface hover:bg-surface-variant text-foreground-muted hover:text-foreground border border-border/80'
                }`}
              >
                <span className="whitespace-nowrap tracking-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
