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
import {
  Tent,
  Star,
} from 'lucide-react';

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

  const handleSelectSpot = (spot: SpotData) => {
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
        setCampsites(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat katalog campsite.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
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
                rating: camp.rating ? Number(camp.rating) : 5.0,
                reviewCount: camp.reviewCount || 48,
                panoramaSpots: camp.panoramaSpots || [],
              },
            });
          }
        });
      }

      // Collect individual 360 panorama markers across maps, mapMarkers, panoramaSpots, and photos
      const camp360Markers: any[] = [];
      const seenPanoUrls = new Set<string>();

      const addPanoMarker = (marker: any) => {
        const img = (
          marker.panoramaImageUrl ||
          marker.imageUrl ||
          marker.url ||
          ''
        ).trim();
        if (img && !seenPanoUrls.has(img)) {
          seenPanoUrls.add(img);
          camp360Markers.push({
            id: marker.id || `pano-${camp360Markers.length}`,
            label: marker.label || marker.description || 'Spot 360°',
            imageUrl: img,
            lat: marker.lat,
            lng: marker.lng,
            isDefault: marker.isDefaultPanorama ?? marker.isDefault ?? false,
            hotspots: marker.panoramaHotspots || marker.hotspots || [],
            yaw: marker.panoramaYaw ?? marker.yaw,
            pitch: marker.panoramaPitch ?? marker.pitch,
          });
        }
      };

      if (Array.isArray(camp.maps)) {
        camp.maps.forEach((m: any) => {
          if (Array.isArray(m.markers)) {
            m.markers.forEach((marker: any) => {
              if (marker.type === 'panorama' || marker.panoramaImageUrl) {
                addPanoMarker(marker);
              }
            });
          }
        });
      }

      if (Array.isArray(camp.mapMarkers)) {
        camp.mapMarkers.forEach((marker: any) => {
          if (marker.type === 'panorama' || marker.panoramaImageUrl) {
            addPanoMarker(marker);
          }
        });
      }

      if (Array.isArray(camp.panoramaSpots)) {
        camp.panoramaSpots.forEach((ps: any) => {
          addPanoMarker(ps);
        });
      }

      if (Array.isArray(camp.photos)) {
        camp.photos.forEach((p: any) => {
          if (
            p.category?.toLowerCase().includes('360') ||
            p.category?.toLowerCase().includes('panorama')
          ) {
            addPanoMarker(p);
          }
        });
      }

      // If camp has 360 markers, create individual 360 spot cards for each marker (e.g. Strawberry Side, Skyview)
      if (camp360Markers.length > 0) {
        camp360Markers.forEach((pm) => {
          list.push({
            id: `tour360-${pm.id}`,
            name: `Tur 360°: ${pm.label}`,
            tentType: 'Tur 360°',
            baseCapacity: 0,
            maxCapacity: 0,
            weekdayPrice: 0,
            weekendPrice: 0,
            holidayPrice: 0,
            isTour360Only: true,
            panoramaPhotos: [
              pm,
              ...camp360Markers.filter((other) => other.id !== pm.id),
            ],
            photos: [{ url: pm.imageUrl, category: '360' }],
            images: [pm.imageUrl],
            campsite: {
              id: camp.id,
              name: camp.name,
              slug: camp.slug,
              address: camp.address,
              city: camp.city,
              province: camp.province,
              mapImageUrl: camp.mapImageUrl,
              addons: [],
              rating: camp.rating ? Number(camp.rating) : 5.0,
              reviewCount: camp.reviewCount || 48,
              panoramaSpots: camp360Markers,
            },
          } as any);
        });
      } else if (camp.tour360Enabled === true) {
        // Fallback: campsite with tour360Enabled=true shows up even when
        // panorama photos are still in progress
        const coverFallback =
          camp.coverImageUrl ||
          (Array.isArray(camp.photos) && camp.photos.length > 0
            ? camp.photos[0].url
            : null);
        list.push({
          id: `tour360-${camp.id}`,
          name: `Tur 360° ${camp.name}`,
          tentType: 'Tur 360°',
          baseCapacity: 0,
          maxCapacity: 0,
          weekdayPrice: 0,
          weekendPrice: 0,
          holidayPrice: 0,
          isTour360Only: true,
          panoramaPhotos: coverFallback
            ? [
                {
                  id: `cover-${camp.id}`,
                  label: 'Tur 360° Segera Hadir',
                  imageUrl: coverFallback,
                },
              ]
            : [],
          photos: Array.isArray(camp.photos) ? camp.photos : [],
          images: camp.coverImageUrl ? [camp.coverImageUrl] : [],
          campsite: {
            id: camp.id,
            name: camp.name,
            slug: camp.slug,
            address: camp.address,
            city: camp.city,
            province: camp.province,
            mapImageUrl: camp.mapImageUrl,
            addons: [],
            rating: camp.rating ? Number(camp.rating) : 5.0,
            reviewCount: camp.reviewCount || 48,
            panoramaSpots: [],
          },
        } as any);
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
          (spot as any).isTour360Only ||
          (Array.isArray(spot.panoramaPhotos) && spot.panoramaPhotos.length > 0) ||
          !!(spot as any).panoramaImageUrl ||
          (Array.isArray(spot.photos) &&
            spot.photos.some(
              (p) =>
                p.category?.toLowerCase().includes('360') ||
                p.category?.toLowerCase().includes('panorama'),
            )) ||
          (Array.isArray((spot.campsite as any)?.panoramaSpots) &&
            (spot.campsite as any).panoramaSpots.length > 0);
      } else if (selectedCategory !== 'all') {
        // If not in 360 category, exclude standalone 360 tour placeholder cards
        if ((spot as any).isTour360Only) return false;

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

  // Section 4: Spot Lainnya
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
        availableCities={availableCities}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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

            {/* ── 3. JELAJAHI CAMPSITE ── */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {campsites.map((camp) => {
                    const coverPhoto = getCampsiteCoverPhoto(camp);
                    const spotCount = Array.isArray(camp.blocks)
                      ? camp.blocks.length
                      : 0;
                    const hasFailed = failedCampsiteImages.has(camp.id);
                    return (
                      <div
                        key={camp.id}
                        onClick={() => setSearchQuery(camp.name)}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7">
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
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-8 text-xs text-foreground-muted mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-brand-blue tracking-tight">
              embun
            </span>
            <span>© 2026 PT Alam Kelana Digital. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/kebijakan-privasi" className="hover:underline">
              Privasi
            </a>
            <a href="/syarat-ketentuan" className="hover:underline">
              Syarat & Ketentuan
            </a>
            <a href="/mitra" className="hover:underline">
              Mitra Camp
            </a>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
