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
  removeFromWishlist,
  resolveAssetUrl,
  WishlistItemView,
  ApiError,
  clearGuestSession,
} from '@/lib/api-client';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { getPhotoCategoryScore } from '@/components/explore/SpotCard';

export function WishlistClient() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItemView[]>([]);
  const [campsites, setCampsites] = useState<any[]>([]);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  // Block & Campsite lookup maps for resolving full photo lists with categories
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

  const handleRemove = async (e: React.MouseEvent, item: WishlistItemView) => {
    e.stopPropagation();
    e.preventDefault();

    const itemId = item.id;
    if (removingIds.has(itemId)) return;

    setRemovingIds((prev) => new Set(prev).add(itemId));

    // Optimistic UI removal
    const previousItems = [...items];
    setItems((prev) => prev.filter((it) => it.id !== itemId));

    try {
      await removeFromWishlist(item.campsiteId, item.blockId);
    } catch {
      // Revert if error
      setItems(previousItems);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleCardClick = (item: WishlistItemView) => {
    if (item.blockId) {
      router.push(`/spot/${item.blockId}`);
    } else if (item.campsite?.slug || item.campsiteId) {
      router.push(`/campsite/${item.campsite.slug || item.campsiteId}`);
    }
  };

  /**
   * Resolve primary photo prioritizing Kamar Utama / Tenda over toilet/bathroom
   * with seamless cascade to next best photo or campsite landscape.
   */
  const getItemPhoto = (item: WishlistItemView): string => {
    // 1. If it's a spot/block, check catalog block photos with category priority
    if (item.blockId) {
      const bKey = String(item.blockId).trim().toLowerCase();
      const catalogBlock = blocksMap.get(bKey);
      if (catalogBlock) {
        const candidatePhotos: Array<{ url: string; score: number }> = [];

        if (Array.isArray(catalogBlock.photos)) {
          catalogBlock.photos.forEach((p: any) => {
            const resolved = p?.url ? resolveAssetUrl(p.url) : '';
            if (resolved && !failedUrls.has(resolved) && !failedUrls.has(p.url)) {
              candidatePhotos.push({
                url: resolved,
                score: getPhotoCategoryScore(p.category),
              });
            }
          });
        }

        if (candidatePhotos.length === 0 && Array.isArray(catalogBlock.images)) {
          catalogBlock.images.forEach((img: string) => {
            const resolved = img ? resolveAssetUrl(img) : '';
            if (resolved && !failedUrls.has(resolved) && !failedUrls.has(img)) {
              candidatePhotos.push({ url: resolved, score: 50 });
            }
          });
        }

        // Filter out Kamar Mandi / Toilet (score 99) if any other photo exists
        const nonToilet = candidatePhotos.filter((p) => p.score < 99);
        const pool = nonToilet.length > 0 ? nonToilet : candidatePhotos;
        if (pool.length > 0) {
          pool.sort((a, b) => a.score - b.score);
          return pool[0].url;
        }
      }
    }

    // 2. Block coverPhotoUrl from API payload
    if (item.block?.coverPhotoUrl) {
      const resolved = resolveAssetUrl(item.block.coverPhotoUrl);
      if (!failedUrls.has(resolved) && !failedUrls.has(item.block.coverPhotoUrl)) {
        return resolved;
      }
    }

    // 3. Campsite catalog photos
    const cKey = String(item.campsiteId || item.campsite?.id || '').trim().toLowerCase();
    const catalogCampsite = campsitesMap.get(cKey);
    if (catalogCampsite && Array.isArray(catalogCampsite.photos)) {
      const campPhotos = catalogCampsite.photos
        .map((p: any) => ({
          url: p?.url ? resolveAssetUrl(p.url) : '',
          rawUrl: p?.url,
          category: p?.category || '',
        }))
        .filter((p: any) => p.url && !failedUrls.has(p.url) && !failedUrls.has(p.rawUrl));

      const home = campPhotos.find(
        (p: any) => p.category === 'home' || p.category === 'cover' || p.category === 'main',
      );
      if (home) return home.url;

      const view = campPhotos.find((p: any) => p.category.includes('view'));
      if (view) return view.url;

      if (campPhotos.length > 0) return campPhotos[0].url;
    }

    // 4. Campsite coverPhotoUrl from API payload
    if (item.campsite?.coverPhotoUrl) {
      const resolved = resolveAssetUrl(item.campsite.coverPhotoUrl);
      if (!failedUrls.has(resolved) && !failedUrls.has(item.campsite.coverPhotoUrl)) {
        return resolved;
      }
    }

    // 5. Verified high-resolution landscape campsite cover photo
    return 'https://media-staging.embun.app/campsites/51f7987e-2632-4bfa-bfc6-302c782bb81d/1348dba5-1a61-4274-b0e8-d17ba2540a15.jpg';
  };

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
            {items.length > 0
              ? `${items.length} spot & penginapan favorit yang Anda simpan`
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

        {/* Wishlist Grid (Clean Airbnb Minimalist style) */}
        {!loading && !authRequired && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {items.map((item) => {
              const photoUrl = getItemPhoto(item);
              const title = item.block?.name || item.campsite?.name || 'Spot Camping';
              const location = [item.campsite?.city, item.campsite?.province]
                .filter(Boolean)
                .join(', ') || item.campsite?.name || 'Indonesia';

              return (
                <div
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="group relative flex flex-col cursor-pointer select-none"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface mb-3 shadow-2xs">
                    <img
                      src={photoUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      onError={() => {
                        setFailedUrls((prev) => new Set(prev).add(photoUrl));
                      }}
                    />

                    {/* Floating Heart Button (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, item)}
                      title="Hapus dari Wishlist"
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs text-red-500 shadow-xs active:scale-90 transition-all cursor-pointer z-10"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </button>
                  </div>

                  {/* Clean Typography */}
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate group-hover:text-brand-blue transition-colors">
                      {title}
                    </h3>
                    <p className="text-xs text-foreground-muted truncate">
                      {item.block ? `${item.campsite?.name} · ${location}` : location}
                    </p>

                    {!item.available && (
                      <p className="text-[11px] text-amber-600 font-medium pt-1">
                        Saat ini tidak tersedia
                      </p>
                    )}
                  </div>
                </div>
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
        }}
      />
    </div>
  );
}
