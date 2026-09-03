'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Star,
  Maximize2,
  X,
  Play,
  Info,
  Compass,
  Menu,
} from 'lucide-react';
import { SpotCard, type SpotData } from '@/components/explore/SpotCard';

interface PhotoItem {
  id?: string;
  url: string;
  category?: string;
}

interface PanoramaItem {
  id: string;
  label: string;
  imageUrl: string;
  category?: string;
}

interface PricingPackageItem {
  id: string;
  name: string;
  type: string;
  flatRate: number;
  weekdayPrice?: number;
  weekendPrice?: number;
  holidayPrice?: number;
  maxOccupancy?: number;
  baseCapacity?: number;
}

interface SpotItem {
  id: string;
  name: string;
  blockNumber?: string | null;
  tentType?: string;
  status?: string;
  capacity?: number;
  maxCapacity?: number;
  weekdayPrice?: number;
  weekendPrice?: number;
  holidayPrice?: number;
  pricingPackages?: PricingPackageItem[];
  photos?: PhotoItem[];
  images?: string[];
  panoramaPhotos?: Array<{ id: string; label?: string; imageUrl?: string; url?: string; category?: string }>;
  isEmbunPlus?: boolean;
  shareCode?: string;
  viewOptions?: string[];
  facilities?: string[];
}

interface CampsiteDetail {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  address?: string;
  city?: string;
  province?: string;
  coverImageUrl?: string;
  mainImage?: string;
  mapImageUrl?: string;
  rating?: number;
  reviewCount?: number;
  checkInTime?: string;
  checkOutTime?: string;
  youtube?: string;
  rules?: string;
  facilities?: Array<{ id: string; name: string; icon?: string } | string>;
  blocks?: SpotItem[];
  photos?: PhotoItem[];
  panoramaSpots?: Array<{ id: string; label?: string; description?: string; imageUrl?: string; url?: string }>;
  maps?: Array<{
    markers?: Array<{
      id: string;
      label?: string;
      type?: string;
      imageUrl?: string;
      panoramaImageUrl?: string;
    }>;
  }>;
}

interface ReviewItem {
  id: string;
  guestName: string;
  guestAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  spotName?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.embun.app/api';

function resolveAssetUrl(rawUrl?: string, fallback = ''): string {
  if (!rawUrl || typeof rawUrl !== 'string') return fallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanKey = trimmed.replace(/^\/+/, '');
  return `https://media-staging.embun.app/${cleanKey}`;
}

function rupiah(num: number): string {
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `Rp ${num.toLocaleString('id-ID')}`;
  }
}

function extractYouTubeVideoId(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/i,
  );
  return match ? match[1] : null;
}

let pannellumLoaderPromise: Promise<any> | null = null;

/** Header Persis Beranda Home (Zero Dependency, No Crash) */
function HomeStyleHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo Resmi Embun */}
        <a href="/" className="inline-flex items-center">
          <img
            src="/images/logo/model1_blue.svg"
            alt="Embun"
            className="h-8 w-auto object-contain"
          />
        </a>

        {/* Desktop Nav & CTA Button */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <nav>
            <ul className="flex items-center gap-6 lg:gap-8 text-sm font-medium text-foreground">
              <li>
                <a href="/explore" className="hover:text-brand-blue transition-colors">
                  Jelajahi Spot
                </a>
              </li>
              <li>
                <a href="/id/mitra" className="hover:text-brand-blue transition-colors">
                  Gabung jadi mitra
                </a>
              </li>
              <li>
                <a href="/id/mitra/direktori" className="hover:text-brand-blue transition-colors">
                  Mitra kami
                </a>
              </li>
            </ul>
          </nav>

          <a
            href="/id/mitra/#contact"
            className="inline-flex items-center justify-center rounded-xl bg-[#cbfd00] hover:bg-[#b8e600] text-[#0841b5] font-semibold px-6 py-2.5 text-sm transition-all duration-200 shadow-sm active:scale-95"
          >
            Hubungi Kami
          </a>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="/id/mitra/#contact"
            className="inline-flex items-center justify-center rounded-xl bg-[#cbfd00] text-[#0841b5] font-bold px-3 py-1.5 text-xs shadow-xs"
          >
            Hubungi Kami
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-border text-foreground hover:bg-surface transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 py-4 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2.5 text-sm font-medium text-foreground">
            <a href="/explore" className="py-2 hover:text-brand-blue">
              Jelajahi Spot
            </a>
            <a href="/id/mitra" className="py-2 hover:text-brand-blue">
              Gabung jadi mitra
            </a>
            <a href="/id/mitra/direktori" className="py-2 hover:text-brand-blue">
              Mitra kami
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

/** Footer Persis Beranda Home (Zero Dependency, No Crash) */
function HomeStyleFooter() {
  return (
    <footer className="bg-[#FAFEE8] text-brand-black border-t border-[#E8F5B5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="max-w-xs space-y-3">
          <img
            src="/images/logo/model1_blue.svg"
            alt="Embun"
            className="h-8 w-auto object-contain"
          />
          <p className="text-sm text-foreground-muted leading-relaxed">
            Sepraktis embun pagi, seluas caramu menikmati alam.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-foreground-muted">
          <a href="/explore" className="hover:text-brand-blue transition-colors">
            Jelajahi Spot
          </a>
          <a href="/id/mitra" className="hover:text-brand-blue transition-colors">
            Gabung Mitra
          </a>
          <a href="/id/kebijakan-privasi" className="hover:text-brand-blue transition-colors">
            Kebijakan Privasi
          </a>
          <a href="/id/syarat-ketentuan" className="hover:text-brand-blue transition-colors">
            Syarat & Ketentuan
          </a>
          <a href="/id/kebijakan-refund" className="hover:text-brand-blue transition-colors">
            Kebijakan Refund
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-8 pt-4 border-t border-[#E8F5B5]/60 text-xs text-foreground-muted flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} PT Embun Rekreasi Alam. Hak cipta dilindungi undang-undang.</p>
        <p>Platform Camping & Glamping Resmi</p>
      </div>
    </footer>
  );
}

export function CampsiteLandingClient() {
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  // Filter spot tipe
  const [selectedSpotType, setSelectedSpotType] = useState<string>('Semua');

  // Modals
  const [showFullMapModal, setShowFullMapModal] = useState(false);
  const [show360Modal, setShow360Modal] = useState(false);
  const [active360Index, setActive360Index] = useState(0);

  const pannellumRef = useRef<any>(null);

  // Resolve Campsite Data
  useEffect(() => {
    const segments = window.location.pathname.split('/').filter(Boolean);
    const slugOrId =
      segments.length >= 2 && (segments[0] === 'campsite' || segments[0] === 'spot')
        ? segments[1]
        : new URLSearchParams(window.location.search).get('id') ||
          new URLSearchParams(window.location.search).get('slug') ||
          new URLSearchParams(window.location.search).get('token') ||
          null;

    const loadReviews = async (cid: string) => {
      try {
        const res = await fetch(`${API_BASE}/public/reviews/campsite/${cid}?limit=8`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      }
    };

    const fetchCampsite = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        let url = `${API_BASE}/public/campsites/resolve-spot`;
        if (slugOrId) {
          url += `?token=${encodeURIComponent(slugOrId)}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          if (slugOrId) {
            const fallbackRes = await fetch(`${API_BASE}/public/campsites/${encodeURIComponent(slugOrId)}`);
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setCampsite(fallbackData);
              if (fallbackData.name) {
                document.title = `${fallbackData.name} — Profil Kawasan & Spot Camping | Embun`;
              }
              if (fallbackData.id) loadReviews(fallbackData.id);
              return;
            }
          }

          const allRes = await fetch(`${API_BASE}/public/campsites`);
          if (allRes.ok) {
            const all = await allRes.json();
            if (Array.isArray(all) && all.length > 0) {
              const first = all[0];
              setCampsite(first);
              document.title = `${first.name} — Profil Kawasan & Spot Camping | Embun`;
              if (first.id) loadReviews(first.id);
              return;
            }
          }

          throw new Error('Kawasan campsite tidak ditemukan.');
        }

        const data = await res.json();
        const camp = data.campsite || data;
        setCampsite(camp);
        if (camp.name) {
          document.title = `${camp.name} — Profil Kawasan & Spot Camping | Embun`;
        }
        if (camp.id) loadReviews(camp.id);
      } catch (err: any) {
        setErrorMsg(err?.message || 'Gagal memuat profil kawasan campsite.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampsite();
  }, []);

  // Cover image
  const coverImage = useMemo(() => {
    if (campsite?.coverImageUrl) return campsite.coverImageUrl;
    if (campsite?.mainImage) return campsite.mainImage;
    if (Array.isArray(campsite?.photos) && campsite.photos.length > 0) {
      const p = campsite.photos.find(
        (x) =>
          x?.url &&
          (x.category?.toLowerCase() === 'home' ||
            x.category?.toLowerCase() === 'cover' ||
            x.category?.toLowerCase() === 'main' ||
            x.category?.toLowerCase().includes('view') ||
            x.category?.toLowerCase().includes('pemandangan')),
      );
      if (p?.url) return p.url;
      if (campsite.photos[0]?.url) return campsite.photos[0].url;
    }
    return '';
  }, [campsite]);

  // All active spots
  const allSpots = useMemo(() => {
    if (!campsite || !Array.isArray(campsite.blocks)) return [];
    return campsite.blocks.filter((b) => b.status === 'active' || !b.status);
  }, [campsite]);

  // Available Spot Types for filtering
  const availableSpotTypes = useMemo(() => {
    const types = new Set<string>();
    allSpots.forEach((b) => {
      const t = (b.tentType || '').trim();
      if (t) types.add(t);
    });

    const list = ['Semua', ...Array.from(types)];
    const hasAny360 = allSpots.some(
      (b) => Array.isArray(b.panoramaPhotos) && b.panoramaPhotos.length > 0,
    );
    if (hasAny360) {
      list.push('Tur 360°');
    }
    return list;
  }, [allSpots]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    if (selectedSpotType === 'Semua') return allSpots;
    if (selectedSpotType === 'Tur 360°') {
      return allSpots.filter(
        (b) => Array.isArray(b.panoramaPhotos) && b.panoramaPhotos.length > 0,
      );
    }
    return allSpots.filter(
      (b) => (b.tentType || '').trim().toLowerCase() === selectedSpotType.toLowerCase(),
    );
  }, [allSpots, selectedSpotType]);

  // Starting price across all spots
  const startingPrice = useMemo(() => {
    if (allSpots.length === 0) return 0;
    const prices: number[] = [];
    allSpots.forEach((b) => {
      const p = b.pricingPackages?.[0]?.flatRate || b.weekdayPrice;
      if (p && Number(p) > 0) prices.push(Number(p));
    });
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [allSpots]);

  // All 360 Panoramas
  const panoramaList = useMemo(() => {
    const list: PanoramaItem[] = [];
    const seen = new Set<string>();

    allSpots.forEach((spot) => {
      if (Array.isArray(spot.panoramaPhotos)) {
        spot.panoramaPhotos.forEach((p) => {
          const img = p?.imageUrl || p?.url;
          if (img && !seen.has(img)) {
            seen.add(img);
            list.push({
              id: p.id || String(Math.random()),
              label: p.label || `${spot.name} (360°)`,
              imageUrl: img,
              category: p.category,
            });
          }
        });
      }
    });

    if (Array.isArray(campsite?.panoramaSpots)) {
      campsite.panoramaSpots.forEach((p) => {
        const img = p?.imageUrl || p?.url;
        if (img && !seen.has(img)) {
          seen.add(img);
          list.push({
            id: p.id || String(Math.random()),
            label: p.label || p.description || 'Tur 360° Kawasan',
            imageUrl: img,
            category: 'panorama_campsite',
          });
        }
      });
    }

    return list;
  }, [allSpots, campsite]);

  // YouTube Video
  const youtubeVideoId = useMemo(
    () => extractYouTubeVideoId(campsite?.youtube),
    [campsite?.youtube],
  );

  // Pannellum initialization
  useEffect(() => {
    if (!show360Modal || panoramaList.length === 0) return;
    let destroyed = false;

    const runPannellum = async () => {
      if (typeof window === 'undefined') return;

      const pannellum = (window as any).pannellum
        ? (window as any).pannellum
        : await (pannellumLoaderPromise ||
            (pannellumLoaderPromise = new Promise((resolve) => {
              if (!document.getElementById('pannellum-css')) {
                const link = document.createElement('link');
                link.id = 'pannellum-css';
                link.rel = 'stylesheet';
                link.href =
                  'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
                document.head.appendChild(link);
              }
              const script = document.createElement('script');
              script.src =
                'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
              script.async = true;
              script.onload = () => resolve((window as any).pannellum);
              script.onerror = () => resolve(null);
              document.body.appendChild(script);
            })));

      if (destroyed || !pannellum) return;

      const container = document.getElementById('campsite-panorama-box');
      if (!container) return;

      container.innerHTML = '';
      const currentPano = panoramaList[active360Index] || panoramaList[0];
      if (!currentPano) return;

      try {
        if (pannellumRef.current && typeof pannellumRef.current.destroy === 'function') {
          pannellumRef.current.destroy();
          pannellumRef.current = null;
        }

        pannellumRef.current = pannellum.viewer('campsite-panorama-box', {
          type: 'equirectangular',
          panorama: resolveAssetUrl(currentPano.imageUrl),
          autoLoad: true,
          autoRotate: -1.5,
          compass: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
        });
      } catch (err) {
        console.error('Error initiating Pannellum:', err);
      }
    };

    const timer = setTimeout(runPannellum, 100);
    return () => {
      destroyed = true;
      clearTimeout(timer);
      if (pannellumRef.current && typeof pannellumRef.current.destroy === 'function') {
        try {
          pannellumRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [show360Modal, active360Index, panoramaList]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-brand-blue border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-foreground-muted animate-pulse">
          Memuat profil kawasan campsite...
        </p>
      </div>
    );
  }

  // Error state
  if (errorMsg || !campsite) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Kawasan Tidak Ditemukan</h2>
        <p className="text-sm text-foreground-muted max-w-md mb-6 leading-relaxed">
          {errorMsg || 'Tautan profil properti ini tidak valid atau telah diperbarui.'}
        </p>
        <a
          href="/explore"
          className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold text-sm shadow-md hover:bg-brand-blue/90 transition-all"
        >
          Jelajahi Campsite Lainnya
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── 1. GLOBAL HEADER PERSIS DENGAN HOME (ZERO RISK) ── */}
      <HomeStyleHeader />

      {/* ── 2. FULL-WIDTH PROPERTY HERO BANNER ── */}
      <section className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] bg-black overflow-hidden">
        {coverImage ? (
          <img
            src={resolveAssetUrl(coverImage)}
            alt={campsite.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface text-foreground-muted font-bold text-lg">
            {campsite.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

        {/* 360 Tour badge on top right if available */}
        {panoramaList.length > 0 && (
          <div className="absolute top-6 right-4 sm:right-8 z-10">
            <button
              type="button"
              onClick={() => setShow360Modal(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-white/95 backdrop-blur-md text-foreground flex items-center gap-2 shadow-sm hover:bg-white transition-all cursor-pointer"
            >
              <Compass size={14} className="text-brand-blue" />
              <span>Tur 360° Tersedia</span>
            </button>
          </div>
        )}

        {/* Campsite details at bottom of hero */}
        <div className="absolute bottom-0 inset-x-0 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-white space-y-2">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90">
              <MapPin size={14} className="text-brand-lime shrink-0" />
              <span>
                {campsite.address
                  ? `${campsite.address}, ${campsite.city || ''}`
                  : `${campsite.city || 'Jawa Barat'}, Indonesia`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              {campsite.name}
            </h1>
            {campsite.rating && Number(campsite.rating) > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-xs font-bold">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{Number(campsite.rating).toFixed(1)}</span>
                </div>
                <span className="text-xs text-white/80 font-medium">
                  ({campsite.reviewCount || 0} ulasan terverifikasi)
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. CLEAN SUBTLE METADATA STRIP (NO BIG ICONS) ── */}
      <div className="bg-surface/60 border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-foreground-muted">
          <div>
            <span className="text-foreground font-bold">{allSpots.length} Unit Spot</span> Tersedia
          </div>
          <span className="text-border hidden sm:inline">•</span>
          {startingPrice > 0 && (
            <>
              <div>
                Mulai dari <span className="text-foreground font-bold">{rupiah(startingPrice)}</span> / malam
              </div>
              <span className="text-border hidden sm:inline">•</span>
            </>
          )}
          <div>
            Check-in <span className="text-foreground font-semibold">{campsite.checkInTime || '14:00'}</span> · Check-out <span className="text-foreground font-semibold">{campsite.checkOutTime || '12:00'}</span>
          </div>
          <span className="text-border hidden sm:inline">•</span>
          <div>Konfirmasi Instan</div>
        </div>
      </div>

      {/* ── 4. MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-14 flex-1 w-full">
        {/* TENTANG KAWASAN */}
        <section className="space-y-3">
          <h2 className="font-extrabold text-xl text-foreground">
            Tentang Kawasan {campsite.name}
          </h2>
          <div className="p-6 rounded-3xl bg-white border border-border leading-relaxed text-sm text-foreground/85 whitespace-pre-line">
            {campsite.description ||
              `${campsite.name} merupakan destinasi camping dan glamping pilihan di ${
                campsite.city || 'Jawa Barat'
              } dengan suasana asri, udara sejuk, dan fasilitas lengkap untuk liburan keluarga maupun komunitas Anda.`}
          </div>
        </section>

        {/* FASILITAS KAWASAN — CLEAN MINIMAL PILLS */}
        {Array.isArray(campsite.facilities) && campsite.facilities.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-extrabold text-xl text-foreground">
              Fasilitas Kawasan
            </h2>
            <div className="flex flex-wrap gap-2.5 text-xs sm:text-sm">
              {campsite.facilities.map((fac: any, idx: number) => {
                const facName = typeof fac === 'string' ? fac : fac.name || 'Fasilitas';
                return (
                  <span
                    key={fac.id || idx}
                    className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground font-medium"
                  >
                    {facName}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* VIDEO SUASANA KAWASAN (YOUTUBE) */}
        {youtubeVideoId && (
          <section className="space-y-3">
            <div>
              <h2 className="font-extrabold text-xl text-foreground">
                Video Suasana Kawasan
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Tonton keindahan alam, suasana malam, dan aktivitas di {campsite.name}
              </p>
            </div>
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-lg border border-border bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                title={`Video Kawasan ${campsite.name}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </section>
        )}

        {/* KATALOG SEMUA SPOT DI KAWASAN (MENGGUNAKAN STANDAR SPOTCARD COMPRO) */}
        <section id="katalog-spot" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h2 className="font-extrabold text-xl sm:text-2xl text-foreground">
                Pilihan Spot & Kavling di {campsite.name}
              </h2>
              <p className="text-xs sm:text-sm text-foreground-muted mt-1">
                Tersedia {allSpots.length} unit akomodasi alam siap pesan
              </p>
            </div>

            {/* Filter Pills */}
            {availableSpotTypes.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {availableSpotTypes.map((type) => {
                  const isSelected = selectedSpotType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedSpotType(type)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-brand-blue text-white shadow-xs'
                          : 'bg-white hover:bg-surface text-foreground-muted hover:text-foreground border border-border'
                      }`}
                    >
                      {type === 'Tur 360°' ? '🌐 Tur 360°' : type}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Grid Kartu Spot — Standar SpotCard Compro Tanpa Bintang */}
          {filteredSpots.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-border space-y-2">
              <p className="text-sm font-semibold text-foreground">Tidak ada spot untuk filter ini</p>
              <button
                type="button"
                onClick={() => setSelectedSpotType('Semua')}
                className="text-xs text-brand-blue font-bold hover:underline cursor-pointer"
              >
                Tampilkan Semua Spot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSpots.map((spot) => {
                const spotData: SpotData = {
                  id: spot.id,
                  name: spot.name,
                  blockNumber: spot.blockNumber || null,
                  tentType: spot.tentType,
                  roomSize: (spot as any).roomSize || null,
                  bedType: (spot as any).bedType || null,
                  baseCapacity: spot.capacity || spot.maxCapacity || 4,
                  maxCapacity: spot.maxCapacity || spot.capacity || 4,
                  weekdayPrice: spot.pricingPackages?.[0]?.flatRate || spot.weekdayPrice || 0,
                  weekendPrice: spot.pricingPackages?.[0]?.flatRate || spot.weekendPrice || 0,
                  holidayPrice:
                    spot.pricingPackages?.[0]?.flatRate ||
                    spot.holidayPrice ||
                    spot.weekdayPrice ||
                    0,
                  isEmbunPlus: spot.isEmbunPlus,
                  shareCode: spot.shareCode,
                  photos: spot.photos,
                  images: spot.images,
                  panoramaPhotos: spot.panoramaPhotos,
                  viewOptions: spot.viewOptions,
                  facilities: spot.facilities,
                  campsite: {
                    id: campsite.id,
                    name: campsite.name,
                    slug: campsite.slug,
                    address: campsite.address,
                    city: campsite.city,
                    province: campsite.province,
                    mapImageUrl: campsite.mapImageUrl,
                    rating: campsite.rating,
                    reviewCount: campsite.reviewCount,
                  },
                };

                return (
                  <SpotCard
                    key={spot.id}
                    spot={spotData}
                    showRating={false}
                    onSelectSpot={(s) => {
                      window.location.href = `/spot/${s.shareCode || s.id}`;
                    }}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* DENAH KAWASAN / SITE MAP */}
        {campsite.mapImageUrl && (
          <section className="space-y-3">
            <h2 className="font-extrabold text-xl text-foreground">
              Denah Peta Kawasan
            </h2>
            <div
              onClick={() => setShowFullMapModal(true)}
              className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md border border-border bg-surface cursor-pointer group"
            >
              <img
                src={resolveAssetUrl(campsite.mapImageUrl)}
                alt={`Denah Kawasan ${campsite.name}`}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="px-4 py-2 rounded-xl bg-white/90 backdrop-blur-md text-foreground font-bold text-xs shadow-md flex items-center gap-1.5">
                  <Maximize2 size={13} />
                  <span>Perbesar Denah Kawasan</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ATURAN & KEBIJAKAN MENGINAP */}
        <section className="space-y-3">
          <h2 className="font-extrabold text-xl text-foreground">
            Aturan & Kebijakan Kawasan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-foreground-muted leading-relaxed">
            <div className="p-5 rounded-3xl bg-white border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground">
                Waktu Menginap
              </h3>
              <p>Check-in: Mulai pukul {campsite.checkInTime || '14:00'} WIB</p>
              <p>Check-out: Maksimal pukul {campsite.checkOutTime || '12:00'} WIB</p>
              <p className="text-[11px] text-foreground-muted/80 pt-1">
                Keterlambatan check-out dapat dikenakan biaya tambahan sesuai kebijakan campsite.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground">
                Tata Tertib Menginap
              </h3>
              <p>
                {campsite.rules ||
                  'Menjaga kebersihan area camping, membuang sampah pada tempat yang disediakan, menjaga ketenangan di jam istirahat malam (pukul 22:00 - 06:00), dan mematuhi instruksi pengelola.'}
              </p>
            </div>
          </div>
        </section>

        {/* ULASAN TAMU */}
        {reviews.length > 0 && (
          <section className="space-y-4">
            <div>
              <h2 className="font-extrabold text-xl text-foreground">
                Ulasan Tamu di {campsite.name}
              </h2>
              <p className="text-xs text-foreground-muted mt-0.5">
                Pengalaman nyata dari pengunjung terverifikasi
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((rev: any, idx: number) => {
                const displayName =
                  rev.maskedAuthorName ||
                  rev.authorName ||
                  rev.guestName ||
                  rev.userName ||
                  rev.user?.name ||
                  'Tamu Embun';
                const avatarChar = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={rev.id || idx}
                    className="p-5 rounded-3xl bg-white border border-border space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center overflow-hidden">
                          {rev.authorPhotoUrl || rev.guestAvatar ? (
                            <img
                              src={resolveAssetUrl(rev.authorPhotoUrl || rev.guestAvatar)}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            avatarChar
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-xs text-foreground block">
                            {displayName}
                          </span>
                          {(rev.spotName || rev.blockName) && (
                            <span className="text-[10px] text-foreground-muted">
                              Menginap di {rev.spotName || rev.blockName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star size={12} className="fill-amber-500" />
                        <span>{Number(rev.rating || 5).toFixed(1)}</span>
                      </div>
                    </div>
                    {(rev.comment || rev.content || rev.review) && (
                      <p className="text-xs text-foreground/80 leading-relaxed italic">
                        &ldquo;{(rev.comment || rev.content || rev.review || '').trim()}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* ── 5. GLOBAL FOOTER PERSIS DENGAN HOME (ZERO RISK) ── */}
      <HomeStyleFooter />

      {/* ── MODAL TUR 360° ── */}
      {show360Modal && panoramaList.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Header Modal */}
          <div className="h-14 px-4 bg-black/90 backdrop-blur-md flex items-center justify-between text-white border-b border-white/10 z-10">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-brand-lime animate-spin-slow" />
              <span className="font-bold text-sm">
                Tur 360° — {panoramaList[active360Index]?.label || campsite.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShow360Modal(false)}
              className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Canvas Pannellum Edge-to-Edge */}
          <div className="relative flex-1 w-full bg-black overflow-hidden">
            <div id="campsite-panorama-box" className="w-full h-full" />

            {/* Thumbnail Selector at Bottom if multiple */}
            {panoramaList.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 max-w-[90vw] overflow-x-auto no-scrollbar">
                {panoramaList.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive360Index(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active360Index === idx
                        ? 'bg-brand-lime text-black font-bold shadow-md'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL FULL MAP ── */}
      {showFullMapModal && campsite.mapImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-4">
          <div className="flex justify-between items-center text-white pb-3">
            <h3 className="font-bold text-base">Denah Kawasan {campsite.name}</h3>
            <button
              type="button"
              onClick={() => setShowFullMapModal(false)}
              className="p-2 rounded-full hover:bg-white/15 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <img
              src={resolveAssetUrl(campsite.mapImageUrl)}
              alt="Denah Kawasan Lengkap"
              className="max-h-full max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
