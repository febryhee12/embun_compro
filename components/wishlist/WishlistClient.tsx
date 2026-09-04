'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import {
  getStoredGuestProfile,
  getGuestToken,
  fetchGuestWishlist,
  fetchActiveCampsites,
  addToWishlist,
  removeFromWishlist,
  WishlistItemView,
  ApiError,
  clearGuestSession,
} from '@/lib/api-client';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { WishlistCard } from '@/components/wishlist/WishlistCard';

export function WishlistClient() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItemView[]>([]);
  const [campsites, setCampsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Track items un-wishlisted in the current session so they don't vanish immediately
  const [unwishlistedIds, setUnwishlistedIds] = useState<Set<string>>(new Set());
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Block & Campsite lookup maps for resolving full photo lists with categories & pricing
  const { blocksMap, campsitesMap } = useMemo(() => {
    const bMap = new Map<string, any>();
    const cMap = new Map<string, any>();

    campsites.forEach((c) => {
      if (c?.id) cMap.set(String(c.id).trim().toLowerCase(), c);
      if (c?.slug) cMap.set(String(c.slug).trim().toLowerCase(), c);

      if (Array.isArray(c?.blocks)) {
        c.blocks.forEach((b: any) => {
          if (b?.id) bMap.set(String(b.id).trim().toLowerCase(), { ...b, parentCampsite: c });
          if (b?.shareCode) bMap.set(String(b.shareCode).trim().toLowerCase(), { ...b, parentCampsite: c });
        });
      }
    });

    return { blocksMap: bMap, campsitesMap: cMap };
  }, [campsites]);

  const loadData = async () => {
    const token = getGuestToken();
    const user = getStoredGuestProfile();
    setCurrentUser(user);

    // Fetch active campsites catalog in parallel to enrich photos & metadata
    void fetchActiveCampsites()
      .then((data) => {
        if (Array.isArray(data)) setCampsites(data);
      })
      .catch(() => {});

    if (!token) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setAuthRequired(false);
      const data = await fetchGuestWishlist();
      setItems(data);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setAuthRequired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleToggleWishlist = async (e: React.MouseEvent, item: WishlistItemView) => {
    e.stopPropagation();
    e.preventDefault();

    const itemId = item.id;
    if (togglingIds.has(itemId)) return;

    const isCurrentlyUnwishlisted = unwishlistedIds.has(itemId);
    setTogglingIds((prev) => new Set(prev).add(itemId));

    if (isCurrentlyUnwishlisted) {
      // Re-add to wishlist (optimistic)
      setUnwishlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
      try {
        await addToWishlist(item.campsiteId, item.blockId);
      } catch {
        // Revert on error
        setUnwishlistedIds((prev) => new Set(prev).add(itemId));
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    } else {
      // Unwishlist: card stays in place, heart turns unselected
      setUnwishlistedIds((prev) => new Set(prev).add(itemId));
      try {
        await removeFromWishlist(item.campsiteId, item.blockId);
      } catch {
        // Revert on error
        setUnwishlistedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    }
  };

  const handleCardClick = (item: WishlistItemView) => {
    if (item.blockId) {
      router.push(`/spot/${item.blockId}`);
    } else if (item.campsite?.slug || item.campsiteId) {
      router.push(`/campsite/${item.campsite.slug || item.campsiteId}`);
    }
  };

  const activeCount = items.filter((it) => !unwishlistedIds.has(it.id)).length;

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col selection:bg-brand-lime selection:text-black">
      {/* Airbnb Clean Header */}
      <ExploreHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        showSearch={false}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 flex-1">
        {/* Title Section (Airbnb minimal style) */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {activeCount > 0
              ? `${activeCount} spot & penginapan favorit yang Anda simpan`
              : 'Spot camping dan akomodasi favorit Anda'}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-surface rounded-2xl animate-pulse" />
                <div className="w-3/4 h-4 bg-surface rounded-md animate-pulse" />
                <div className="w-1/2 h-3 bg-surface rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Not Logged In State */}
        {!loading && authRequired && (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-foreground-muted shadow-2xs">
              <Heart size={26} className="stroke-[1.5] text-foreground-muted" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Masuk untuk Melihat Wishlist
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed max-w-sm">
              Masuk ke akun Embun Anda untuk mengakses daftar spot dan campsite favorit yang telah Anda simpan.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-xs hover:bg-brand-blue/90 active:scale-95 transition-all cursor-pointer"
              >
                Masuk atau Buat Akun
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !authRequired && items.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-foreground-muted shadow-2xs">
              <Heart size={26} className="stroke-[1.5] text-foreground-muted" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Belum Ada Wishlist Tersimpan
            </h2>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed max-w-sm">
              Jelajahi spot camping dan glamping terbaik, lalu klik ikon hati pada unit yang Anda sukai untuk menyimpannya di sini.
            </p>
            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-xs hover:bg-brand-blue/90 active:scale-95 transition-all"
              >
                Mulai Jelajahi Spot
              </Link>
            </div>
          </div>
        )}

        {/* Unwishlisted Notice / Undo Banner */}
        {!loading && !authRequired && unwishlistedIds.size > 0 && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs text-foreground animate-in fade-in duration-200">
            <span className="text-neutral-600">
              {unwishlistedIds.size} spot dihapus dari wishlist dan akan hilang saat Anda memuat ulang halaman.
            </span>
            <button
              type="button"
              onClick={() => {
                unwishlistedIds.forEach((id) => {
                  const it = items.find((x) => x.id === id);
                  if (it) void addToWishlist(it.campsiteId, it.blockId);
                });
                setUnwishlistedIds(new Set());
              }}
              className="font-bold text-brand-blue hover:underline cursor-pointer ml-3 shrink-0"
            >
              Batalkan Semua
            </button>
          </div>
        )}

        {/* Wishlist Grid with Carousels & Home-style Pricing */}
        {!loading && !authRequired && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {items.map((item) => {
              const bKey = item.blockId ? String(item.blockId).trim().toLowerCase() : '';
              const cKey = String(item.campsiteId || item.campsite?.id || '').trim().toLowerCase();
              const catalogBlock = bKey ? blocksMap.get(bKey) : null;
              const catalogCampsite = campsitesMap.get(cKey) || catalogBlock?.parentCampsite;

              return (
                <WishlistCard
                  key={item.id}
                  item={item}
                  catalogBlock={catalogBlock}
                  catalogCampsite={catalogCampsite}
                  isUnwishlisted={unwishlistedIds.has(item.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onClickCard={handleCardClick}
                />
              );
            })}
          </div>
        )}
      </main>

      <ExploreFooter />

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          void loadData();
        }}
        currentUser={currentUser}
        onLogout={() => {
          clearGuestSession();
          setCurrentUser(null);
          setAuthRequired(true);
          setItems([]);
          setUnwishlistedIds(new Set());
        }}
      />
    </div>
  );
}
