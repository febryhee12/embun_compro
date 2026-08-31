'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, User, Globe, Menu, SlidersHorizontal, MapPin, Calendar, Users } from 'lucide-react';

interface ExploreHeaderProps {
  onOpenAuth: () => void;
  currentUser: any | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export function ExploreHeader({
  onOpenAuth,
  currentUser,
  searchQuery,
  onSearchChange,
  selectedCity,
  onSelectCity,
}: ExploreHeaderProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Official Brand Logo SVG */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="/images/logo/primary_blue.svg"
            alt="Embun"
            className="h-7 w-auto object-contain transition-transform group-hover:scale-102"
          />
          <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
            Explore
          </span>
        </Link>

        {/* Center: Airbnb-style Pill Search Bar */}
        <div className="flex-1 max-w-xl hidden md:flex items-center justify-center">
          <div className="w-full flex items-center justify-between border border-border rounded-full py-2 px-4 shadow-2xs hover:shadow-md transition-all bg-white divide-x divide-border text-xs">
            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="px-3 text-left font-semibold text-foreground truncate hover:text-brand-blue transition-colors flex-1 flex items-center gap-1.5"
            >
              <MapPin size={13} className="text-brand-blue shrink-0" />
              <span>{selectedCity || 'Semua Lokasi'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="px-3 text-left text-foreground-muted font-medium truncate hover:text-brand-blue transition-colors flex items-center gap-1.5"
            >
              <Calendar size={13} className="text-foreground-muted shrink-0" />
              <span>Kapan saja</span>
            </button>

            <div className="pl-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Cari spot / glamping..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-36 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none bg-transparent"
              />
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-xs">
                <Search size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Avatar Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {/* User Profile / Auth Pill Button */}
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2.5 border border-border rounded-full p-1.5 pl-3 hover:shadow-md transition-all bg-white cursor-pointer"
          >
            <Menu size={15} className="text-foreground-muted" />
            <div className="w-8 h-8 rounded-full bg-surface text-brand-blue flex items-center justify-center border border-border font-bold text-xs overflow-hidden">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : currentUser?.fullName ? (
                currentUser.fullName.charAt(0).toUpperCase()
              ) : (
                <User size={16} />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (under logo) */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center gap-2 border border-border rounded-full py-2 px-4 shadow-2xs bg-surface text-xs">
          <Search size={15} className="text-brand-blue shrink-0" />
          <input
            type="text"
            placeholder="Cari tempat camping, glamping, kabin..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs text-foreground placeholder:text-foreground-muted focus:outline-none bg-transparent"
          />
        </div>
      </div>
    </header>
  );
}
