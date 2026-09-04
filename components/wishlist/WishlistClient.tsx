'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft } from 'lucide-react';
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
import {
  AccountSidebar,
  AccountMobileNav,
  AccountLogoutDialog,
} from '@/components/account/AccountNav';

export function WishlistClient() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItemView[]>([]);
  const [campsites, setCampsites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    clearGuestSession();
    window.location.href = '/explore';
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/explore');
    }
  };

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
    <div className="min-h-screen bg-[#fafafa] text-foreground flex flex-col justify-between selection:bg-brand-lime selection:text-black">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA LOKASI) ═══ */}
      <ExploreHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        showSearch={false}
        showUserMenu={false}
      />

      <main className="max-w-[2520px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <div className="w-7 h-7 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Memuat wishlist...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-5 shadow-2xs max-w-md mx-auto my-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/8 flex items-center justify-center p-3 border border-brand-blue/15 shadow-2xs">
              <img
                src="/images/logo/logogram_blue.svg"
                alt="Embun"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Masuk ke Akun Anda</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Anda harus masuk terlebih dahulu untuk melihat dan mengelola spot favorit Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all cursor-pointer"
            >
              <span>Masuk Sekarang</span>
            </button>
            <div>
              <Link
                href="/explore"
                className="text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Ke Halaman Explore
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Judul Halaman */}
            <div className="border-b border-border/70 pb-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer shrink-0"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={22} className="stroke-[2.2]" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Wishlist Saya
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-foreground-muted mt-1 ml-9 sm:ml-10">
                {activeCount > 0
                  ? `${activeCount} spot & penginapan favorit yang Anda simpan`
                  : 'Spot camping dan akomodasi favorit Anda'}
              </p>
            </div>

            {/* Navigasi Tab Horizontal (Mobile & Tablet) */}
            <AccountMobileNav
              activeTab="wishlist"
              onLogout={() => setShowLogoutConfirm(true)}
            />

            {/* Layout Grid Responsif (Sidebar di Desktop) */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
              {/* Sisi Kiri: Sidebar Menu Akun & Bantuan */}
              <AccountSidebar
                activeTab="wishlist"
                onLogout={() => setShowLogoutConfirm(true)}
              />

              {/* Sisi Kanan: Konten Wishlist */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                {/* Unwishlisted Notice / Undo Banner */}
                {unwishlistedIds.size > 0 && (
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs text-foreground animate-in fade-in duration-200">
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

                {/* Empty State */}
                {items.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-border p-8 space-y-4 shadow-2xs max-w-md mx-auto my-6">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/8 flex items-center justify-center p-3 border border-brand-blue/15 text-brand-blue">
                      <Heart size={26} className="stroke-[1.75]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-foreground">
                        Belum Ada Wishlist Tersimpan
                      </h3>
                      <p className="text-xs text-foreground-muted leading-relaxed">
                        Jelajahi spot camping dan glamping terbaik, lalu klik ikon hati pada unit yang Anda sukai untuk menyimpannya di sini.
                      </p>
                    </div>
                    <Link
                      href="/explore"
                      className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all"
                    >
                      Mulai Jelajahi Spot
                    </Link>
                  </div>
                ) : (
                  /* Wishlist Grid with Carousels & Home-style Pricing */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
              </div>
            </div>
          </div>
        )}
      </main>

      <ExploreFooter />

      {/* Logout Confirmation Dialog */}
      <AccountLogoutDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />

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
