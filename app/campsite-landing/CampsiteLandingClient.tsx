'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Star,
  Users,
  Share2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Layers,
  Flame,
  Camera,
  Droplets,
  Maximize2,
  X,
  ArrowRight,
  Play,
  Info,
  RotateCw,
  Compass,
  Smartphone,
  Heart,
  Grid,
  Trees,
  CheckCircle2,
  Tent,
  Wifi,
  Bath,
  Zap,
  Car,
  MoonStar,
  Coffee,
  Waves,
  BriefcaseMedical,
  Store,
  Mountain,
} from 'lucide-react';

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
  description?: string;
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
  specificNotes?: string;
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
  city?: string;
  province?: string;
  latitude?: number | string;
  longitude?: number | string;
  description?: string;
  logoUrl?: string;
  mapImageUrl?: string;
  googleMapsUrl?: string;
  checkInTime?: string;
  checkOutTime?: string;
  rating?: number;
  reviewCount?: number;
  rules?: string;
  facilities?: Array<{ id: string; name: string; icon?: string }>;
  photos?: Array<{ id: string; url: string; category?: string }>;
  blocks: SpotItem[];
  youtube?: string | null;
}

interface ReviewItem {
  id: string;
  rating: number;
  message: string;
  createdAt: string;
  maskedAuthorName?: string;
  authorPhotoUrl?: string | null;
}

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
  return 'Rp ' + Math.round(num).toLocaleString('id-ID');
}

function extractYoutubeVideoId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getFacilityIcon(name: string, iconId?: string | null) {
  const n = (name + ' ' + (iconId || '')).toLowerCase();
  const cls = 'text-brand-blue shrink-0';
  if (n.includes('wifi') || n.includes('internet')) return <Wifi size={16} className={cls} />;
  if (n.includes('toilet') || n.includes('wc') || n.includes('mandi') || n.includes('shower'))
    return <Bath size={16} className={cls} />;
  if (n.includes('listrik') || n.includes('colokan') || n.includes('stopkontak'))
    return <Zap size={16} className={cls} />;
  if (n.includes('parkir') || n.includes('mobil') || n.includes('motor'))
    return <Car size={16} className={cls} />;
  if (n.includes('mushola') || n.includes('masjid') || n.includes('ibadah'))
    return <MoonStar size={16} className={cls} />;
  if (n.includes('kafe') || n.includes('cafe') || n.includes('kopi') || n.includes('minum'))
    return <Coffee size={16} className={cls} />;
  if (n.includes('sungai') || n.includes('danau') || n.includes('air') || n.includes('river'))
    return <Waves size={16} className={cls} />;
  if (n.includes('medis') || n.includes('p3k') || n.includes('obat'))
    return <BriefcaseMedical size={16} className={cls} />;
  if (n.includes('warung') || n.includes('toko') || n.includes('kantin'))
    return <Store size={16} className={cls} />;
  if (n.includes('api') || n.includes('unggun') || n.includes('bonfire'))
    return <Flame size={16} className={cls} />;
  if (n.includes('pemandangan') || n.includes('view') || n.includes('bukit') || n.includes('gunung'))
    return <Mountain size={16} className={cls} />;
  return <Trees size={16} className={cls} />;
}

function getSpotMainPhoto(spot: SpotItem): string {
  if (Array.isArray(spot.photos) && spot.photos.length > 0) {
    // 1. Kamar Utama / Tenda / Gambar Utama
    const utama = spot.photos.find((p) => {
      const cat = (p?.category || '').toLowerCase();
      return (
        cat.includes('utama') ||
        cat.includes('kamar') ||
        cat.includes('tenda') ||
        cat.includes('main') ||
        cat.includes('room')
      ) && !cat.includes('mandi') && !cat.includes('toilet');
    });
    if (utama?.url) return utama.url;

    // 2. Pemandangan / Tampak Luar
    const view = spot.photos.find((p) => {
      const cat = (p?.category || '').toLowerCase();
      return (
        cat.includes('luar') ||
        cat.includes('pemandangan') ||
        cat.includes('view') ||
        cat.includes('depan')
      ) && !cat.includes('mandi') && !cat.includes('toilet');
    });
    if (view?.url) return view.url;

    // 3. Foto selain toilet
    const nonToilet = spot.photos.find((p) => {
      const cat = (p?.category || '').toLowerCase();
      return !cat.includes('mandi') && !cat.includes('toilet') && !cat.includes('bathroom') && !cat.includes('wc');
    });
    if (nonToilet?.url) return nonToilet.url;

    if (spot.photos[0]?.url) return spot.photos[0].url;
  }

  if (Array.isArray(spot.images) && spot.images.length > 0) {
    const valid = spot.images.find((img) => img && typeof img === 'string');
    if (valid) return valid;
  }

  return '';
}

export function CampsiteLandingClient() {
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedSpotType, setSelectedSpotType] = useState<string>('Semua');
  const [show360Modal, setShow360Modal] = useState(false);
  const [active360Index, setActive360Index] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [showFullMapModal, setShowFullMapModal] = useState(false);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Panorama Pannellum ref
  const pannellumRef = useRef<any>(null);

  // 1. Resolve campsite token from URL or Query
  useEffect(() => {
    async function init() {
      try {
        let token = '';
        if (typeof window !== 'undefined') {
          const pathSegments = window.location.pathname.split('/').filter(Boolean);
          const campIdx = pathSegments.indexOf('campsite');
          if (campIdx !== -1 && pathSegments[campIdx + 1]) {
            token = pathSegments[campIdx + 1];
          } else {
            const urlParams = new URLSearchParams(window.location.search);
            token = urlParams.get('id') || urlParams.get('slug') || urlParams.get('token') || '';
          }
        }

        const resolvedToken = (token || '').trim();
        if (!resolvedToken) {
          setErrorMsg('Kawasan campsite tidak ditemukan.');
          setLoading(false);
          return;
        }

        // Fetch authoritative campsite data
        const res = await fetch(
          `https://api-staging.embun.app/api/public/campsites/resolve-spot?token=${encodeURIComponent(
            resolvedToken,
          )}`,
        );

        if (!res.ok) {
          // Fallback direct campsite lookup
          const fallbackRes = await fetch(
            `https://api-staging.embun.app/api/public/campsites/${encodeURIComponent(resolvedToken)}`,
          );
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            setCampsite(fbData);
            setLoading(false);
            return;
          }
          throw new Error('Gagal memuat profil kawasan');
        }

        const data = await res.json();
        const camp: CampsiteDetail = data.campsite || data;
        setCampsite(camp);

        // Fetch reviews
        if (camp.id) {
          fetchReviews(camp.id);
        }
      } catch (err: any) {
        console.error('Error fetching campsite landing:', err);
        setErrorMsg('Kawasan campsite belum tersedia atau tautan tidak valid.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchReviews(campsiteId: string) {
      try {
        setReviewsLoading(true);
        const res = await fetch(
          `https://api-staging.embun.app/api/public/reviews/campsite/${encodeURIComponent(campsiteId)}?limit=6`,
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.items)) {
            setReviews(data.items);
          } else if (Array.isArray(data)) {
            setReviews(data);
          }
        }
      } catch (e) {
        console.warn('Could not load reviews:', e);
      } finally {
        setReviewsLoading(false);
      }
    }

    init();
  }, []);

  // Cover Image
  const coverImage = useMemo(() => {
    if (!campsite) return '';
    if ((campsite as any).coverImageUrl) return (campsite as any).coverImageUrl;
    if ((campsite as any).mainImage) return (campsite as any).mainImage;
    if (Array.isArray(campsite.photos) && campsite.photos.length > 0) {
      const cover = campsite.photos.find(
        (p) =>
          p?.url &&
          (p.category?.toLowerCase() === 'home' ||
            p.category?.toLowerCase() === 'cover' ||
            p.category?.toLowerCase() === 'main' ||
            p.category?.toLowerCase().includes('view')),
      );
      if (cover?.url) return cover.url;
      const valid = campsite.photos.find((p) => p?.url);
      if (valid?.url) return valid.url;
    }
    const firstBlockPhoto = campsite.blocks?.[0]?.photos?.[0]?.url || campsite.blocks?.[0]?.images?.[0];
    if (firstBlockPhoto) return firstBlockPhoto;
    return campsite.mapImageUrl || '';
  }, [campsite]);

  // Extract all 360 Panoramas in this campsite
  const panoramaList = useMemo(() => {
    const list: PanoramaItem[] = [];
    const addedUrls = new Set<string>();

    if (!campsite) return list;

    // 1. Check campsite.panoramaSpots
    if (Array.isArray((campsite as any).panoramaSpots)) {
      (campsite as any).panoramaSpots.forEach((p: any) => {
        const url = p?.imageUrl || p?.url;
        if (url && !addedUrls.has(url)) {
          addedUrls.add(url);
          list.push({
            id: p.id || String(Math.random()),
            label: p.label || p.description || 'Tur 360° Kawasan',
            imageUrl: url,
          });
        }
      });
    }

    // 2. Check blocks
    if (Array.isArray(campsite.blocks)) {
      campsite.blocks.forEach((b: any) => {
        if (Array.isArray(b.panoramaPhotos)) {
          b.panoramaPhotos.forEach((p: any) => {
            const url = p?.imageUrl || p?.url;
            if (url && !addedUrls.has(url)) {
              addedUrls.add(url);
              list.push({
                id: p.id || String(Math.random()),
                label: p.label || `${b.name} (360°)`,
                imageUrl: url,
              });
            }
          });
        }
      });
    }

    // 3. Check campsite photos
    if (Array.isArray(campsite.photos)) {
      campsite.photos.forEach((p) => {
        if (
          p.category?.toLowerCase().includes('360') ||
          p.category?.toLowerCase().includes('panorama')
        ) {
          if (p.url && !addedUrls.has(p.url)) {
            addedUrls.add(p.url);
            list.push({
              id: p.id,
              label: 'Tur 360° Area Camp',
              imageUrl: p.url,
            });
          }
        }
      });
    }

    return list;
  }, [campsite]);

  // Extract all spots
  const allSpots = useMemo(() => {
    if (!campsite || !Array.isArray(campsite.blocks)) return [];
    return campsite.blocks.filter((b) => b && b.name);
  }, [campsite]);

  // Spot types with intelligent 360 tour option
  const availableSpotTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('Semua');

    allSpots.forEach((b) => {
      if (b.tentType && typeof b.tentType === 'string' && b.tentType.trim()) {
        types.add(b.tentType.trim());
      }
    });

    if (panoramaList.length > 0) {
      types.add('Tur 360°');
    }

    return Array.from(types);
  }, [allSpots, panoramaList]);

  // Filtered spots
  const filteredSpots = useMemo(() => {
    if (selectedSpotType === 'Semua') {
      return allSpots;
    }
    if (selectedSpotType === 'Tur 360°') {
      return allSpots.filter(
        (b) => Array.isArray(b.panoramaPhotos) && b.panoramaPhotos.length > 0,
      );
    }
    return allSpots.filter((b) => b.tentType === selectedSpotType);
  }, [allSpots, selectedSpotType]);

  // Minimum starting price
  const startingPrice = useMemo(() => {
    if (allSpots.length === 0) return 0;
    let min = Infinity;
    allSpots.forEach((b) => {
      const price = b.pricingPackages?.[0]?.flatRate || b.weekdayPrice || 0;
      if (price > 0 && price < min) {
        min = price;
      }
    });
    return min === Infinity ? 0 : min;
  }, [allSpots]);

  // Youtube Video ID
  const youtubeVideoId = useMemo(() => {
    return extractYoutubeVideoId(campsite?.youtube);
  }, [campsite?.youtube]);

  // Share handler
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = `${campsite?.name || 'Campsite'} — Embun`;
    const shareText = `Jelajahi seluruh pilihan spot camping & glamping di ${campsite?.name} lewat aplikasi Embun!`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          console.warn('Share sheet cancelled or failed:', e);
        } else {
          return;
        }
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch (e) {
        console.warn('Clipboard write failed:', e);
      }
    }
  };

  // Open App Deep Link
  const handleOpenApp = () => {
    if (!campsite) return;
    const token = campsite.slug || campsite.id;
    const deepLink = `embun://campsite/${encodeURIComponent(token)}`;
    const isAndroid = /android/i.test(navigator.userAgent || '');
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent || '');

    const fallbackUrl = isAndroid
      ? 'https://play.google.com/store/apps/details?id=app.embun'
      : isIOS
      ? 'https://apps.apple.com/app/embun'
      : 'https://embun.app';

    const start = Date.now();
    window.location.href = deepLink;

    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.location.href = fallbackUrl;
      }
    }, 1000);
  };

  // Initialize Pannellum Viewer when modal opens
  useEffect(() => {
    if (!show360Modal || panoramaList.length === 0) return;

    let destroyed = false;

    function initViewer() {
      if (destroyed) return;
      const pannellum = (window as any).pannellum;
      if (!pannellum) return;

      const container = document.getElementById('campsite-panorama-box');
      if (!container) return;

      if (pannellumRef.current && typeof pannellumRef.current.destroy === 'function') {
        try {
          pannellumRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }

      const cur = panoramaList[active360Index] || panoramaList[0];
      const directUrl = resolveAssetUrl(cur.imageUrl);

      try {
        pannellumRef.current = pannellum.viewer('campsite-panorama-box', {
          type: 'equirectangular',
          panorama: directUrl,
          autoLoad: true,
          autoRotate: -1.5,
          compass: true,
          showZoomCtrl: true,
          showFullscreenCtrl: false,
          mouseZoom: true,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
        });
      } catch (e) {
        console.error('Failed to init pannellum:', e);
      }
    }

    if (!(window as any).pannellum) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
      script.onload = () => initViewer();
      document.body.appendChild(script);
    } else {
      setTimeout(initViewer, 150);
    }

    return () => {
      destroyed = true;
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
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* ── MOBILE SMART APP BANNER ── */}
      <div className="md:hidden bg-brand-blue text-white px-4 py-2.5 flex items-center justify-between text-xs shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone size={16} className="text-white" />
          </div>
          <div className="truncate">
            <span className="font-bold">Buka di Aplikasi Embun</span>
            <span className="block text-[10px] text-white/80">Pemesanan lebih mudah & instan</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleOpenApp}
          className="px-3 py-1.5 rounded-lg bg-brand-lime text-black font-bold text-[11px] shrink-0 ml-2 shadow-xs cursor-pointer active:scale-95 transition-transform"
        >
          Buka App
        </button>
      </div>

      {/* ── TOP NAVBAR ── */}
      <header className="sticky top-0 md:top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/explore" className="flex items-center gap-2 group">
              <span className="font-black text-xl tracking-tight text-foreground group-hover:text-brand-blue transition-colors">
                embun
              </span>
            </a>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-foreground-muted truncate max-w-xs">
              <MapPin size={12} className="text-brand-blue shrink-0" />
              <span className="font-semibold text-foreground truncate">{campsite.name}</span>
              <span>·</span>
              <span>{campsite.city || 'Indonesia'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-surface border border-border transition-all cursor-pointer"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">{isCopied ? 'Tersalin!' : 'Bagikan'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-blue text-white shadow-xs hover:bg-brand-blue/90 transition-all cursor-pointer"
            >
              <Smartphone size={14} />
              <span>Buka di App</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER PROPERTI ── */}
      <section className="relative bg-surface border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {/* Cover image */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full rounded-3xl overflow-hidden shadow-lg bg-black border border-border">
            {coverImage ? (
              <img
                src={resolveAssetUrl(coverImage)}
                alt={campsite.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-blue/10 text-brand-blue font-bold text-lg">
                {campsite.name}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Quick badges on top */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-brand-lime text-black shadow-xs">
                Destinasi Resmi
              </span>
              {panoramaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShow360Modal(true)}
                  className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/90 backdrop-blur-md text-foreground flex items-center gap-1.5 shadow-xs hover:bg-white transition-all cursor-pointer"
                >
                  <Compass size={13} className="text-brand-blue" />
                  <span>Tur 360° Tersedia</span>
                </button>
              )}
            </div>

            {/* Campsite details over banner */}
            <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-white/85">
                  <MapPin size={13} className="text-brand-lime shrink-0" />
                  <span>
                    {campsite.address
                      ? `${campsite.address}, ${campsite.city || ''}`
                      : `${campsite.city || 'Jawa Barat'}, Indonesia`}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {campsite.name}
                </h1>
                {campsite.rating && Number(campsite.rating) > 0 && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-xs font-bold">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span>{Number(campsite.rating).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-white/80 font-medium">
                      ({campsite.reviewCount || 0} ulasan terverifikasi)
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="#katalog-spot"
                  className="px-5 py-2.5 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-black font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <span>Pilih Spot Camping</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick summary strip below cover */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="p-3.5 rounded-2xl bg-white border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                <Tent size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-foreground-muted font-medium">Pilihan Unit</span>
                <span className="block font-bold text-sm text-foreground truncate">
                  {allSpots.length} Unit Spot
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Flame size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-foreground-muted font-medium">Mulai Dari</span>
                <span className="block font-bold text-sm text-foreground truncate">
                  {startingPrice > 0 ? `${rupiah(startingPrice)}/mlm` : 'Hubungi Camp'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-foreground-muted font-medium">Check-In / Out</span>
                <span className="block font-bold text-sm text-foreground truncate">
                  {campsite.checkInTime || '14:00'} - {campsite.checkOutTime || '12:00'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] text-foreground-muted font-medium">Pemesanan</span>
                <span className="block font-bold text-sm text-foreground truncate">
                  Konfirmasi Instan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* 1. TENTANG KAWASAN */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-brand-blue">
            <Trees size={18} />
            <h2 className="font-extrabold text-lg sm:text-xl text-foreground">
              Tentang Kawasan {campsite.name}
            </h2>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-border shadow-xs leading-relaxed text-sm text-foreground/85 whitespace-pre-line">
            {campsite.description ||
              `${campsite.name} merupakan destinasi camping dan glamping pilihan di ${
                campsite.city || 'Jawa Barat'
              } dengan suasana asri, udara sejuk, dan fasilitas lengkap untuk liburan keluarga maupun komunitas Anda.`}
          </div>
        </section>

        {/* 2. FASILITAS UTAMA PROPERTI */}
        {Array.isArray(campsite.facilities) && campsite.facilities.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-extrabold text-lg sm:text-xl text-foreground">
              Fasilitas Utama Kawasan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs sm:text-sm text-foreground">
              {campsite.facilities.map((fac: any, idx: number) => {
                const facName = typeof fac === 'string' ? fac : fac.name || 'Fasilitas';
                const facIcon = typeof fac === 'object' ? fac.icon : null;
                return (
                  <div
                    key={fac.id || idx}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-border/80 shadow-2xs"
                  >
                    {getFacilityIcon(facName, facIcon || fac.id)}
                    <span className="font-semibold truncate">{facName}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. VIDEO SUASANA KAWASAN (YOUTUBE) */}
        {youtubeVideoId && (
          <section className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                <Play size={15} className="fill-white ml-0.5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl text-foreground">
                  Video Suasana Kawasan
                </h2>
                <p className="text-xs text-foreground-muted">
                  Tonton keindahan alam, suasana malam, dan aktivitas di {campsite.name}
                </p>
              </div>
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

        {/* 4. KATALOG SEMUA SPOT DI KAWASAN (THE CORE HERO CATALOG) */}
        <section id="katalog-spot" className="space-y-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-border">
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

          {/* Grid Kartu Spot */}
          {filteredSpots.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-border space-y-2">
              <Tent size={36} className="mx-auto text-foreground-muted/60" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredSpots.map((spot) => {
                const spotCover = getSpotMainPhoto(spot);
                const spotPrice = spot.pricingPackages?.[0]?.flatRate || spot.weekdayPrice || 0;
                const has360 = Array.isArray(spot.panoramaPhotos) && spot.panoramaPhotos.length > 0;
                const spotDetailUrl = `/spot/${spot.shareCode || spot.id}`;

                return (
                  <div
                    key={spot.id}
                    className="group p-4 rounded-3xl border border-border bg-white hover:border-brand-blue/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Photo cover */}
                      <a
                        href={spotDetailUrl}
                        className="block relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-surface cursor-pointer"
                      >
                        {spotCover ? (
                          <img
                            src={resolveAssetUrl(spotCover)}
                            alt={spot.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground-muted bg-surface/80">
                            <Tent size={32} />
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          {spot.tentType && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-foreground shadow-2xs">
                              {spot.tentType}
                            </span>
                          )}
                          {has360 && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-lime text-black flex items-center gap-1 shadow-2xs">
                              <Compass size={10} />
                              360°
                            </span>
                          )}
                        </div>
                      </a>

                      {/* Spot Title & Specs */}
                      <div>
                        <a href={spotDetailUrl} className="block">
                          <h3 className="font-extrabold text-base text-foreground group-hover:text-brand-blue transition-colors truncate">
                            {spot.name}
                          </h3>
                        </a>

                        <div className="flex items-center gap-3 text-xs text-foreground-muted mt-1.5">
                          <div className="flex items-center gap-1">
                            <Users size={13} className="text-brand-blue" />
                            <span>{spot.baseCapacity}-{spot.maxCapacity} Tamu</span>
                          </div>
                          {spot.roomSize && (
                            <div className="flex items-center gap-1">
                              <Layers size={13} />
                              <span>{spot.roomSize}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price & CTA Button */}
                    <div className="pt-3 mt-3 border-t border-border/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-foreground-muted block">Mulai dari</span>
                        {Number(spotPrice) > 0 ? (
                          <span className="font-black text-sm text-foreground">
                            {rupiah(Number(spotPrice))}
                            <span className="text-[10px] font-normal text-foreground-muted">/mlm</span>
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-brand-blue">Hubungi Camp</span>
                        )}
                      </div>

                      <a
                        href={spotDetailUrl}
                        className="px-4 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 group-hover:translate-x-0.5 cursor-pointer"
                      >
                        <span>Lihat & Pesan</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 5. DENAH KAWASAN / SITE MAP */}
        {campsite.mapImageUrl && (
          <section className="space-y-3">
            <h2 className="font-extrabold text-lg sm:text-xl text-foreground">
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

        {/* 6. ATURAN & KEBIJAKAN MENGINAP */}
        <section className="space-y-3">
          <h2 className="font-extrabold text-lg sm:text-xl text-foreground">
            Aturan & Kebijakan Kawasan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-foreground-muted leading-relaxed">
            <div className="p-5 rounded-3xl bg-white border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Clock size={16} className="text-brand-blue" />
                <span>Waktu Menginap</span>
              </h3>
              <p>Check-in: Mulai pukul {campsite.checkInTime || '14:00'} WIB</p>
              <p>Check-out: Maksimal pukul {campsite.checkOutTime || '12:00'} WIB</p>
              <p className="text-[11px] text-foreground-muted/80 pt-1">
                Keterlambatan check-out dapat dikenakan biaya tambahan sesuai kebijakan campsite.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-border space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Tata Tertib Menginap</span>
              </h3>
              <p>
                {campsite.rules ||
                  'Menjaga kebersihan area camping, membuang sampah pada tempat yang disediakan, menjaga ketenangan di jam istirahat malam (pukul 22:00 - 06:00), dan mematuhi instruksi pengelola.'}
              </p>
            </div>
          </div>
        </section>

        {/* 7. ULASAN TAMU */}
        {reviews.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl text-foreground">
                  Ulasan Tamu di {campsite.name}
                </h2>
                <p className="text-xs text-foreground-muted">
                  Pengalaman nyata dari pengunjung terverifikasi
                </p>
              </div>
              {campsite.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/60 font-bold text-xs">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span>{Number(campsite.rating).toFixed(1)} / 5.0</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white border border-border space-y-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue font-bold flex items-center justify-center text-[10px]">
                        {(rev.maskedAuthorName || 'Tamu')[0]}
                      </div>
                      <span className="font-bold text-foreground">
                        {rev.maskedAuthorName || 'Tamu Embun'}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed italic">
                    &ldquo;{rev.message}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. FOOTER BANNER CTA */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-brand-blue to-blue-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-lime text-black inline-block">
              Aplikasi Booking Camping #1
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Liburan Lebih Menyenangkan di Aplikasi Embun
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Dapatkan promo eksklusif, tur 360°, chat langsung dengan mitra campsite, dan kemudahan check-in tanpa ribet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenApp}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-lime hover:bg-brand-lime/90 text-black font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Smartphone size={16} />
              <span>Buka di Aplikasi Embun</span>
            </button>
            <a
              href="/explore"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all text-center"
            >
              Cari Destinasi Lain
            </a>
          </div>
        </section>
      </main>

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
