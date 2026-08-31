'use client';

import React, { useState } from 'react';
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
    city?: string;
    province?: string;
    mapImageUrl?: string;
    addons?: any[];
    rating?: number;
    reviewCount?: number;
  };
}

interface SpotCardProps {
  spot: SpotData;
  onSelectSpot: (spot: SpotData) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (spotId: string) => void;
  showBadge?: boolean;
}

export function getPhotoCategoryScore(category?: string): number {
  if (!category) return 50;
  const clean = category.toLowerCase().trim();
  // Kamar Mandi / Toilet selalu paling akhir (skor 99)
  if (
    clean.includes('mandi') ||
    clean.includes('toilet') ||
    clean.includes('bathroom') ||
    clean.includes('wc')
  ) {
    return 99;
  }
  // Kamar Utama / Tenda adalah prioritas utama (skor 1)
  if (
    clean.includes('utama') ||
    clean.includes('tenda') ||
    clean.includes('kamar')
  ) {
    return 1;
  }
  // Pemandangan / Tampak Luar (skor 2)
  if (
    clean.includes('luar') ||
    clean.includes('pemandangan') ||
    clean.includes('outdoor') ||
    clean.includes('depan')
  ) {
    return 2;
  }
  // Fasilitas / Spot lainnya (skor 3)
  if (clean.includes('fasilitas') || clean.includes('area')) {
    return 3;
  }
  return 50;
}

export function SpotCard({
  spot,
  onSelectSpot,
  isFavorite = false,
  onToggleFavorite,
  showBadge = false,
}: SpotCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  // Extract & sort photos prioritizing Kamar Utama > Tampak Luar > Toilet (Terakhir)
  const validPhotos = React.useMemo(() => {
    const list: Array<{ url: string; score: number }> = [];

    if (Array.isArray(spot.photos) && spot.photos.length > 0) {
      spot.photos.forEach((p) => {
        if (p?.url && !failedUrls.has(p.url)) {
          list.push({ url: p.url, score: getPhotoCategoryScore(p.category) });
        }
      });
    }

    if (list.length === 0 && Array.isArray(spot.images)) {
      spot.images.forEach((img) => {
        if (img && !failedUrls.has(img)) {
          list.push({ url: img, score: 50 });
        }
      });
    }

    // Sort by category score ascending (1 = Kamar Utama, 2 = Luar, 99 = Toilet)
    return list.sort((a, b) => a.score - b.score).map((item) => item.url);
  }, [spot, failedUrls]);

  const has360 =
    Array.isArray(spot.panoramaPhotos) && spot.panoramaPhotos.length > 0;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) =>
      prev === 0 ? validPhotos.length - 1 : prev - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) =>
      prev === validPhotos.length - 1 ? 0 : prev + 1,
    );
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) onToggleFavorite(spot.id);
  };

  // Calculate starting price from packages / rates
  const startingPrice = React.useMemo(() => {
    if (
      Array.isArray((spot as any).pricingPackages) &&
      (spot as any).pricingPackages.length > 0
    ) {
      const prices: number[] = [];
      (spot as any).pricingPackages.forEach((pkg: any) => {
        if (pkg.flatRateMode && pkg.flatRate && Number(pkg.flatRate) > 0) {
          prices.push(Number(pkg.flatRate));
        } else if (pkg.weekdayRate && Number(pkg.weekdayRate) > 0) {
          prices.push(Number(pkg.weekdayRate));
        } else if (pkg.weekendRate && Number(pkg.weekendRate) > 0) {
          prices.push(Number(pkg.weekendRate));
        } else if (pkg.flatRate && Number(pkg.flatRate) > 0) {
          prices.push(Number(pkg.flatRate));
        }
      });
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    if (spot.weekdayPrice && Number(spot.weekdayPrice) > 0) {
      return Number(spot.weekdayPrice);
    }
    if (spot.weekendPrice && Number(spot.weekendPrice) > 0) {
      return Number(spot.weekendPrice);
    }
    return 0;
  }, [spot]);

  const currentPhotoUrl = validPhotos[photoIndex] || validPhotos[0];

  return (
    <a
      href={`/spot/${spot.shareCode || spot.id}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          e.preventDefault();
          return;
        }
        if (onSelectSpot) {
          onSelectSpot(spot);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col space-y-3 cursor-pointer no-underline text-foreground"
    >
      {/* 1. Photo Carousel Box */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-surface border border-border shadow-2xs group-hover:shadow-md transition-shadow">
        {currentPhotoUrl ? (
          <img
            src={resolveAssetUrl(currentPhotoUrl)}
            alt={spot.name}
            onError={() => {
              setFailedUrls((prev) => new Set([...prev, currentPhotoUrl]));
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-foreground-muted bg-surface/80 p-4 text-center">
            <Tent size={36} className="text-brand-blue/60 mb-1" />
            <span className="text-[11px] font-semibold text-foreground">
              {spot.name}
            </span>
            <span className="text-[10px] text-foreground-muted">
              {spot.tentType || 'Spot Camp'}
            </span>
          </div>
        )}

        {/* Top Badge: Clean & minimal */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {spot.isEmbunPlus ? (
            <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-brand-lime text-black border border-brand-lime/80 shadow-md backdrop-blur-xs flex items-center gap-1">
              <Sparkles size={9} className="fill-black text-black" />
              Embun Plus
            </span>
          ) : has360 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[9.5px] font-bold bg-brand-lime text-black shadow-md flex items-center gap-1">
              <Compass size={10} />
              Tur 360°
            </span>
          ) : null}
        </div>

        {/* Prev / Next Arrows on Hover */}
        {validPhotos.length > 1 && isHovered && (
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
        {validPhotos.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5">
            {validPhotos.slice(0, 5).map((_, idx) => (
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
      <div className="space-y-0.5 text-xs">
        {/* Title & Rating */}
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="font-bold text-sm text-foreground truncate group-hover:text-brand-blue transition-colors">
            {spot.name}
          </h4>
          <div className="flex items-center gap-1 shrink-0 font-semibold text-foreground">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            <span>
              {spot.campsite?.rating ? Number(spot.campsite.rating).toFixed(1) : '5.0'}
            </span>
          </div>
        </div>

        {/* Campsite & Location */}
        <p className="text-foreground-muted truncate">
          {spot.campsite?.name || 'Embun Campsite'}
        </p>

        {/* Price (Mulai Dari) */}
        <div className="pt-0.5 flex items-baseline justify-between gap-2">
          <p className="text-sm text-foreground">
            <span className="text-xs font-normal text-foreground-muted mr-1">
              mulai dari
            </span>
            <span className="font-bold text-foreground">
              {rupiah(startingPrice)}
            </span>
            <span className="text-[11px] font-normal text-foreground-muted ml-1">
              / malam
            </span>
          </p>
        </div>
      </div>
    </a>
  );
}
