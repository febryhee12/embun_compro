'use client';

import React from 'react';

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
  { id: '360', label: 'Tur 360°' },
];

interface CategoryFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryFilterBar({
  selectedCategory,
  onSelectCategory,
}: CategoryFilterBarProps) {
  return (
    <div className="w-full border-b border-border bg-white/95 backdrop-blur-md sticky top-16 sm:top-20 z-30 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
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
