'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchActiveCampsites,
  fetchCampsiteAggregate,
  getStoredGuestProfile,
  getGuestToken,
  fetchGuestWishlist,
  addToWishlist,
  removeFromWishlist,
  resolveAssetUrl,
  rupiah,
} from '@/lib/api-client';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import {
  CategoryFilterBar,
  CATEGORIES,
} from '@/components/explore/CategoryFilterBar';
import { SpotCard, SpotData } from '@/components/explore/SpotCard';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { Tour360Modal } from '@/components/explore/Tour360Modal';
import {
  Tent,
  Star,
  ArrowRight,
} from 'lucide-react';

export const VIEW_SECTIONS = [
  { id: 'pantai', label: 'Pemandangan Pantai / Laut' },
  { id: 'danau', label: 'Pemandangan Danau' },
  { id: 'sungai', label: 'Pemandangan Sungai' },
  { id: 'lembah', label: 'Pemandangan Lembah / Bukit' },
  { id: 'gunung', label: 'Pemandangan Gunung' },
  { id: 'hutan', label: 'Pemandangan Hutan' },
  { id: 'pinus', label: 'Pemandangan Pohon Pinus' },
  { id: 'sawah', label: 'Sawah / Perkebunan' },
  { id: 'kota', label: 'Pemandangan Kota' },
  { id: 'teh', label: 'Kebun Teh' },
  { id: 'stroberi', label: 'Kebun Stroberi' },
];

export const matchesSpotView = (spot: SpotData, viewId: string): boolean => {
  const rawViews = spot.viewOptions || (spot as any).view_options || [];
  const spotViews: string[] = Array.isArray(rawViews)
    ? rawViews.map((v: any) => String(v || '').toLowerCase().trim())
    : [];

  if (viewId === 'pantai') {
    return spotViews.some(
      (v) =>
        v.includes('pantai') ||
        v.includes('laut') ||
        v.includes('beach') ||
        v.includes('ocean'),
    );
  }
  if (viewId === 'danau') {
    return spotViews.some((v) => v.includes('danau') || v.includes('lake'));
  }
  if (viewId === 'sungai') {
    return spotViews.some((v) => v.includes('sungai') || v.includes('river'));
  }
  if (viewId === 'lembah') {
    return spotViews.some(
      (v) =>
        v.includes('lembah') ||
        v.includes('bukit') ||
        v.includes('valley') ||
        v.includes('hill'),
    );
  }
  if (viewId === 'gunung') {
    return spotViews.some((v) => v.includes('gunung') || v.includes('mountain'));
  }
  if (viewId === 'hutan') {
    return spotViews.some(
      (v) =>
        v.includes('hutan') ||
        v.includes('forest'),
    );
  }
  if (viewId === 'pinus') {
    return spotViews.some(
      (v) =>
        v.includes('pinus') ||
        v.includes('pine'),
    );
  }
  if (viewId === 'sawah') {
    return spotViews.some(
      (v) =>
        v.includes('sawah') ||
        v === 'sawah / perkebunan' ||
        v.includes('perkebunan'),
    );
  }
  if (viewId === 'kota') {
    return spotViews.some((v) => v.includes('kota') || v.includes('city'));
  }
  if (viewId === 'teh') {
    return spotViews.some((v) => v.includes('teh') || v.includes('tea'));
  }
  if (viewId === 'stroberi') {
    return spotViews.some(
      (v) => v.includes('stroberi') || v.includes('strawberry'),
    );
  }
  return false;
};

export function ExploreClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campsites, setCampsites] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');

  // Modals & User state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selected360Spot, setSelected360Spot] = useState<SpotData | null>(null);

  const handleSelectSpot = (spot: SpotData) => {
    // Open Tour 360 in-page modal when explicitly clicked via the "Tur 360°" button
    if ((spot as any).isTour360Only) {
      setSelected360Spot(spot);
      return;
    }
    window.location.href = `/spot/${spot.shareCode || spot.id}`;
  };


  // 1. Initial Data Fetch
  useEffect(() => {
    setCurrentUser(getStoredGuestProfile());

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActiveCampsites();
        const baseCamps = Array.isArray(data) ? data : [];
        const campsWithAgg = await Promise.all(
          baseCamps.map(async (camp: any) => {
            const agg = await fetchCampsiteAggregate(camp.id);
            return {
              ...camp,
              rating: agg.ratingAvg,
              reviewCount: agg.ratingCount,
            };
          }),
        );
        setCampsites(campsWithAgg);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat katalog campsite.');
      } finally {
        setLoading(false);
      }
    };

    const loadWishlist = async () => {
      if (!getGuestToken()) return;
      try {
        const wishlist = await fetchGuestWishlist();
        const ids = wishlist.map((item) => item.blockId || item.campsiteId);
        setFavoriteIds(ids);
      } catch {}
    };

    void loadData();
    void loadWishlist();
  }, []);

  // 2. Extract All Spots & 360 Tours from Campsites
  const allSpots: SpotData[] = useMemo(() => {
    const list: SpotData[] = [];
    campsites.forEach((camp) => {
      const campHasBlocks = Array.isArray(camp.blocks) && camp.blocks.length > 0;

      if (campHasBlocks) {
        camp.blocks.forEach((b: any) => {
          if (b.status === 'active' || !b.status) {
            const blockPanos = Array.isArray(b.panoramaPhotos) ? [...b.panoramaPhotos] : [];
            if (blockPanos.length === 0 && Array.isArray(camp.panoramaSpots) && camp.panoramaSpots.length > 0) {
              camp.panoramaSpots.forEach((ps: any) => {
                blockPanos.push({
                  id: ps.id,
                  label: ps.label || ps.description || 'Tur 360° Kawasan',
                  imageUrl: ps.imageUrl,
                  category: 'panorama_campsite',
                });
              });
            }

            list.push({
              ...b,
              panoramaPhotos: blockPanos,
              campsite: {
                id: camp.id,
                name: camp.name,
                slug: camp.slug,
                address: camp.address,
                city: camp.city,
                province: camp.province,
                mapImageUrl: camp.mapImageUrl,
                addons: camp.addons || [],
                rating: camp.rating ? Number(camp.rating) : 0,
                reviewCount: camp.reviewCount ? Number(camp.reviewCount) : 0,
                panoramaSpots: camp.panoramaSpots || [],
              },
            });
          }
        });
      }
    });
    return list;
  }, [campsites]);

  // 3. Filtered Spots (for explicit search / category filter mode)
  const filteredSpots = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allSpots.filter((spot) => {
      // Search text query
      const matchSearch =
        !q ||
        spot.name.toLowerCase().includes(q) ||
        spot.campsite.name.toLowerCase().includes(q) ||
        (spot.campsite.address &&
          spot.campsite.address.toLowerCase().includes(q)) ||
        (spot.campsite.city &&
          spot.campsite.city.toLowerCase().includes(q)) ||
        (spot.campsite.province &&
          spot.campsite.province.toLowerCase().includes(q)) ||
        (spot.tentType && spot.tentType.toLowerCase().includes(q)) ||
        (spot.bedType && spot.bedType.toLowerCase().includes(q)) ||
        (spot.blockNumber && spot.blockNumber.toLowerCase().includes(q)) ||
        (Array.isArray(spot.facilities) &&
          spot.facilities.some((f: string) => f.toLowerCase().includes(q)));

      // City filter
      let matchCity = true;
      if (selectedCity && selectedCity !== 'Semua Lokasi') {
        const cityTarget = selectedCity.toLowerCase().trim();
        matchCity =
          (spot.campsite.city &&
            spot.campsite.city.toLowerCase().includes(cityTarget)) ||
          (spot.campsite.province &&
            spot.campsite.province.toLowerCase().includes(cityTarget)) ||
          (spot.campsite.address &&
            spot.campsite.address.toLowerCase().includes(cityTarget)) ||
          spot.campsite.name.toLowerCase().includes(cityTarget);
      }

      // Category filter (Strictly tentType & viewOptions - NOT by spot name!)
      let matchCat = true;
      if (selectedCategory !== 'all') {
        if (selectedCategory.startsWith('view:')) {
          const viewKey = selectedCategory.replace('view:', '').toLowerCase();
          matchCat = matchesSpotView(spot, viewKey);
        } else {
          // Property type (tentType) - strictly check tentType
          const cleanTarget = selectedCategory.toLowerCase().trim();
          const spotType = (spot.tentType || '').toLowerCase().trim();
          matchCat = spotType === cleanTarget;
        }
      }

      return matchSearch && matchCity && matchCat;
    });
  }, [allSpots, searchQuery, selectedCategory, selectedCity]);

  // 4. Section Data Computations
  const [failedCampsiteImages, setFailedCampsiteImages] = useState<Set<string>>(
    new Set(),
  );

  // Helper to get the official primary property photo of a campsite
  const getCampsiteCoverPhoto = (camp: any): string => {
    if (camp.coverImageUrl) return camp.coverImageUrl;
    if (camp.mainImage) return camp.mainImage;

    // 1. Check official campsite.photos first (category: 'home' > 'view' > 'camping_ground')
    if (Array.isArray(camp.photos) && camp.photos.length > 0) {
      const scored: Array<{ url: string; score: number }> = [];
      camp.photos.forEach((p: any) => {
        if (p?.url) {
          const cat = (p.category || '').toLowerCase();
          let score = 50;
          if (cat === 'home' || cat === 'cover' || cat === 'main') {
            score = 1;
          } else if (
            cat.includes('view') ||
            cat.includes('pemandangan') ||
            cat.includes('alam')
          ) {
            score = 2;
          } else if (
            cat.includes('camping_ground') ||
            cat.includes('ground') ||
            cat.includes('outdoor')
          ) {
            score = 3;
          } else if (
            cat.includes('toilet') ||
            cat.includes('wc') ||
            cat.includes('mandi')
          ) {
            score = 99;
          }
          scored.push({ url: p.url, score });
        }
      });

      if (scored.length > 0) {
        scored.sort((a, b) => a.score - b.score);
        if (scored[0].score < 99) {
          return scored[0].url;
        }
      }
    }

    // 2. Fallback to block photos if campsite photos are empty
    if (Array.isArray(camp.blocks) && camp.blocks.length > 0) {
      const scored: Array<{ url: string; score: number }> = [];
      camp.blocks.forEach((b: any) => {
        if (Array.isArray(b.photos)) {
          b.photos.forEach((p: any) => {
            if (p?.url) {
              const cat = (p.category || '').toLowerCase();
              let score = 50;
              if (
                cat.includes('mandi') ||
                cat.includes('toilet') ||
                cat.includes('wc')
              )
                score = 99;
              else if (
                cat.includes('luar') ||
                cat.includes('pemandangan') ||
                cat.includes('view') ||
                cat.includes('alam')
              )
                score = 1;
              else if (
                cat.includes('utama') ||
                cat.includes('tenda') ||
                cat.includes('kamar')
              )
                score = 2;
              scored.push({ url: p.url, score });
            }
          });
        }
        if (Array.isArray(b.images)) {
          b.images.forEach((img: string) => {
            if (img) scored.push({ url: img, score: 50 });
          });
        }
      });
      if (scored.length > 0) {
        scored.sort((a, b) => a.score - b.score);
        return scored[0].url;
      }
    }
    if (camp.mapImageUrl) return camp.mapImageUrl;
    return '';
  };

  // Format dynamic location string: e.g. "KABUPATEN BANDUNG" -> "Bandung"
  const formatLocationName = (raw?: string): string => {
    if (!raw) return '';
    let clean = raw.trim();
    clean = clean.replace(/^(KABUPATEN|KOTA|KAB\.|KEC\.)\s+/i, '');
    return clean
      .toLowerCase()
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Dynamic Cities list extracted directly from live API campsites
  const availableCities = useMemo(() => {
    const list: string[] = ['Semua'];
    const seen = new Set<string>();

    campsites.forEach((c) => {
      const loc = formatLocationName(c.city || c.address || '');
      if (loc && !seen.has(loc.toLowerCase())) {
        seen.add(loc.toLowerCase());
        list.push(loc);
      }
    });

    return list;
  }, [campsites]);

  // Section 1: Embun Plus (Paling Atas) - True Embun Plus units only
  const embunPlusSpots = useMemo(() => {
    return allSpots.filter((s) => s.isEmbunPlus);
  }, [allSpots]);

  // Section 2: Spot Terdekat Sekitar Anda
  const nearbySpots = useMemo(() => {
    const nonPlus = allSpots.filter((s) => !s.isEmbunPlus);
    return nonPlus.length > 0 ? nonPlus.slice(0, 4) : allSpots.slice(0, 4);
  }, [allSpots]);

  // Section 3: Pilihan Berdasarkan Pemandangan Alam
  const [selectedViewTab, setSelectedViewTab] = useState('sungai');

  const spotsByView = useMemo(() => {
    return allSpots.filter((s) => matchesSpotView(s, selectedViewTab));
  }, [allSpots, selectedViewTab]);

  // Tampilkan hingga 10 spot agar baris grid terisi penuh & seimbang (2 baris penuh di grid 5 kolom)
  const displayedViewSpots = useMemo(() => {
    return spotsByView.slice(0, 10);
  }, [spotsByView]);

  const handleSeeAllViewSpots = (viewId: string) => {
    setSelectedCategory(`view:${viewId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section 5: Spot Lainnya
  const otherSpots = useMemo(() => {
    return allSpots;
  }, [allSpots]);

  const toggleFavorite = async (id: string) => {
    if (!getGuestToken()) {
      setIsAuthOpen(true);
      return;
    }

    const spot = allSpots.find((s) => s.id === id);
    if (!spot) return;

    const isFav = favoriteIds.includes(id);
    setFavoriteIds((prev) =>
      isFav ? prev.filter((x) => x !== id) : [...prev, id],
    );

    try {
      if (isFav) {
        await removeFromWishlist(spot.campsite.id, spot.id);
      } else {
        await addToWishlist(spot.campsite.id, spot.id);
      }
    } catch {
      setFavoriteIds((prev) =>
        isFav ? [...prev, id] : prev.filter((x) => x !== id),
      );
    }
  };

  const isFilteringActive =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'all' ||
    (selectedCity && selectedCity !== 'Semua Lokasi');

  return (
    <div className="min-h-screen bg-white text-foreground flex flex-col selection:bg-brand-lime selection:text-black">
      {/* ═══ 1. AIRBNB-STYLE HEADER ═══ */}
      <ExploreHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        availableCities={availableCities}
      />

      {/* ═══ 2. CATEGORY ICON BAR ═══ */}
      <CategoryFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* ═══ 3. MAIN CATALOG CONTENT ═══ */}
      <main className="max-w-[2520px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 flex-1 space-y-16">
        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-6">
            <div className="w-48 h-6 bg-surface rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-surface rounded-2xl animate-pulse" />
                  <div className="w-3/4 h-4 bg-surface rounded-md animate-pulse" />
                  <div className="w-1/2 h-3 bg-surface rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-200">
            <p className="text-sm text-red-600 font-semibold mb-2">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-full bg-brand-blue text-white text-xs font-bold cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        ) : isFilteringActive ? (
          /* ── FOCUSED SEARCH / CATEGORY FILTER VIEW ── */
          <div className="space-y-6">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {searchQuery
                    ? `Hasil Pencarian: "${searchQuery}"`
                    : selectedCategory !== 'all'
                    ? `Kategori: ${
                        selectedCategory.startsWith('view:')
                          ? VIEW_SECTIONS.find(
                              (v) =>
                                v.id === selectedCategory.replace('view:', ''),
                            )?.label || selectedCategory
                          : CATEGORIES.find((c) => c.id === selectedCategory)
                              ?.label || selectedCategory
                      }`
                    : `Destinasi: ${selectedCity}`}
                </h2>
                <p className="text-xs text-foreground-muted">
                  Menampilkan {filteredSpots.length} unit penginapan alam
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedCity('');
                }}
                className="text-xs font-bold text-brand-blue hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>

            {filteredSpots.length === 0 ? (
              <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border p-6">
                <Tent size={40} className="mx-auto text-foreground-muted mb-2" />
                <h3 className="font-bold text-sm text-foreground">
                  Tidak ada spot yang cocok
                </h3>
                <p className="text-xs text-foreground-muted mt-1">
                  Coba ubah kata kunci pencarian atau pilih kategori lain.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-7">
                {filteredSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onSelectSpot={handleSelectSpot}
                    isFavorite={favoriteIds.includes(spot.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── HOME DISCOVERY FEED (4 CLEAN STRUCTURED SECTIONS) ── */
          <div className="space-y-16">
            {/* ── 1. EMBUN PLUS (PALING ATAS) ── */}
            {embunPlusSpots.length > 0 && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-3">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      Pilihan Penginapan Premium
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Akomodasi glamping & kabin pilihan dengan fasilitas terlengkap dan kenyamanan maksimal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-7">
                  {embunPlusSpots.map((spot) => (
                    <SpotCard
                      key={`plus-${spot.id}`}
                      spot={spot}
                      onSelectSpot={handleSelectSpot}
                      isFavorite={favoriteIds.includes(spot.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── 2. SPOT TERDEKAT (SEKITAR ANDA) ── */}
            {nearbySpots.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      Spot Terdekat Sekitar Anda
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Pilihan spot camping dan glamping berjarak dekat untuk liburan akhir pekan singkat.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-7">
                  {nearbySpots.map((spot) => (
                    <SpotCard
                      key={`near-${spot.id}`}
                      spot={spot}
                      onSelectSpot={handleSelectSpot}
                      isFavorite={favoriteIds.includes(spot.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── 3. PILIHAN BERDASARKAN PEMANDANGAN ALAM ── */}
            {allSpots.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-3">
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      Pilihan Berdasarkan Pemandangan Alam
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Temukan spot camping & glamping dengan panorama favorit, dari tepi sungai hingga danau dan pegunungan.
                    </p>
                  </div>

                  {spotsByView.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSeeAllViewSpots(selectedViewTab)}
                      className="text-xs font-bold text-brand-blue hover:underline cursor-pointer shrink-0 hidden sm:inline-block"
                    >
                      Lihat Semua ({spotsByView.length}) →
                    </button>
                  )}
                </div>

                {/* Filter Tabs View (Clean Airbnb style - no icons, no number badges) */}
                <div
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {VIEW_SECTIONS.map((v) => {
                    const isSelected = selectedViewTab === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedViewTab(v.id)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer outline-none select-none ${
                          isSelected
                            ? 'bg-brand-blue text-white shadow-2xs font-bold'
                            : 'bg-surface hover:bg-surface-variant text-foreground-muted hover:text-foreground border border-border/80'
                        }`}
                      >
                        <span className="whitespace-nowrap tracking-tight">{v.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Spot Cards Grid (Up to 10 spots to keep rows completely filled and balanced) */}
                {spotsByView.length === 0 ? (
                  <div className="text-center py-12 bg-surface/50 rounded-3xl border border-border p-6">
                    <Tent size={36} className="mx-auto text-foreground-muted mb-2" />
                    <h4 className="font-bold text-sm text-foreground">
                      Belum ada spot untuk pemandangan ini
                    </h4>
                    <p className="text-xs text-foreground-muted mt-1">
                      Pilihan spot dengan pemandangan ini akan segera ditambahkan oleh mitra campsite.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-7">
                      {displayedViewSpots.map((spot) => (
                        <SpotCard
                          key={`view-${spot.id}`}
                          spot={spot}
                          onSelectSpot={handleSelectSpot}
                          isFavorite={favoriteIds.includes(spot.id)}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))}
                    </div>

                    {spotsByView.length > 10 && (
                      <div className="flex justify-center pt-2">
                        <button
                          type="button"
                          onClick={() => handleSeeAllViewSpots(selectedViewTab)}
                          className="px-6 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-variant text-foreground text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:border-brand-blue hover:text-brand-blue"
                        >
                          <span>
                            Lihat Semua {spotsByView.length} Spot {VIEW_SECTIONS.find((v) => v.id === selectedViewTab)?.label || ''}
                          </span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}

            {/* ── 4. JELAJAHI CAMPSITE ── */}
            {campsites.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      Jelajahi Lokasi Campsite
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Pilih bumi perkemahan lengkap dengan fasilitas umum, pemandangan, dan peta area.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {campsites.map((camp) => {
                    const coverPhoto = getCampsiteCoverPhoto(camp);
                    const spotCount = Array.isArray(camp.blocks)
                      ? camp.blocks.length
                      : 0;
                    const hasFailed = failedCampsiteImages.has(camp.id);
                    return (
                      <div
                        key={camp.id}
                        onClick={() => {
                          window.location.href = `/campsite/${camp.slug || camp.id}`;
                        }}
                        className="group p-4 rounded-3xl border border-border bg-white hover:shadow-lg transition-all cursor-pointer flex flex-col space-y-3"
                      >
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-surface">
                          {coverPhoto && !hasFailed ? (
                            <img
                              src={resolveAssetUrl(coverPhoto)}
                              alt={camp.name}
                              onError={() => {
                                setFailedCampsiteImages(
                                  (prev) => new Set([...prev, camp.id]),
                                );
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 via-[#0841b5] to-slate-900 text-white p-4 text-center">
                              <span className="font-bold text-xs">{camp.name}</span>
                              <span className="text-[10px] text-white/70">
                                {camp.address || 'Kawasan Wisata Alam'}
                              </span>
                            </div>
                          )}
                          {(camp.reviewCount ?? 0) > 0 && (Number(camp.rating) || 0) > 0 && (
                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-foreground shadow-xs flex items-center gap-1">
                              <Star
                                size={12}
                                className="fill-amber-500 text-amber-500"
                              />
                              <span>{Number(camp.rating).toFixed(1)}</span>
                            </div>
                          )}
                          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-xs">
                            {spotCount} Pilihan Unit Spot
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-base text-foreground group-hover:text-brand-blue transition-colors">
                            {camp.name}
                          </h4>
                          <p className="text-xs text-foreground-muted line-clamp-1">
                            {camp.address || 'Kawasan Wisata Alam'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                          <span className="text-foreground-muted">
                            Lihat semua kavling
                          </span>
                          <span className="font-bold text-brand-blue transition-colors">
                            Eksplorasi Spot
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── 4. JELAJAHI SPOT LAINNYA ── */}
            {otherSpots.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      Jelajahi Spot Lainnya
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Koleksi lengkap beragam pilihan kavling, tenda, saung, dan glamping.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-7">
                  {otherSpots.map((spot) => (
                    <SpotCard
                      key={`other-${spot.id}`}
                      spot={spot}
                      onSelectSpot={handleSelectSpot}
                      isFavorite={favoriteIds.includes(spot.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>


      {/* ═══ 4. FOOTER ═══ */}
      <ExploreFooter />

      {/* ═══ 5. MODAL LOGIN ═══ */}
      {isAuthOpen && (
        <GuestAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onSuccess={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {/* ═══ 6. MODAL TUR 360° INTERAKTIF (TETAP DI HALAMAN EXPLORE) ═══ */}
      {selected360Spot && (
        <Tour360Modal
          spot={selected360Spot}
          onClose={() => setSelected360Spot(null)}
        />
      )}
    </div>
  );
}

