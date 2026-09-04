'use client';

import React, { useState, useMemo } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { resolveAssetUrl, rupiah, WishlistItemView } from '@/lib/api-client';
import { getPhotoCategoryScore } from '@/components/explore/SpotCard';

interface WishlistCardProps {
  item: WishlistItemView;
  catalogBlock?: any;
  catalogCampsite?: any;
  isUnwishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent, item: WishlistItemView) => void;
  onClickCard: (item: WishlistItemView) => void;
}

export function WishlistCard({
  item,
  catalogBlock,
  catalogCampsite,
  isUnwishlisted,
  onToggleWishlist,
  onClickCard,
}: WishlistCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  // 1. Build prioritized list of photos for carousel
  const validPhotos = useMemo(() => {
    const candidateList: Array<{ url: string; score: number }> = [];

    // Check block photos
    if (catalogBlock) {
      if (Array.isArray(catalogBlock.photos)) {
        catalogBlock.photos.forEach((p: any) => {
          const resolved = p?.url ? resolveAssetUrl(p.url) : '';
          if (resolved && !failedUrls.has(resolved) && !failedUrls.has(p.url)) {
            candidateList.push({
              url: resolved,
              score: getPhotoCategoryScore(p.category),
            });
          }
        });
      }
      if (candidateList.length === 0 && Array.isArray(catalogBlock.images)) {
        catalogBlock.images.forEach((img: string) => {
          const resolved = img ? resolveAssetUrl(img) : '';
          if (resolved && !failedUrls.has(resolved) && !failedUrls.has(img)) {
            candidateList.push({ url: resolved, score: 50 });
          }
        });
      }
    }

    // Separate non-toilet photos first
    const nonToilet = candidateList.filter((p) => p.score < 99);
    const toilet = candidateList.filter((p) => p.score >= 99);
    nonToilet.sort((a, b) => a.score - b.score);

    const result: string[] = nonToilet.map((p) => p.url);

    // Complement with campsite landscape/home photos if block has fewer than 3 photos
    if (catalogCampsite && Array.isArray(catalogCampsite.photos)) {
      catalogCampsite.photos.forEach((p: any) => {
        const resolved = p?.url ? resolveAssetUrl(p.url) : '';
        const cat = (p?.category || '').toLowerCase();
        if (
          resolved &&
          !failedUrls.has(resolved) &&
          !result.includes(resolved) &&
          (cat === 'home' || cat === 'view' || cat === 'camping_ground' || cat === 'cover')
        ) {
          result.push(resolved);
        }
      });
    }

    // Append toilet photos at the very end only if needed
    toilet.forEach((p) => {
      if (!result.includes(p.url)) result.push(p.url);
    });

    // Fallback if empty
    if (result.length === 0) {
      if (item.block?.coverPhotoUrl && !failedUrls.has(resolveAssetUrl(item.block.coverPhotoUrl))) {
        result.push(resolveAssetUrl(item.block.coverPhotoUrl));
      } else if (
        item.campsite?.coverPhotoUrl &&
        !failedUrls.has(resolveAssetUrl(item.campsite.coverPhotoUrl))
      ) {
        result.push(resolveAssetUrl(item.campsite.coverPhotoUrl));
      } else {
        result.push(
          'https://media-staging.embun.app/campsites/51f7987e-2632-4bfa-bfc6-302c782bb81d/1348dba5-1a61-4274-b0e8-d17ba2540a15.jpg',
        );
      }
    }

    return result;
  }, [catalogBlock, catalogCampsite, failedUrls, item]);

  // 2. Compute starting price matching Home / SpotCard
  const startingPrice = useMemo(() => {
    // If block item
    if (catalogBlock) {
      if (
        Array.isArray(catalogBlock.pricingPackages) &&
        catalogBlock.pricingPackages.length > 0
      ) {
        const prices: number[] = [];
        catalogBlock.pricingPackages.forEach((pkg: any) => {
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
      if (catalogBlock.weekdayPrice && Number(catalogBlock.weekdayPrice) > 0) {
        return Number(catalogBlock.weekdayPrice);
      }
      if (catalogBlock.weekendPrice && Number(catalogBlock.weekendPrice) > 0) {
        return Number(catalogBlock.weekendPrice);
      }
    }

    // If campsite-level or block has no price, check all blocks of campsite
    if (catalogCampsite && Array.isArray(catalogCampsite.blocks)) {
      const campBlockPrices: number[] = [];
      catalogCampsite.blocks.forEach((b: any) => {
        if (Array.isArray(b.pricingPackages) && b.pricingPackages.length > 0) {
          b.pricingPackages.forEach((pkg: any) => {
            const p = Number(pkg.flatRateMode ? pkg.flatRate : (pkg.weekdayRate || pkg.flatRate));
            if (p > 0) campBlockPrices.push(p);
          });
        }
        if (b.weekdayPrice && Number(b.weekdayPrice) > 0) {
          campBlockPrices.push(Number(b.weekdayPrice));
        }
      });
      if (campBlockPrices.length > 0) {
        return Math.min(...campBlockPrices);
      }
    }

    return 0;
  }, [catalogBlock, catalogCampsite]);

  const currentPhotoUrl = validPhotos[photoIndex] || validPhotos[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? validPhotos.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === validPhotos.length - 1 ? 0 : prev + 1));
  };

  const title = item.block?.name || catalogBlock?.name || item.campsite?.name || 'Spot Camping';
  const campsiteName = item.campsite?.name || catalogCampsite?.name || '';
  const location =
    [item.campsite?.city, item.campsite?.province].filter(Boolean).join(', ') ||
    catalogCampsite?.city ||
    'Indonesia';

  const rating = catalogCampsite?.rating ? Number(catalogCampsite.rating).toFixed(1) : '5.0';

  return (
    <div
      onClick={() => onClickCard(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col cursor-pointer select-none transition-all duration-300 ${
        isUnwishlisted ? 'opacity-65' : 'opacity-100'
      }`}
    >
      {/* Photo Carousel Box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface mb-3 border border-border shadow-2xs group-hover:shadow-md transition-shadow">
        <img
          src={currentPhotoUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
          onError={() => {
            setFailedUrls((prev) => new Set(prev).add(currentPhotoUrl));
          }}
        />

        {/* Unwishlist Status Badge (shows when unwishlisted) */}
        {isUnwishlisted && (
          <div className="absolute top-3 left-3 z-10 animate-in fade-in duration-200">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900/85 text-white backdrop-blur-xs shadow-xs">
              Dihapus
            </span>
          </div>
        )}

        {/* Heart Toggle Button (Top Right) */}
        <button
          type="button"
          onClick={(e) => onToggleWishlist(e, item)}
          title={isUnwishlisted ? 'Simpan kembali ke Wishlist' : 'Hapus dari Wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs shadow-xs active:scale-90 transition-all cursor-pointer z-20 ${
            isUnwishlisted
              ? 'bg-white/90 text-neutral-400 hover:text-red-500 hover:bg-white'
              : 'bg-white/85 hover:bg-white text-red-500'
          }`}
        >
          <Heart
            size={18}
            className={
              isUnwishlisted
                ? 'stroke-[1.75] fill-transparent transition-colors'
                : 'fill-red-500 text-red-500 transition-colors'
            }
          />
        </button>

        {/* Carousel Prev & Next Arrows (Home style) */}
        {validPhotos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 ${
                isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
              } max-md:opacity-90`}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 ${
                isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-0'
              } max-md:opacity-90`}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {validPhotos.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-10 pointer-events-none">
            {validPhotos.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  photoIndex === idx ? 'w-4 bg-white shadow-xs' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Information matching Home / SpotCard */}
      <div className="space-y-0.5 text-xs">
        {/* Title & Rating */}
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-sm sm:text-base text-foreground truncate group-hover:text-brand-blue transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1 shrink-0 font-semibold text-foreground">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Subtitle / Campsite & Location */}
        <p className="text-xs text-foreground-muted truncate">
          {item.block ? `${campsiteName} · ${location}` : location}
        </p>

        {/* Price (mulai dari Rp ... / malam) */}
        {startingPrice > 0 && (
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
        )}

        {!item.available && (
          <p className="text-[11px] text-amber-600 font-medium pt-0.5">
            Saat ini tidak tersedia
          </p>
        )}
      </div>
    </div>
  );
}
