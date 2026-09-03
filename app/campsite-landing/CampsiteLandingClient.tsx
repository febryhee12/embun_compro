'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Star,
  Maximize2,
  X,
  Info,
  Compass,
  Smartphone,
  Share2,
  Heart,
  User,
  ArrowUp,
  ShieldCheck,
  Wifi,
  Bath,
  Droplets,
  Zap,
  Flame,
  Car,
  MoonStar,
  Coffee,
  Waves,
  BriefcaseMedical,
  Store,
  Mountain,
  Trees,
  Tent,
  CheckCircle2,
} from 'lucide-react';
import { SpotCard, type SpotData } from '@/components/explore/SpotCard';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { getStoredGuestProfile } from '@/lib/api-client';

function getFacilityIcon(name?: string, id?: string) {
  const lower = (name || id || '').toLowerCase();
  const iconClass = 'text-foreground shrink-0';
  if (lower.includes('wifi') || lower.includes('sinyal'))
    return <Wifi size={18} className={iconClass} />;
  if (
    lower.includes('toilet') ||
    lower.includes('kamar mandi') ||
    lower.includes('bath') ||
    lower.includes('cuci')
  )
    return <Bath size={18} className={iconClass} />;
  if (
    lower.includes('water heater') ||
    lower.includes('pemanas') ||
    lower.includes('air')
  )
    return <Droplets size={18} className={iconClass} />;
  if (
    lower.includes('listrik') ||
    lower.includes('colokan') ||
    lower.includes('power') ||
    lower.includes('zap')
  )
    return <Zap size={18} className={iconClass} />;
  if (
    lower.includes('api') ||
    lower.includes('bonfire') ||
    lower.includes('bbq') ||
    lower.includes('flame')
  )
    return <Flame size={18} className={iconClass} />;
  if (
    lower.includes('parkir') ||
    lower.includes('car') ||
    lower.includes('parking')
  )
    return <Car size={18} className={iconClass} />;
  if (
    lower.includes('mushola') ||
    lower.includes('prayer') ||
    lower.includes('moon')
  )
    return <MoonStar size={18} className={iconClass} />;
  if (
    lower.includes('cafe') ||
    lower.includes('resto') ||
    lower.includes('coffee')
  )
    return <Coffee size={18} className={iconClass} />;
  if (
    lower.includes('kolam') ||
    lower.includes('pool') ||
    lower.includes('danau') ||
    lower.includes('sungai') ||
    lower.includes('waves')
  )
    return <Waves size={18} className={iconClass} />;
  if (
    lower.includes('keamanan') ||
    lower.includes('security') ||
    lower.includes('pos')
  )
    return <ShieldCheck size={18} className={iconClass} />;
  if (
    lower.includes('p3k') ||
    lower.includes('first aid') ||
    lower.includes('medis')
  )
    return <BriefcaseMedical size={18} className={iconClass} />;
  if (
    lower.includes('warung') ||
    lower.includes('toko') ||
    lower.includes('store')
  )
    return <Store size={18} className={iconClass} />;
  if (lower.includes('gunung') || lower.includes('bukit'))
    return <Mountain size={18} className={iconClass} />;
  if (
    lower.includes('hutan') ||
    lower.includes('pohon') ||
    lower.includes('rumput')
  )
    return <Trees size={18} className={iconClass} />;
  if (
    lower.includes('tenda') ||
    lower.includes('tent') ||
    lower.includes('ground')
  )
    return <Tent size={18} className={iconClass} />;
  return <CheckCircle2 size={18} className={iconClass} />;
}

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
  authorName?: string;
  maskedAuthorName?: string;
  guestName?: string;
  userName?: string;
  user?: { name?: string; fullName?: string };
  authorPhotoUrl?: string;
  guestAvatar?: string;
  rating?: number;
  comment?: string;
  content?: string;
  review?: string;
  createdAt?: string;
  spotName?: string;
  blockName?: string;
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

/** Parses HTML string into clean bullet array */
function parseHtmlRules(htmlString?: string): string[] {
  if (!htmlString) return [];
  const liMatches = htmlString.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches
      .map((li) => li.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean);
  }
  return htmlString
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

let pannellumLoaderPromise: Promise<any> | null = null;

class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('CampsiteLandingClient error caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-foreground">
              Memuat Profil Kawasan
            </h2>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Sedang menghubungkan ke data properti terbaru. Silakan klik tombol di bawah.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md cursor-pointer hover:bg-brand-blue/90"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CampsiteLandingClient() {
  return (
    <SafeErrorBoundary>
      <CampsiteLandingClientInner />
    </SafeErrorBoundary>
  );
}

function CampsiteLandingClientInner() {
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reviews
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);

  // Filter spot tipe
  const [selectedSpotType, setSelectedSpotType] = useState<string>('Semua');

  // Modals & User state
  const [showFullMapModal, setShowFullMapModal] = useState(false);
  const [show360Modal, setShow360Modal] = useState(false);
  const [active360Index, setActive360Index] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const pannellumRef = useRef<any>(null);

  // Load current user
  useEffect(() => {
    setCurrentUser(getStoredGuestProfile());
  }, []);

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
        const res = await fetch(`${API_BASE}/public/reviews/campsite/${cid}?limit=50`);
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

  // Actions
  const handleOpenApp = () => {
    const code = campsite?.slug || campsite?.id || '';
    window.location.href = `embun://campsite/${code}`;
    setTimeout(() => {
      window.location.href = 'https://embun.app/explore';
    }, 1200);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: campsite?.name || 'Embun Campsite',
          url,
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard?.writeText(url);
      alert('Tautan kawasan berhasil disalin!');
    }
  };

  // Parsed Rules
  const parsedRules = useMemo(
    () => parseHtmlRules(campsite?.rules),
    [campsite?.rules],
  );

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
      {/* ── 1. HEADER KHAS EMBUN EXPLORE (SESUAI GAMBAR 1) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo Embun + Badge EXPLORE */}
          <div className="flex items-center gap-3">
            <a
              href="/explore"
              className="flex items-center gap-2.5 group cursor-pointer"
              title="Katalog Explore"
            >
              <img
                src="/images/logo/primary_blue.svg"
                alt="Embun"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-102"
              />
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
                Explore
              </span>
            </a>
          </div>

          {/* Tengah: Pill Lokasi Kawasan (Desktop) */}
          <div className="hidden md:flex items-center gap-2 border border-border rounded-full py-1.5 px-4 shadow-2xs bg-surface text-xs text-foreground font-medium">
            <MapPin size={13} className="text-brand-blue shrink-0" />
            <span className="font-bold">{campsite.name}</span>
            <span className="text-foreground-muted">
              · {campsite.address || campsite.city}
            </span>
          </div>

          {/* Kanan: Buka App, Bagikan, Favorit, Akun / Masuk */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenApp}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-lime hover:bg-brand-lime/90 text-black text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Buka langsung di Aplikasi Embun"
            >
              <Smartphone size={13} />
              <span>Buka App</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              title="Bagikan Halaman Ini"
            >
              <Share2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full border border-border hover:bg-surface transition-colors cursor-pointer ${
                isFavorite ? 'text-red-500' : 'text-foreground'
              }`}
              title="Simpan ke Favorit"
            >
              <Heart size={16} className={isFavorite ? 'fill-red-500' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 border border-border rounded-full py-1.5 px-3 hover:shadow-sm transition-all bg-white text-xs font-semibold text-foreground cursor-pointer"
            >
              {currentUser ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">
                    {currentUser?.avatarUrl || currentUser?.photoUrl ? (
                      <img
                        src={resolveAssetUrl(
                          currentUser.avatarUrl || currentUser.photoUrl,
                        )}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser.fullName?.charAt(0).toUpperCase() || <User size={12} />
                    )}
                  </div>
                  <span>
                    {currentUser.fullName?.split(' ')[0] || 'Akun'}
                  </span>
                </>
              ) : (
                <>
                  <User size={15} className="text-foreground-muted" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

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

        {/* FASILITAS UTAMA PROPERTI (SESUAI DESAIN EMBUN EXPLORE) */}
        {Array.isArray(campsite.facilities) && campsite.facilities.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-extrabold text-xl text-foreground">
              Fasilitas Utama Properti
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs sm:text-sm text-foreground">
              {campsite.facilities.map((fac: any, idx: number) => {
                const facName =
                  typeof fac === 'string' ? fac : fac.name || 'Fasilitas';
                const facIcon =
                  typeof fac === 'object' ? fac.icon : null;
                return (
                  <div
                    key={fac.id || idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface/70 border border-border/80 shadow-2xs hover:bg-surface transition-colors"
                  >
                    {getFacilityIcon(facName, facIcon || fac.id)}
                    <span className="font-medium truncate">{facName}</span>
                  </div>
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

        {/* ── ATURAN & KEBIJAKAN KAWASAN (DIPINDAHKAN KE ATAS, TEPAT DI BAWAH VIDEO) ── */}
        {parsedRules.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-extrabold text-xl text-foreground">
              Aturan & Kebijakan Kawasan
            </h2>
            <div className="p-6 rounded-3xl bg-white border border-border space-y-3 text-xs sm:text-sm">
              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Tata Tertib Menginap</span>
              </h3>
              <ul className="space-y-2.5 text-foreground/80 list-disc list-inside leading-relaxed">
                {parsedRules.map((rule, rIdx) => (
                  <li key={rIdx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
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

        {/* ULASAN TAMU */}
        {reviews.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xl text-foreground">
                  Ulasan Tamu di {campsite.name}
                </h2>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Pengalaman nyata dari pengunjung terverifikasi
                </p>
              </div>
              {reviews.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowReviewsModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:underline cursor-pointer"
                >
                  <span>Semua Ulasan ({reviews.length})</span>
                  <span>→</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.slice(0, 2).map((rev: any, idx: number) => {
                const displayName =
                  rev.maskedAuthorName ||
                  rev.authorName ||
                  rev.guestName ||
                  rev.userName ||
                  rev.user?.name ||
                  'Tamu Embun';
                const avatarChar = displayName.charAt(0).toUpperCase();
                const reviewText =
                  rev.message || rev.comment || rev.content || rev.review || '';

                return (
                  <div
                    key={rev.id || idx}
                    className="p-5 rounded-3xl bg-white border border-border space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
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
                            <span className="text-[10px] text-foreground-muted">
                              {rev.createdAt
                                ? new Date(rev.createdAt).toLocaleDateString('id-ID', {
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'Pengunjung Terverifikasi'}
                              {(rev.spotName || rev.blockName) && ` · ${rev.spotName || rev.blockName}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-surface px-2 py-0.5 rounded-full border border-border shrink-0">
                          <Star size={11} className="fill-amber-500" />
                          <span>{Number(rev.rating || 5).toFixed(1)}</span>
                        </div>
                      </div>

                      {reviewText && (
                        <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed italic">
                          &ldquo;{reviewText.trim()}&rdquo;
                        </p>
                      )}

                      {rev.photoUrl && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-border">
                          <img
                            src={resolveAssetUrl(rev.photoUrl)}
                            alt="Foto ulasan"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {reviews.length > 2 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewsModal(true)}
                  className="px-5 py-2.5 rounded-full border border-border bg-white hover:bg-surface text-foreground font-bold text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Lihat Semua {reviews.length} Ulasan Tamu</span>
                  <span className="text-foreground-muted">→</span>
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── 5. FOOTER KHAS EMBUN EXPLORE (SESUAI GAMBAR 2) ── */}
      <footer className="border-t border-border bg-surface py-8 px-4 sm:px-8 text-xs text-foreground-muted mt-auto relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-lg text-brand-blue tracking-tight">embun</span>
            <span>© 2026 PT Alam Kelana Digital. Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/kebijakan-privasi" className="hover:underline">
              Privasi
            </a>
            <a href="/syarat-ketentuan" className="hover:underline">
              Syarat & Ketentuan
            </a>
            <a href="/mitra" className="hover:underline">
              Mitra Camp
            </a>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-9 h-9 rounded-full bg-brand-lime text-black flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              title="Kembali ke atas"
              aria-label="Kembali ke atas"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </footer>

      {/* ── MODAL AUTH ── */}
      {isAuthOpen && (
        <GuestAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onSuccess={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
        />
      )}

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

      {/* ── MODAL SEMUA ULASAN TAMU ── */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Star size={18} className="fill-amber-500 text-amber-500" />
                <h3 className="font-bold text-base text-foreground">
                  Semua Ulasan Tamu ({reviews.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewsModal(false)}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto space-y-5 divide-y divide-border/60">
              {reviews.map((rev: any, idx: number) => {
                const displayName =
                  rev.maskedAuthorName ||
                  rev.authorName ||
                  rev.guestName ||
                  rev.userName ||
                  rev.user?.name ||
                  'Tamu Embun';
                const avatarChar = displayName.charAt(0).toUpperCase();
                const reviewText =
                  rev.message || rev.comment || rev.content || rev.review || '';

                return (
                  <div key={rev.id || idx} className="pt-4 first:pt-0 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
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
                          <span className="text-[10px] text-foreground-muted">
                            {rev.createdAt
                              ? new Date(rev.createdAt).toLocaleDateString('id-ID', {
                                  month: 'long',
                                  year: 'numeric',
                                })
                              : 'Pengunjung Terverifikasi'}
                            {(rev.spotName || rev.blockName) && ` · ${rev.spotName || rev.blockName}`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-surface px-2.5 py-1 rounded-full border border-border shrink-0">
                        <Star size={11} className="fill-amber-500" />
                        <span>{Number(rev.rating || 5).toFixed(1)}</span>
                      </div>
                    </div>

                    {reviewText && (
                      <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed italic">
                        &ldquo;{reviewText.trim()}&rdquo;
                      </p>
                    )}

                    {rev.photoUrl && (
                      <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border">
                        <img
                          src={resolveAssetUrl(rev.photoUrl)}
                          alt="Foto ulasan"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
