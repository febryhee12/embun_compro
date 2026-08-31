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
    <div className="w-full border-b border-border bg-white sticky top-20 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center gap-1.5 pb-1 shrink-0 transition-all border-b-2 cursor-pointer group ${
                isSelected
                  ? 'border-brand-blue text-brand-blue font-bold'
                  : 'border-transparent text-foreground-muted hover:text-foreground hover:border-border'
              }`}
            >
              <div
                className={`p-1 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-brand-blue' : 'text-foreground-muted'
                }`}
              >
                {cat.icon}
              </div>
              <span className="text-[11px] whitespace-nowrap tracking-tight">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
