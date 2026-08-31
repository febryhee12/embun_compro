'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchActiveCampsites,
  getStoredGuestProfile,
  resolveAssetUrl,
  rupiah,
} from '@/lib/api-client';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import {
  CategoryFilterBar,
  CATEGORIES,
} from '@/components/explore/CategoryFilterBar';
import { SpotCard, SpotData } from '@/components/explore/SpotCard';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { BookingDrawerModal } from '@/components/explore/BookingDrawerModal';
import {
  Tent,
  Sparkles,
  Compass,
  MapPin,
  Trees,
  Navigation,
  Star,
  Layers,
} from 'lucide-react';

export function ExploreClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campsites, setCampsites] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeKabupaten, setActiveKabupaten] = useState('Semua');

  // Modals & Selected Spot
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<SpotData | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // 1. Initial Data Fetch
  useEffect(() => {
    setCurrentUser(getStoredGuestProfile());

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActiveCampsites();
        setCampsites(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat katalog campsite.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // 2. Extract All Spots from Campsites
  const allSpots: SpotData[] = useMemo(() => {
    const list: SpotData[] = [];
    campsites.forEach((camp) => {
      if (Array.isArray(camp.blocks)) {
        camp.blocks.forEach((b: any) => {
          if (b.status === 'active' || !b.status) {
            list.push({
              ...b,
              campsite: {
                id: camp.id,
                name: camp.name,
                slug: camp.slug,
                address: camp.address,
                city: camp.city,
                province: camp.province,
                mapImageUrl: camp.mapImageUrl,
                addons: camp.addons || [],
                rating: camp.rating ? Number(camp.rating) : 5.0,
                reviewCount: camp.reviewCount || 48,
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

      // Category filter
      let matchCat = true;
      if (selectedCategory === '360') {
        matchCat =
          Array.isArray(spot.panoramaPhotos) && spot.panoramaPhotos.length > 0;
      } else if (selectedCategory !== 'all') {
        const cleanTarget = selectedCategory.toLowerCase().trim();
        const spotType = (spot.tentType || '').toLowerCase().trim();
        const spotName = (spot.name || '').toLowerCase().trim();
        matchCat =
          spotType === cleanTarget ||
          spotType.includes(cleanTarget) ||
          spotName.includes(cleanTarget);
      }

      return matchSearch && matchCity && matchCat;
    });
  }, [allSpots, searchQuery, selectedCategory, selectedCity]);

  // 4. Section Data Computations
  // Section 1: Embun Plus (Paling Atas)
  const embunPlusSpots = useMemo(() => {
    return allSpots.filter(
      (s) =>
        s.isEmbunPlus ||
        s.tentType?.toLowerCase().includes('glamping') ||
        s.tentType?.toLowerCase().includes('cabin') ||
        s.tentType?.toLowerCase().includes('saung'),
    );
  }, [allSpots]);

  // Section 2: Spot Terdekat Sekitar Anda
  const nearbySpots = useMemo(() => {
    return allSpots.slice(0, 4);
  }, [allSpots]);

  // Section 3: Populer di Kabupaten
  const kabupatenSpots = useMemo(() => {
    if (activeKabupaten === 'Semua') return allSpots;
    const target = activeKabupaten.toLowerCase();
    return allSpots.filter(
      (s) =>
        (s.campsite.address && s.campsite.address.toLowerCase().includes(target)) ||
        (s.campsite.city && s.campsite.city.toLowerCase().includes(target)) ||
        (s.campsite.name && s.campsite.name.toLowerCase().includes(target)),
    );
  }, [allSpots, activeKabupaten]);

  // Section 5: Spot Lainnya
  const otherSpots = useMemo(() => {
    return allSpots;
  }, [allSpots]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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
      />

      {/* ═══ 2. CATEGORY ICON BAR ═══ */}
      <CategoryFilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* ═══ 3. MAIN CATALOG CONTENT ═══ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-16">
        {loading ? (
          /* Loading Skeletons */
          <div className="space-y-6">
            <div className="w-48 h-6 bg-surface rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                        CATEGORIES.find((c) => c.id === selectedCategory)
                          ?.label
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
                {filteredSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onSelectSpot={setSelectedSpot}
                    isFavorite={favoriteIds.includes(spot.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── HOME DISCOVERY FEED (5 STRUCTURED SECTIONS) ── */
          <div className="space-y-16">
            {/* ── 1. EMBUN PLUS (PALING ATAS) ── */}
            {embunPlusSpots.length > 0 && (
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-brand-lime text-black border border-brand-lime/80 shadow-2xs flex items-center gap-1">
                        <Sparkles size={12} className="fill-black" />
                        Embun Plus
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                        Pilihan Penginapan Premium
                      </h2>
                    </div>
                    <p className="text-xs text-foreground-muted">
                      Akomodasi glamping & kabin pilihan dengan fasilitas terlengkap dan kenyamanan maksimal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
                  {embunPlusSpots.map((spot) => (
                    <SpotCard
                      key={`plus-${spot.id}`}
                      spot={spot}
                      onSelectSpot={setSelectedSpot}
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
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                      <Navigation size={20} className="text-brand-blue" />
                      <span>Spot Terdekat Sekitar Anda</span>
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Pilihan spot camping dan glamping berjarak dekat untuk liburan akhir pekan singkat.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
                  {nearbySpots.map((spot) => (
                    <SpotCard
                      key={`near-${spot.id}`}
                      spot={spot}
                      onSelectSpot={setSelectedSpot}
                      isFavorite={favoriteIds.includes(spot.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── 3. POPULER DI KABUPATEN ── */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    <MapPin size={20} className="text-brand-blue" />
                    <span>Populer di Kabupaten & Wilayah</span>
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    Jelajahi keindahan alam favorit berdasarkan kabupaten pilihan Anda.
                  </p>
                </div>

                {/* Kabupaten Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {[
                    'Semua',
                    'Lembang',
                    'Bogor',
                    'Sukabumi',
                    'Subang',
                  ].map((kab) => {
                    const isKabSelected = activeKabupaten === kab;
                    return (
                      <button
                        key={kab}
                        type="button"
                        onClick={() => setActiveKabupaten(kab)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isKabSelected
                            ? 'bg-brand-blue text-white shadow-2xs font-bold'
                            : 'bg-surface hover:bg-surface-variant text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        {kab}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
                {kabupatenSpots.slice(0, 8).map((spot) => (
                  <SpotCard
                    key={`kab-${spot.id}`}
                    spot={spot}
                    onSelectSpot={setSelectedSpot}
                    isFavorite={favoriteIds.includes(spot.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>

            {/* ── 4. JELAJAHI CAMPSITE ── */}
            {campsites.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                      <Trees size={20} className="text-emerald-600" />
                      <span>Jelajahi Lokasi Campsite</span>
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Pilih bumi perkemahan lengkap dengan fasilitas umum, pemandangan, dan peta area.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {campsites.map((camp) => {
                    const firstSpotPhoto =
                      camp.blocks?.[0]?.photos?.[0]?.url ||
                      camp.blocks?.[0]?.images?.[0] ||
                      camp.mapImageUrl;
                    const spotCount = Array.isArray(camp.blocks)
                      ? camp.blocks.length
                      : 0;
                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSearchQuery(camp.name)}
                        className="group p-4 rounded-3xl border border-border bg-white hover:shadow-lg transition-all cursor-pointer flex flex-col space-y-3"
                      >
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-surface">
                          {firstSpotPhoto ? (
                            <img
                              src={resolveAssetUrl(firstSpotPhoto)}
                              alt={camp.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-foreground-muted">
                              Foto Campsite
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-bold text-foreground shadow-xs flex items-center gap-1">
                            <Star
                              size={12}
                              className="fill-amber-500 text-amber-500"
                            />
                            <span>5.0</span>
                          </div>
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
                          <span className="font-bold text-brand-blue group-hover:translate-x-0.5 transition-transform">
                            Eksplorasi Spot →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── 5. JELAJAHI SPOT LAINNYA ── */}
            {otherSpots.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-end justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                      <Layers size={20} className="text-brand-blue" />
                      <span>Jelajahi Spot Lainnya</span>
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      Koleksi lengkap beragam pilihan kavling, tenda, saung, dan glamping.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
                  {otherSpots.map((spot) => (
                    <SpotCard
                      key={`other-${spot.id}`}
                      spot={spot}
                      onSelectSpot={setSelectedSpot}
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
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-8 text-xs text-foreground-muted mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-brand-blue tracking-tight">
              embun
            </span>
            <span>© 2026 PT Alam Kelana Digital. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/id/kebijakan-privasi" className="hover:underline">
              Privasi
            </a>
            <a href="/id/syarat-ketentuan" className="hover:underline">
              Syarat & Ketentuan
            </a>
            <a href="/id/mitra" className="hover:underline">
              Mitra Camp
            </a>
          </div>
        </div>
      </footer>

      {/* ═══ 5. MODAL LOGIN & BOOKING DRAWER ═══ */}
      {isAuthOpen && (
        <GuestAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onSuccess={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {selectedSpot && (
        <BookingDrawerModal
          spot={selectedSpot}
          onClose={() => setSelectedSpot(null)}
          onOpenAuth={() => setIsAuthOpen(true)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
