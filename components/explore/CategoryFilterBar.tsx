'use client';

import React from 'react';
import {
  Sparkles,
  Building2,
  Car,
  Compass,
  Trees,
  Home,
  Bike,
  Layers,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'Semua Tipe', icon: <Layers size={18} /> },
  { id: 'Glamping', label: 'Glamping', icon: <Sparkles size={18} /> },
  { id: 'Cabin', label: 'Cabin', icon: <Building2 size={18} /> },
  { id: 'Saung', label: 'Saung', icon: <Home size={18} /> },
  { id: 'Campervan', label: 'Campervan', icon: <Car size={18} /> },
  { id: 'Motocamp', label: 'Motocamp', icon: <Bike size={18} /> },
  { id: 'Bikecamp', label: 'Bikecamp', icon: <Bike size={18} /> },
  { id: 'Ground', label: 'Ground', icon: <Trees size={18} /> },
  { id: '360', label: 'Tur 360°', icon: <Compass size={18} /> },
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
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs shrink-0 transition-all flex items-center gap-2 cursor-pointer outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 select-none ${
                  isSelected
                    ? 'bg-brand-blue text-white shadow-sm font-bold'
                    : 'bg-surface hover:bg-surface-variant text-foreground-muted hover:text-foreground border border-border'
                }`}
              >
                <span
                  className={`shrink-0 transition-transform ${
                    isSelected ? 'text-white scale-105' : 'text-foreground-muted'
                  }`}
                >
                  {cat.icon}
                </span>
                <span className="whitespace-nowrap font-medium tracking-tight">
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
