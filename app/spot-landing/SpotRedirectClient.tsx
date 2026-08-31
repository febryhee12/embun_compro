'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Tent,
  Users,
  BedDouble,
  MapPin,
  Star,
  Share2,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Sparkles,
  Clock,
  ShieldCheck,
  Layers,
  Wifi,
  Coffee,
  Flame,
  Camera,
  Droplets,
  Building2,
  Maximize2,
  X,
  ArrowRight,
  Info,
  Download,
} from 'lucide-react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.embun.app/api';
const APP_STORE_HREF = 'https://apps.apple.com/app/embun';
const GOOGLE_PLAY_HREF =
  'https://play.google.com/store/apps/details?id=app.embun';
const WEBSITE_HREF = 'https://embun.app';

interface PhotoItem {
  url: string;
  category?: string;
}

interface PricingPackageItem {
  id?: string;
  name: string;
  description?: string;
  pricingModel?: string;
  flatRateMode?: boolean;
  flatRate?: number | string;
  weekdayRate?: number | string;
  weekendRate?: number | string;
  holidayRate?: number | string;
  minGuestCount?: number;
  maxOccupancy?: number;
  isFree?: boolean;
}

interface SpotItem {
  id: string;
  name: string;
  blockNumber?: string | null;
  tentType?: string;
  roomSize?: string | null;
  bedType?: string | null;
  baseCapacity: number;
  maxCapacity: number;
  pitchStock?: number | null;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  extraPersonFee: number;
  images?: string[];
  photos?: PhotoItem[];
  facilities?: string[];
  viewOptions?: string[];
  pricingPackages?: PricingPackageItem[];
  isEmbunPlus?: boolean;
  shareCode?: string;
  status?: string;
}

interface CampsiteDetail {
  id: string;
  name: string;
  slug: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  logoUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  rating?: number;
  reviewCount?: number;
  facilities?: Array<{ id: string; name: string; icon?: string }>;
  photos?: Array<{ id: string; url: string; category?: string }>;
  blocks: SpotItem[];
}

function resolveTokenFromPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2 || segments[0] !== 'spot') return null;
  return segments[1] || null;
}

function resolveAssetUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${host}${cleanPath}`;
}

const rupiah = (val?: number | string | null) => {
  if (val == null || val === '') return 'Rp0';
  const n = Number(val);
  if (isNaN(n)) return 'Rp0';
  return `Rp ${n.toLocaleString('id-ID')}`;
};

export function SpotRedirectClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [activeSpot, setActiveSpot] = useState<SpotItem | null>(null);

  // Gallery state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Resolve token & fetch live data from backend
  useEffect(() => {
    const rawPath = window.location.pathname;
    const resolvedToken = resolveTokenFromPath(rawPath);
    setToken(resolvedToken);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = `${API_BASE_URL}/public/campsites/resolve-spot`;
        if (resolvedToken) {
          url += `?token=${encodeURIComponent(resolvedToken)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          // Fallback: jika token spesifik tidak ditemukan/lama, ambil properti aktif agar preview tetap tampil
          const listRes = await fetch(`${API_BASE_URL}/public/campsites`);
          if (listRes.ok) {
            const list = await listRes.json();
            if (Array.isArray(list) && list.length > 0) {
              const fallbackCamp = list[0];
              setCampsite(fallbackCamp);
              const firstSpot = fallbackCamp.blocks?.[0] || null;
              setActiveSpot(firstSpot);
              setActivePhotoIdx(0);
              if (firstSpot) {
                document.title = `${firstSpot.name} · ${fallbackCamp.name} | Embun`;
              }
              return;
            }
          }
          throw new Error('Unit atau penginapan tidak ditemukan.');
        }

        const data = await res.json();
        const camp: CampsiteDetail = data.campsite || data;
        setCampsite(camp);

        // Find matched spot or first spot
        const matchedBlockId = data.blockId;
        const matched =
          camp.blocks?.find(
            (b) =>
              b.id === matchedBlockId ||
              b.shareCode === resolvedToken ||
              b.id === resolvedToken,
          ) || camp.blocks?.[0];

        setActiveSpot(matched || null);
        setActivePhotoIdx(0);

        // Update document title for rich browser experience
        if (matched && camp) {
          document.title = `${matched.name} · ${camp.name} | Embun`;
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat rincian properti.');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Update title when active spot changes
  useEffect(() => {
    if (activeSpot && campsite) {
      document.title = `${activeSpot.name} · ${campsite.name} | Embun`;
    }
  }, [activeSpot, campsite]);

  // Sort photos prioritizing 'Kamar Utama / Tenda'
  const spotPhotos = useMemo(() => {
    if (!activeSpot) return [];
    const list: PhotoItem[] = [];

    if (Array.isArray(activeSpot.photos) && activeSpot.photos.length > 0) {
      activeSpot.photos.forEach((p) => {
        if (p?.url) list.push(p);
      });
    }

    if (list.length === 0 && Array.isArray(activeSpot.images)) {
      activeSpot.images.forEach((img) => {
        if (img) list.push({ url: img, category: 'Foto Unit' });
      });
    }

    // Fallback to campsite photos if spot has no photos
    if (list.length === 0 && Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
        if (p?.url) list.push(p);
      });
    }

    // Sort: Kamar Utama first
    const priorities = [
      'Kamar Utama / Tenda',
      'Tampak Luar / Pemandangan',
      'Ruang Santai / Balkon',
      'Fasilitas Lainnya',
      'Kamar Mandi / Toilet',
    ];

    return list.sort((a, b) => {
      const idxA = priorities.indexOf(a.category || '');
      const idxB = priorities.indexOf(b.category || '');
      const scoreA = idxA === -1 ? 99 : idxA;
      const scoreB = idxB === -1 ? 99 : idxB;
      return scoreA - scoreB;
    });
  }, [activeSpot, campsite]);

  // Starting price calculation
  const startingPrice = useMemo(() => {
    if (!activeSpot) return 0;
    const prices: number[] = [];

    if (
      Array.isArray(activeSpot.pricingPackages) &&
      activeSpot.pricingPackages.length > 0
    ) {
      activeSpot.pricingPackages.forEach((pkg) => {
        if (pkg.flatRateMode && pkg.flatRate != null && pkg.flatRate !== '') {
          prices.push(Number(pkg.flatRate));
        } else {
          if (pkg.weekdayRate != null && pkg.weekdayRate !== '') {
            prices.push(Number(pkg.weekdayRate));
          }
          if (pkg.weekendRate != null && pkg.weekendRate !== '') {
            prices.push(Number(pkg.weekendRate));
          }
        }
      });
    }

    if (prices.length > 0) {
      const min = Math.min(...prices.filter((p) => !isNaN(p) && p > 0));
      if (min !== Infinity) return min;
    }

    return activeSpot.weekdayPrice || 0;
  }, [activeSpot]);

  // Deep Link CTA Handlers
  const handleOpenApp = () => {
    if (!activeSpot) return;
    const blockIdentifier = activeSpot.shareCode || activeSpot.id;
    const appDeepLink = `embun://spot?blockId=${encodeURIComponent(
      blockIdentifier,
    )}`;

    // Try custom scheme
    window.location.href = appDeepLink;

    // Fallback prompt after short delay
    setTimeout(() => {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isAndroid) {
        window.location.href = GOOGLE_PLAY_HREF;
      } else if (isIOS) {
        window.location.href = APP_STORE_HREF;
      }
    }, 1500);
  };

  const handleShareWhatsApp = () => {
    if (!activeSpot || !campsite) return;
    const shareUrl = window.location.href;
    const text = `Halo! Lihat penginapan ${activeSpot.name} di ${
      campsite.name
    }. Tarif mulai ${rupiah(
      startingPrice,
    )}/malam. Pesan langsung di Embun App: ${shareUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Loading Skeleton ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-foreground flex flex-col">
        {/* Top Navbar Skeleton */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-24 h-7 bg-surface rounded-lg animate-pulse" />
          </div>
          <div className="w-28 h-9 bg-surface rounded-full animate-pulse" />
        </header>

        <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
          {/* Hero Image Skeleton */}
          <div className="w-full aspect-[16/10] sm:aspect-[2/1] rounded-3xl bg-surface animate-pulse" />
          <div className="space-y-3">
            <div className="w-1/3 h-6 bg-surface rounded-lg animate-pulse" />
            <div className="w-2/3 h-8 bg-surface rounded-lg animate-pulse" />
            <div className="w-1/2 h-4 bg-surface rounded-lg animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────────────
  if (error || !campsite || !activeSpot) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center text-foreground">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-sm">
          <Tent size={32} />
        </div>
        <h1 className="text-xl font-bold font-serif mb-2">
          Unit Penginapan Tidak Ditemukan
        </h1>
        <p className="text-sm text-foreground-muted max-w-sm mb-6 leading-relaxed">
          {error ||
            'Tautan yang Anda tuju mungkin sudah kedaluwarsa atau unit telah dinonaktifkan oleh pengelola.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={WEBSITE_HREF}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover transition-colors shadow-sm"
          >
            Kunjungi Website Embun
          </a>
          <a
            href={GOOGLE_PLAY_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-border bg-white text-foreground text-xs font-bold hover:bg-surface transition-colors"
          >
            Unduh Aplikasi
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-foreground flex flex-col selection:bg-brand-lime selection:text-black">
      {/* ═══ TOP NAVBAR ═══ */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <a href={WEBSITE_HREF} className="flex items-center gap-2.5 group">
            <span className="font-serif font-black text-xl tracking-tight text-brand-blue">
              embun
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
              Web Preview
            </span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-full text-foreground-muted hover:text-foreground hover:bg-surface transition-colors"
              title="Bagikan ke WhatsApp"
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              onClick={handleOpenApp}
              className="px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Buka di App</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 pb-28 space-y-8 flex-1">
        {/* 1. PHOTO HERO GALLERY */}
        <section className="space-y-3">
          <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-3xl overflow-hidden bg-surface-dark border border-border shadow-soft group">
            {spotPhotos.length > 0 ? (
              <img
                src={resolveAssetUrl(spotPhotos[activePhotoIdx]?.url)}
                alt={activeSpot.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/50 gap-2">
                <Tent size={48} />
                <span className="text-xs">Foto penginapan belum tersedia</span>
              </div>
            )}

            {/* Photo Category Pill */}
            {spotPhotos[activePhotoIdx]?.category && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                  {spotPhotos[activePhotoIdx].category}
                </span>
              </div>
            )}

            {/* Fullscreen Button */}
            {spotPhotos.length > 0 && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-colors"
              >
                <Maximize2 size={13} />
                <span>Lihat Semua ({spotPhotos.length} Foto)</span>
              </button>
            )}

            {/* Prev / Next Arrows */}
            {spotPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === 0 ? spotPhotos.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === spotPhotos.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {spotPhotos.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {spotPhotos.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-20 sm:w-24 aspect-[4/3] rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    activePhotoIdx === idx
                      ? 'border-brand-blue shadow-xs scale-102 ring-2 ring-brand-blue/30'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveAssetUrl(photo.url)}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {photo.category?.toLowerCase().includes('kamar') && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5 truncate px-1">
                      Kamar
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 2. SPOT INFO & BOOKING CARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT / MAIN COLUMN (Rincian Unit) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="space-y-2 border-b border-border pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                  {activeSpot.tentType || 'Glamping'}
                </span>
                {activeSpot.blockNumber && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface text-foreground-muted border border-border">
                    Kavling {activeSpot.blockNumber}
                  </span>
                )}
                {activeSpot.isEmbunPlus && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                    <Star size={11} className="fill-white" /> Rekomendasi
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-serif text-foreground tracking-tight">
                {activeSpot.name}
              </h1>

              {/* Campsite & Location */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-foreground-muted">
                <span className="font-semibold text-foreground">
                  {campsite.name}
                </span>
                {campsite.rating && campsite.rating > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {campsite.rating.toFixed(1)}{' '}
                    {campsite.reviewCount ? `(${campsite.reviewCount} ulasan)` : ''}
                  </span>
                )}
              </div>

              {campsite.address && (
                <p className="text-xs text-foreground-muted flex items-start gap-1 pt-1">
                  <MapPin size={14} className="text-brand-blue shrink-0 mt-0.5" />
                  <span>{campsite.address}</span>
                </p>
              )}
            </div>

            {/* Key Unit Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-4 rounded-2xl border border-border">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-foreground-muted uppercase">
                  Kapasitas
                </p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users size={14} className="text-brand-blue" />
                  Maks. {activeSpot.maxCapacity || 1} Orang
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-foreground-muted uppercase">
                  Tipe Kasur
                </p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5 truncate">
                  <BedDouble size={14} className="text-brand-blue shrink-0" />
                  <span className="truncate">
                    {activeSpot.bedType || 'Bawa Sendiri'}
                  </span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-foreground-muted uppercase">
                  Ukuran Spot
                </p>
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers size={14} className="text-brand-blue" />
                  {activeSpot.roomSize || 'Standar'}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-foreground-muted uppercase">
                  Pemandangan
                </p>
                <p className="text-xs font-bold text-foreground truncate">
                  {activeSpot.viewOptions?.[0] || 'Nuansa Alam'}
                </p>
              </div>
            </div>

            {/* Pilihan Paket Harga */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
                Pilihan Paket Menginap
              </h3>

              {Array.isArray(activeSpot.pricingPackages) &&
              activeSpot.pricingPackages.length > 0 ? (
                <div className="space-y-3">
                  {activeSpot.pricingPackages.map((pkg, idx) => (
                    <div
                      key={pkg.id || idx}
                      className="p-4 rounded-2xl bg-white border border-border shadow-2xs hover:border-brand-blue/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground">
                            {pkg.name}
                          </h4>
                          {idx === 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                              Paling Populer
                            </span>
                          )}
                        </div>
                        {pkg.description && (
                          <p className="text-xs text-foreground-muted leading-relaxed">
                            {pkg.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-foreground-muted pt-0.5">
                          <span>Maks. {pkg.maxOccupancy || activeSpot.maxCapacity} tamu</span>
                          {pkg.minGuestCount ? (
                            <span>· Min. {pkg.minGuestCount} malam</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-sm font-black text-brand-blue">
                          {pkg.flatRateMode
                            ? rupiah(pkg.flatRate)
                            : rupiah(pkg.weekdayRate)}
                          <span className="text-[10px] font-normal text-foreground-muted">
                            /malam
                          </span>
                        </p>
                        {!pkg.flatRateMode && pkg.weekendRate && (
                          <p className="text-[10px] text-foreground-muted">
                            Weekend: {rupiah(pkg.weekendRate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-border shadow-2xs flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      Paket Standar {activeSpot.name}
                    </h4>
                    <p className="text-xs text-foreground-muted">
                      Menginap 1 malam (Kapasitas hingga {activeSpot.maxCapacity} orang)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-brand-blue">
                      {rupiah(activeSpot.weekdayPrice)}
                      <span className="text-[10px] font-normal text-foreground-muted">
                        /malam
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fasilitas Unit */}
            {Array.isArray(activeSpot.facilities) &&
              activeSpot.facilities.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
                    Fasilitas Unit
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSpot.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground"
                      >
                        <Check size={13} className="text-emerald-600" />
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Tentang Properti Campsite */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
                Tentang {campsite.name}
              </h3>
              {campsite.description && (
                <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed whitespace-pre-line">
                  {campsite.description}
                </p>
              )}

              {/* Fasilitas Umum Campsite */}
              {Array.isArray(campsite.facilities) &&
                campsite.facilities.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-foreground mb-2">
                      Fasilitas Umum Properti:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {campsite.facilities.map((fac) => (
                        <span
                          key={fac.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border text-xs font-medium text-foreground-muted shadow-2xs"
                        >
                          <Sparkles size={12} className="text-brand-blue" />
                          {fac.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Jam Check-in / Out */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-0.5">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Clock size={13} /> Check-in Mulai
                  </span>
                  <p className="font-bold text-foreground">
                    {campsite.checkInTime || '14:00 WIB'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-0.5">
                  <span className="text-foreground-muted flex items-center gap-1">
                    <Clock size={13} /> Check-out Maksimal
                  </span>
                  <p className="font-bold text-foreground">
                    {campsite.checkOutTime || '12:00 WIB'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Desktop Sticky Booking Action Card) */}
          <div className="hidden lg:block lg:sticky lg:top-24 space-y-4">
            <div className="p-6 rounded-3xl bg-white border border-border shadow-soft space-y-5">
              <div>
                <p className="text-xs text-foreground-muted">Tarif Sewa Mulai</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-brand-blue">
                    {rupiah(startingPrice)}
                  </span>
                  <span className="text-xs text-foreground-muted">/ malam</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Unit:</span>
                  <span className="font-bold text-foreground">
                    {activeSpot.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Kapasitas:</span>
                  <span className="font-semibold text-foreground">
                    Hingga {activeSpot.maxCapacity} Orang
                  </span>
                </div>
                <div className="flex items-center justify-between text-foreground-muted">
                  <span>Metode DP:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Bisa DP 50%
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenApp}
                className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Pesan Sekarang di Embun App</span>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-variant text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-variant text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
                </button>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-foreground-muted text-center pt-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Transaksi Resmi & Terproteksi Embun</span>
              </div>
            </div>

            {/* App Store Links */}
            <div className="p-4 rounded-2xl bg-surface border border-border text-center space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Belum punya aplikasi Embun?
              </p>
              <div className="flex items-center justify-center gap-2">
                <a
                  href={GOOGLE_PLAY_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white border border-border text-[11px] font-bold text-foreground hover:border-brand-blue transition-colors shadow-2xs"
                >
                  Google Play
                </a>
                <a
                  href={APP_STORE_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white border border-border text-[11px] font-bold text-foreground hover:border-brand-blue transition-colors shadow-2xs"
                >
                  App Store
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SECTION: JELAJAHI UNIT LAIN DI CAMPSITE INI */}
        {campsite.blocks && campsite.blocks.length > 1 && (
          <section className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-foreground">
                  Pilihan Unit Lain di {campsite.name}
                </h3>
                <p className="text-xs text-foreground-muted">
                  Klik unit di bawah untuk langsung melihat rincian foto & harga
                </p>
              </div>
              <span className="text-xs font-bold text-foreground-muted">
                {campsite.blocks.length} Unit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {campsite.blocks.map((spot) => {
                const isSelected = spot.id === activeSpot.id;
                const spotCover =
                  spot.photos?.find(
                    (p) =>
                      p.category === 'Kamar Utama / Tenda' ||
                      p.category?.toLowerCase().includes('utama') ||
                      p.category?.toLowerCase().includes('kamar'),
                  )?.url ||
                  spot.photos?.[0]?.url ||
                  spot.images?.[0];

                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => {
                      setActiveSpot(spot);
                      setActivePhotoIdx(0);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 group cursor-pointer ${
                      isSelected
                        ? 'bg-brand-blue/5 border-brand-blue ring-2 ring-brand-blue/20 shadow-xs'
                        : 'bg-white border-border hover:border-brand-blue/40 shadow-2xs'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface shrink-0 border border-border">
                      {spotCover ? (
                        <img
                          src={resolveAssetUrl(spotCover)}
                          alt={spot.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                          <Tent size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs text-foreground truncate">
                          {spot.name}
                        </p>
                        {spot.isEmbunPlus && (
                          <Star
                            size={11}
                            className="fill-amber-500 text-amber-500 shrink-0"
                          />
                        )}
                      </div>
                      <p className="text-[11px] text-foreground-muted truncate">
                        {spot.tentType || 'Glamping'} · Maks. {spot.maxCapacity}{' '}
                        org
                      </p>
                      <p className="text-xs font-black text-brand-blue pt-0.5">
                        {rupiah(spot.weekdayPrice)}
                      </p>
                    </div>

                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </span>
                    ) : (
                      <ChevronRight
                        size={16}
                        className="text-foreground-muted group-hover:text-foreground shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ═══ STICKY FLOATING BOTTOM BAR (MOBILE ONLY) ═══ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-3.5 px-4 flex items-center justify-between gap-3 shadow-xl">
        <div>
          <p className="text-[10px] text-foreground-muted">Mulai dari</p>
          <p className="text-base font-black text-brand-blue">
            {rupiah(startingPrice)}
            <span className="text-[10px] font-normal text-foreground-muted">
              /mlm
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-2.5 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-variant transition-colors"
            title="Bagikan"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleOpenApp}
            className="px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span>Pesan di App</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ═══ LIGHTBOX MODAL (FULLSCREEN GALLERY) ═══ */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {activeSpot.name}
              </h3>
              <p className="text-xs text-white/60">
                Foto {activePhotoIdx + 1} dari {spotPhotos.length} ·{' '}
                {spotPhotos[activePhotoIdx]?.category || 'Galeri'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={resolveAssetUrl(spotPhotos[activePhotoIdx]?.url)}
              alt="Fullscreen Preview"
              className="max-h-full max-w-full object-contain rounded-xl"
            />

            {spotPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === 0 ? spotPhotos.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActivePhotoIdx((prev) =>
                      prev === spotPhotos.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail preview strip in lightbox */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-2 border-t border-white/10">
            {spotPhotos.map((photo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-14 sm:w-16 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activePhotoIdx === idx
                    ? 'border-brand-lime scale-105'
                    : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={resolveAssetUrl(photo.url)}
                  alt={`Thumb ${idx}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
