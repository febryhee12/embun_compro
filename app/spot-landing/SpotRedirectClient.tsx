'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  RotateCw,
  Compass,
  LayoutGrid,
  Search,
  Eye,
  Smartphone,
  ChevronDown,
  ChevronUp,
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

interface PanoramaItem {
  id: string;
  label?: string;
  imageUrl: string;
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
  panoramaPhotos?: PanoramaItem[] | any;
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

// Pannellum loader helper
function loadPannellum(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).pannellum) {
      return resolve((window as any).pannellum);
    }
    if (!document.querySelector('link[data-pannellum]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      link.setAttribute('data-pannellum', '1');
      document.head.appendChild(link);
    }
    if (!document.querySelector('script[data-pannellum]')) {
      const script = document.createElement('script');
      script.src =
        'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.setAttribute('data-pannellum', '1');
      script.onload = () => resolve((window as any).pannellum);
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => {
        if ((window as any).pannellum) {
          clearInterval(check);
          resolve((window as any).pannellum);
        }
      }, 100);
    }
  });
}

export function SpotRedirectClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [activeSpot, setActiveSpot] = useState<SpotItem | null>(null);

  // Showcase state
  const [viewMode, setViewMode] = useState<'photo' | '360'>('photo');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activePanoramaIdx, setActivePanoramaIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTentFilter, setSelectedTentFilter] = useState('Semua');
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const panoramaContainerRef = useRef<HTMLDivElement | null>(null);
  const pannellumViewerRef = useRef<any>(null);

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
          // Fallback to active campsites list
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

        // If spot has 360 panorama, default to 360 or keep photo
        if (
          matched?.panoramaPhotos &&
          Array.isArray(matched.panoramaPhotos) &&
          matched.panoramaPhotos.length > 0
        ) {
          // Keep photo as first view with 360 tab ready
        }

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

    if (list.length === 0 && Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
        if (p?.url) list.push(p);
      });
    }

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

  // Extract 360 panorama photos
  const panoramaList = useMemo(() => {
    if (!activeSpot) return [];
    const list: PanoramaItem[] = [];

    if (Array.isArray(activeSpot.panoramaPhotos)) {
      activeSpot.panoramaPhotos.forEach((p: any) => {
        if (p?.imageUrl || p?.url) {
          list.push({
            id: p.id || String(Math.random()),
            label: p.label || p.category || 'Tur 360° Unit',
            imageUrl: p.imageUrl || p.url,
            category: p.category,
          });
        }
      });
    }

    // Also check campsite 360 photos
    if (Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
        if (
          p.category?.toLowerCase().includes('360') ||
          p.category?.toLowerCase().includes('panorama')
        ) {
          list.push({
            id: p.id,
            label: 'Panorama Area Camp',
            imageUrl: p.url,
            category: p.category,
          });
        }
      });
    }

    return list;
  }, [activeSpot, campsite]);

  // Initialize / update 360 Pannellum viewer when 360 viewMode is active
  useEffect(() => {
    if (viewMode !== '360' || panoramaList.length === 0) return;

    let destroyed = false;

    const initViewer = async () => {
      const pannellum = await loadPannellum();
      if (destroyed || !pannellum || !panoramaContainerRef.current) return;

      try {
        if (pannellumViewerRef.current) {
          pannellumViewerRef.current.destroy();
          pannellumViewerRef.current = null;
        }

        const currentPano = panoramaList[activePanoramaIdx];
        if (!currentPano) return;

        pannellumViewerRef.current = pannellum.viewer(
          panoramaContainerRef.current,
          {
            type: 'equirectangular',
            panorama: resolveAssetUrl(currentPano.imageUrl),
            autoLoad: true,
            autoRotate: -2,
            compass: true,
            showZoomCtrl: true,
            showFullscreenCtrl: true,
            mouseZoom: true,
            hfov: 100,
          },
        );
      } catch (err) {
        console.error('Error init pannellum:', err);
      }
    };

    void initViewer();

    return () => {
      destroyed = true;
      if (pannellumViewerRef.current) {
        try {
          pannellumViewerRef.current.destroy();
        } catch {}
        pannellumViewerRef.current = null;
      }
    };
  }, [viewMode, activePanoramaIdx, panoramaList]);

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

  // Filtered spots list in sidebar / grid
  const filteredSpots = useMemo(() => {
    if (!campsite?.blocks) return [];
    return campsite.blocks.filter((spot) => {
      const matchQ =
        !searchFilter ||
        spot.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        spot.blockNumber?.toLowerCase().includes(searchFilter.toLowerCase());
      const matchType =
        selectedTentFilter === 'Semua' || spot.tentType === selectedTentFilter;
      return matchQ && matchType;
    });
  }, [campsite, searchFilter, selectedTentFilter]);

  // Next / Prev Spot Navigation (TikTok feed style)
  const currentSpotIndex = useMemo(() => {
    if (!campsite?.blocks || !activeSpot) return -1;
    return campsite.blocks.findIndex((b) => b.id === activeSpot.id);
  }, [campsite, activeSpot]);

  const handleNextSpot = () => {
    if (!campsite?.blocks) return;
    const nextIdx = (currentSpotIndex + 1) % campsite.blocks.length;
    setActiveSpot(campsite.blocks[nextIdx]);
    setActivePhotoIdx(0);
    setActivePanoramaIdx(0);
  };

  const handlePrevSpot = () => {
    if (!campsite?.blocks) return;
    const prevIdx =
      currentSpotIndex <= 0
        ? campsite.blocks.length - 1
        : currentSpotIndex - 1;
    setActiveSpot(campsite.blocks[prevIdx]);
    setActivePhotoIdx(0);
    setActivePanoramaIdx(0);
  };

  // Deep Link CTA Handlers
  const handleOpenApp = () => {
    if (!activeSpot) return;
    const blockIdentifier = activeSpot.shareCode || activeSpot.id;
    const appDeepLink = `embun://spot?blockId=${encodeURIComponent(
      blockIdentifier,
    )}`;

    window.location.href = appDeepLink;

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
    )}/malam. Cek preview & pesan di Embun App: ${shareUrl}`;
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
      <div className="min-h-screen bg-[#0E0E10] text-white flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/20 border border-brand-blue/40 flex items-center justify-center text-brand-blue animate-pulse">
            <Tent size={24} />
          </div>
          <p className="text-xs font-semibold text-white/60">
            Memuat preview penginapan Embun...
          </p>
        </div>
      </div>
    );
  }

  // ── Error State ─────────────────────────────────────────────────────────────
  if (error || !campsite || !activeSpot) {
    return (
      <div className="min-h-screen bg-[#0E0E10] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4 shadow-sm">
          <Tent size={32} />
        </div>
        <h1 className="text-xl font-bold font-serif mb-2">
          Unit Penginapan Tidak Ditemukan
        </h1>
        <p className="text-sm text-white/60 max-w-sm mb-6 leading-relaxed">
          {error || 'Tautan yang Anda tuju tidak valid atau telah dinonaktifkan.'}
        </p>
        <a
          href={WEBSITE_HREF}
          className="px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover transition-colors shadow-sm"
        >
          Kunjungi Website Embun
        </a>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0D0D11] text-white flex flex-col selection:bg-brand-lime selection:text-black">
      {/* ════════════════════════════════════════════════════════════════════════
          TOP APPBAR (TikTok Web Style)
      ════════════════════════════════════════════════════════════════════════ */}
      <header className="h-14 shrink-0 bg-[#14141B] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 z-40">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href={WEBSITE_HREF} className="flex items-center gap-2">
            <span className="font-serif font-black text-2xl tracking-tight text-white">
              embun
            </span>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-lime text-black shadow-sm">
              Showcase
            </span>
          </a>
        </div>

        {/* Center Campsite Location Info */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white/80 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
          <MapPin size={13} className="text-brand-lime shrink-0" />
          <span className="font-bold text-white truncate max-w-xs">
            {campsite.name}
          </span>
          {campsite.address && (
            <span className="text-white/50 truncate max-w-xs">
              · {campsite.address}
            </span>
          )}
        </div>

        {/* Top Right Action CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
            title="Bagikan ke WhatsApp"
          >
            <Share2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleOpenApp}
            className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Smartphone size={14} />
            <span>Pesan di App</span>
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          MAIN 3-PANEL SHOWCASE VIEW (TikTok Web Layout)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── 1. LEFT SIDEBAR: JELAJAH UNIT & FILTER (Desktop) ── */}
        <aside className="hidden lg:flex w-72 shrink-0 bg-[#121218] border-r border-white/10 flex-col overflow-hidden">
          {/* Campsite Header Card */}
          <div className="p-4 border-b border-white/10 space-y-2">
            <h3 className="font-bold text-sm text-white truncate">
              {campsite.name}
            </h3>
            {campsite.rating && campsite.rating > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                <Star size={13} className="fill-amber-400" />
                <span>
                  {campsite.rating.toFixed(1)} ({campsite.reviewCount || 0} ulasan)
                </span>
              </div>
            )}
            <p className="text-[11px] text-white/50">
              Pilih unit di bawah untuk beralih showcase:
            </p>
          </div>

          {/* Search in Campsite */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-2.5 text-white/40"
              />
              <input
                type="text"
                placeholder="Cari spot (misal: B5)..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-lime"
              />
            </div>
          </div>

          {/* Spot List (Vertical Scroll) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {filteredSpots.map((spot) => {
              const isSelected = spot.id === activeSpot.id;
              const has360 =
                Array.isArray(spot.panoramaPhotos) &&
                spot.panoramaPhotos.length > 0;
              const coverPhoto =
                spot.photos?.find(
                  (p) =>
                    p.category === 'Kamar Utama / Tenda' ||
                    p.category?.toLowerCase().includes('utama'),
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
                    setActivePanoramaIdx(0);
                  }}
                  className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 group cursor-pointer ${
                    isSelected
                      ? 'bg-brand-blue/20 border-brand-blue ring-1 ring-brand-blue shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                    {coverPhoto ? (
                      <img
                        src={resolveAssetUrl(coverPhoto)}
                        alt={spot.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40">
                        <Tent size={18} />
                      </div>
                    )}
                    {has360 && (
                      <div className="absolute top-0.5 right-0.5 bg-brand-lime text-black rounded-full p-0.5">
                        <Compass size={9} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`font-bold text-xs truncate ${
                          isSelected ? 'text-brand-lime' : 'text-white'
                        }`}
                      >
                        {spot.name}
                      </p>
                      {spot.isEmbunPlus && (
                        <Star
                          size={10}
                          className="fill-amber-400 text-amber-400 shrink-0"
                        />
                      )}
                    </div>
                    <p className="text-[10.5px] text-white/50 truncate">
                      {spot.tentType || 'Glamping'} · {rupiah(spot.weekdayPrice)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── 2. CENTER: IMMERSIVE MEDIA CANVAS (Foto & 360 Showcase) ── */}
        <main className="flex-1 flex flex-col bg-black relative overflow-hidden">
          {/* Showcase Mode Switcher (Foto HD vs Tur 360°) */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-lg">
            <button
              type="button"
              onClick={() => setViewMode('photo')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'photo'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Camera size={13} />
              <span>Foto HD ({spotPhotos.length})</span>
            </button>

            {panoramaList.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode('360')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === '360'
                    ? 'bg-brand-lime text-black shadow-sm'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Compass size={13} className="animate-spin-slow" />
                <span>Tur 360° ({panoramaList.length})</span>
              </button>
            )}
          </div>

          {/* Center Showcase Content */}
          <div className="flex-1 w-full h-full relative flex items-center justify-center">
            {viewMode === '360' && panoramaList.length > 0 ? (
              /* ── 360° INTERACTIVE PANORAMA VIEWER ── */
              <div className="w-full h-full relative">
                <div
                  ref={panoramaContainerRef}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                />

                {/* 360 Control Overlay Hint */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/90 flex items-center gap-2 pointer-events-none shadow-xl">
                  <RotateCw size={14} className="text-brand-lime animate-spin" />
                  <span>Geser layar / mouse untuk melihat 360°</span>
                </div>

                {/* 360 Scene Selector if multiple 360 scenes */}
                {panoramaList.length > 1 && (
                  <div className="absolute top-16 left-4 z-30 flex gap-2">
                    {panoramaList.map((pano, idx) => (
                      <button
                        key={pano.id}
                        type="button"
                        onClick={() => setActivePanoramaIdx(idx)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md border transition-all ${
                          activePanoramaIdx === idx
                            ? 'bg-brand-lime text-black border-brand-lime'
                            : 'bg-black/60 text-white border-white/20 hover:bg-black/80'
                        }`}
                      >
                        {pano.label || `Area ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* ── HIGH DEFINITION PHOTO CAROUSEL ── */
              <div className="w-full h-full relative flex items-center justify-center p-2 sm:p-6">
                {spotPhotos.length > 0 ? (
                  <img
                    src={resolveAssetUrl(spotPhotos[activePhotoIdx]?.url)}
                    alt={activeSpot.name}
                    className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <Tent size={48} />
                    <p className="text-xs">Foto belum tersedia</p>
                  </div>
                )}

                {/* Photo Category Pill */}
                {spotPhotos[activePhotoIdx]?.category && (
                  <div className="absolute top-16 sm:top-6 right-4 sm:right-6">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/70 text-white backdrop-blur-md border border-white/20">
                      {spotPhotos[activePhotoIdx].category}
                    </span>
                  </div>
                )}

                {/* Left / Right Photo Arrows */}
                {spotPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) =>
                          prev === 0 ? spotPhotos.length - 1 : prev - 1,
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-lg"
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors shadow-lg"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}

                {/* Bottom Thumbnail Strip */}
                {spotPhotos.length > 1 && (
                  <div className="absolute bottom-4 inset-x-4 flex justify-center">
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 max-w-md overflow-x-auto no-scrollbar">
                      {spotPhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`relative w-12 h-10 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                            activePhotoIdx === idx
                              ? 'border-brand-lime scale-105'
                              : 'border-transparent opacity-60 hover:opacity-100'
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
            )}
          </div>

          {/* Vertical Next/Prev Spot Floater (TikTok Up/Down Arrow Style) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col gap-2">
            <button
              type="button"
              onClick={handlePrevSpot}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105"
              title="Spot Sebelumnya"
            >
              <ChevronUp size={20} />
            </button>
            <button
              type="button"
              onClick={handleNextSpot}
              className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl hover:scale-105"
              title="Spot Berikutnya"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </main>

        {/* ── 3. RIGHT PANEL: SPOT DETAILS & DIRECT BOOKING ACTION ── */}
        <aside className="w-full sm:w-96 lg:w-96 shrink-0 bg-[#14141C] border-l border-white/10 flex flex-col overflow-hidden">
          {/* Scrollable details */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
            {/* Header info */}
            <div className="space-y-1.5 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-blue/20 text-brand-blue border border-brand-blue/40">
                  {activeSpot.tentType || 'Glamping'}
                </span>
                {activeSpot.blockNumber && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white/80 border border-white/10">
                    Kavling {activeSpot.blockNumber}
                  </span>
                )}
                {activeSpot.isEmbunPlus && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                    <Star size={10} className="fill-white" /> Favorit
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeSpot.name}
              </h2>
              <p className="text-xs text-white/60">{campsite.name}</p>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-white/50">Tarif Sewa Mulai</p>
                <p className="text-xl font-black text-brand-lime">
                  {rupiah(startingPrice)}
                  <span className="text-[11px] font-normal text-white/60">
                    {' '}
                    / malam
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-white/50 uppercase">
                  Kapasitas
                </span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Users size={14} className="text-brand-lime" />
                  Maks. {activeSpot.maxCapacity || 1} Orang
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-white/50 uppercase">
                  Kasur
                </span>
                <p className="font-semibold text-white truncate flex items-center gap-1.5">
                  <BedDouble size={14} className="text-brand-lime shrink-0" />
                  <span className="truncate">
                    {activeSpot.bedType || 'Bawa Sendiri'}
                  </span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-white/50 uppercase">
                  Ukuran
                </span>
                <p className="font-semibold text-white">
                  {activeSpot.roomSize || 'Standar'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-white/50 uppercase">
                  Pemandangan
                </span>
                <p className="font-semibold text-white truncate">
                  {activeSpot.viewOptions?.[0] || 'Nuansa Alam'}
                </p>
              </div>
            </div>

            {/* Paket Harga */}
            {Array.isArray(activeSpot.pricingPackages) &&
              activeSpot.pricingPackages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Pilihan Paket Harga:
                  </p>
                  <div className="space-y-2">
                    {activeSpot.pricingPackages.map((pkg, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{pkg.name}</p>
                          {pkg.description && (
                            <p className="text-[11px] text-white/50 truncate max-w-[180px]">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                        <p className="font-black text-brand-lime">
                          {pkg.flatRateMode
                            ? rupiah(pkg.flatRate)
                            : rupiah(pkg.weekdayRate)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Fasilitas Unit */}
            {Array.isArray(activeSpot.facilities) &&
              activeSpot.facilities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Fasilitas Unit:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSpot.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/80 flex items-center gap-1"
                      >
                        <Check size={11} className="text-emerald-400" />
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Fasilitas Campsite */}
            {Array.isArray(campsite.facilities) &&
              campsite.facilities.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Fasilitas Umum Campsite:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {campsite.facilities.map((fac) => (
                      <span
                        key={fac.id}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] text-white/70 flex items-center gap-1"
                      >
                        <Sparkles size={11} className="text-brand-lime" />
                        {fac.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Sticky Bottom Action Box inside Right Panel */}
          <div className="p-4 border-t border-white/10 bg-[#121218] space-y-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenApp}
              className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Smartphone size={16} />
              <span>Buka & Pesan di Aplikasi Embun</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 size={13} />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-400" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
