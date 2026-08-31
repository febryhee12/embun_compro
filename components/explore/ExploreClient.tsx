'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchActiveCampsites,
  getStoredGuestProfile,
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
  ChevronRight,
  Loader2,
  Heart,
} from 'lucide-react';

export function ExploreClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campsites, setCampsites] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('');

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
                rating: camp.rating || 4.9,
                reviewCount: camp.reviewCount || 32,
              },
            });
          }
        });
      }
    });
    return list;
  }, [campsites]);

  // 3. Filtered Spots
  const filteredSpots = useMemo(() => {
    return allSpots.filter((spot) => {
      // Search text query
      const matchSearch =
        !searchQuery ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.campsite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.campsite.address
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

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

      return matchSearch && matchCat;
    });
  }, [allSpots, searchQuery, selectedCategory]);

  // 4. Featured Collections
  const virtual360Spots = useMemo(() => {
    return allSpots.filter(
      (s) =>
        Array.isArray(s.panoramaPhotos) && s.panoramaPhotos.length > 0,
    );
  }, [allSpots]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

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
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1 space-y-12">
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
        ) : (
          <>
            {/* ── SECTION: SEMUA SPOT ATAU HASIL FILTER ── */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground tracking-tight">
                    {selectedCategory === 'all'
                      ? 'Rekomendasi Spot & Glamping Pilihan'
                      : `Kategori: ${
                          CATEGORIES.find((c) => c.id === selectedCategory)
                            ?.label
                        }`}
                  </h2>
                  <p className="text-xs text-foreground-muted">
                    Menampilkan {filteredSpots.length} unit penginapan alam
                    terbaik
                  </p>
                </div>
              </div>

              {filteredSpots.length === 0 ? (
                <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border p-6">
                  <Tent size={40} className="mx-auto text-foreground-muted mb-2" />
                  <h3 className="font-bold text-sm text-foreground">
                    Tidak ada spot yang cocok
                  </h3>
                  <p className="text-xs text-foreground-muted mt-1">
                    Coba ganti kata kunci pencarian atau pilih kategori lain.
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

            {/* ── SECTION: KOLEKSI TUR 360° ── */}
            {virtual360Spots.length > 0 && selectedCategory === 'all' && (
              <div className="space-y-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-foreground flex items-center gap-2">
                      <Compass size={20} className="text-brand-blue" />
                      <span>Eksplorasi dengan Tur Virtual 360°</span>
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      Lihat suasana tenda dan keindahan alam dari segala sudut
                      sebelum memesan
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {virtual360Spots.map((spot) => (
                    <SpotCard
                      key={`360-${spot.id}`}
                      spot={spot}
                      onSelectSpot={setSelectedSpot}
                      isFavorite={favoriteIds.includes(spot.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ═══ 4. FOOTER ═══ */}
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-8 text-xs text-foreground-muted mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-lg text-brand-blue">
              embun
            </span>
            <span>© 2026 PT Embun Berkah Alam. Hak Cipta Dilindungi.</span>
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
      <GuestAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSuccess={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />

      <BookingDrawerModal
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
      />
    </div>
  );
}
