'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  Compass,
  Tent,
  Sparkles,
} from 'lucide-react';
import { resolveAssetUrl, rupiah } from '@/lib/api-client';

export interface SpotData {
  id: string;
  name: string;
  blockNumber?: string | null;
  tentType?: string;
  roomSize?: string | null;
  bedType?: string | null;
  baseCapacity: number;
  maxCapacity: number;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  isEmbunPlus?: boolean;
  shareCode?: string;
  photos?: Array<{ url: string; category?: string }>;
  images?: string[];
  panoramaPhotos?: any[];
  viewOptions?: string[];
  facilities?: string[];
  campsite: {
    id: string;
    name: string;
    slug?: string;
    address?: string;
    rating?: number;
    reviewCount?: number;
  };
}

interface SpotCardProps {
  spot: SpotData;
  onSelectSpot: (spot: SpotData) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (spotId: string) => void;
}

export function SpotCard({
  spot,
  onSelectSpot,
  isFavorite = false,
  onToggleFavorite,
}: SpotCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Extract photos
  const photos = React.useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(spot.photos) && spot.photos.length > 0) {
      // Prioritize Kamar Utama
      const sorted = [...spot.photos].sort((a, b) => {
        const isA = a.category?.toLowerCase().includes('kamar') ? 0 : 1;
        const isB = b.category?.toLowerCase().includes('kamar') ? 0 : 1;
        return isA - isB;
      });
      sorted.forEach((p) => {
        if (p.url) list.push(p.url);
      });
    }
    if (list.length === 0 && Array.isArray(spot.images)) {
      spot.images.forEach((img) => {
        if (img) list.push(img);
      });
    }
    return list;
  }, [spot]);

  const has360 =
    Array.isArray(spot.panoramaPhotos) && spot.panoramaPhotos.length > 0;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(spot.id);
  };

  return (
    <div
      onClick={() => onSelectSpot(spot)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col space-y-3 cursor-pointer"
    >
      {/* 1. Photo Carousel Box */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-2xs group-hover:shadow-md transition-shadow">
        {photos.length > 0 ? (
          <img
            src={resolveAssetUrl(photos[photoIndex])}
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-foreground-muted bg-surface">
            <Tent size={36} />
            <span className="text-[11px] mt-1">Foto Belum Tersedia</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {spot.isEmbunPlus ? (
            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-white/95 text-foreground shadow-md backdrop-blur-xs border border-black/10 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500 fill-amber-500" />
              Favorit Tamu
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold bg-black/60 text-white shadow-md backdrop-blur-xs">
              {spot.tentType || 'Glamping'}
            </span>
          )}

          {has360 && (
            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-brand-lime text-black shadow-md flex items-center gap-1">
              <Compass size={10} />
              Tur 360°
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full text-white/90 hover:text-white hover:scale-110 active:scale-95 transition-all drop-shadow-md cursor-pointer"
        >
          <Heart
            size={22}
            className={
              isFavorite
                ? 'fill-rose-500 text-rose-500 stroke-rose-500'
                : 'fill-black/30 stroke-white stroke-[2]'
            }
          />
        </button>

        {/* Prev / Next Arrows on Hover */}
        {photos.length > 1 && isHovered && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-white hover:scale-105 transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5">
            {photos.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  photoIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Property Information */}
      <div className="space-y-1 text-xs">
        {/* Title & Rating */}
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-bold text-sm text-foreground truncate group-hover:text-brand-blue transition-colors">
            {spot.name}
          </h4>
          <div className="flex items-center gap-1 shrink-0 font-semibold text-foreground">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            <span>
              {spot.campsite?.rating ? spot.campsite.rating.toFixed(1) : '4.9'}
            </span>
          </div>
        </div>

        {/* Campsite & Location */}
        <p className="text-foreground-muted truncate">
          {spot.campsite?.name || 'Embun Campsite'}
        </p>

        <p className="text-[11px] text-foreground-muted truncate">
          Maks. {spot.maxCapacity} tamu · {spot.bedType || 'Kasur Nyaman'}
        </p>

        {/* Price & DP Badge */}
        <div className="pt-1 flex items-baseline justify-between gap-2">
          <p className="font-bold text-sm text-foreground">
            {rupiah(spot.weekdayPrice)}
            <span className="text-[11px] font-normal text-foreground-muted">
              {' '}
              / malam
            </span>
          </p>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            Bisa DP 50%
          </span>
        </div>
      </div>
    </div>
  );
}
