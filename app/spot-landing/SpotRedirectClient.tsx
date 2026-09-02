'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
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
  ChevronDown,
  Calendar,
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
  Info,
  RotateCw,
  Compass,
  Smartphone,
  Minus,
  Plus,
  Heart,
  Grid,
  Trees,
  CheckCircle2,
  Lock,
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
import {
  getStoredGuestProfile,
  getGuestToken,
  clearGuestSession,
  createRealOrder,
  initiateOrderPayment,
  syncOrderStatus,
  initiateXenditPayment,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';
import { BookingCalendarModal } from '@/components/explore/BookingCalendarModal';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { BookingTicketModal } from '@/components/explore/BookingTicketModal';

const APP_STORE_HREF = 'https://apps.apple.com/app/embun';
const GOOGLE_PLAY_HREF =
  'https://play.google.com/store/apps/details?id=app.embun';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.embun.app/api';

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
  perGuestRate?: number | string;
  minGuestCount?: number;
  maxOccupancy?: number;
  baseCapacity?: number;
  extraPersonFee?: number;
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
  knowledgeBase?: any;
  facilities?: Array<{ id: string; name: string; icon?: string }>;
  photos?: Array<{ id: string; url: string; category?: string }>;
  addons?: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    unit?: string;
  }>;
  blocks: SpotItem[];
}

interface ReviewItem {
  id: string;
  rating: number;
  message: string;
  createdAt: string;
  maskedAuthorName?: string;
  authorPhotoUrl?: string | null;
  photoUrl?: string | null;
}

interface ReviewAggregate {
  ratingAvg: number;
  ratingCount: number;
  ratingBreakdown?: Record<string, number>;
}

function resolveTokenFromPath(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 2 && parts[0] === 'spot') {
    return parts[1];
  }
  return null;
}

function getFacilityIcon(name?: string, id?: string) {
  const lower = (name || id || '').toLowerCase();
  const iconClass = 'text-foreground shrink-0';
  if (lower.includes('wifi') || lower.includes('sinyal'))
    return <Wifi size={16} className={iconClass} />;
  if (
    lower.includes('toilet') ||
    lower.includes('kamar mandi') ||
    lower.includes('bath') ||
    lower.includes('cuci')
  )
    return <Bath size={16} className={iconClass} />;
  if (
    lower.includes('water heater') ||
    lower.includes('pemanas') ||
    lower.includes('air')
  )
    return <Droplets size={16} className={iconClass} />;
  if (
    lower.includes('listrik') ||
    lower.includes('colokan') ||
    lower.includes('power') ||
    lower.includes('zap')
  )
    return <Zap size={16} className={iconClass} />;
  if (
    lower.includes('api') ||
    lower.includes('bonfire') ||
    lower.includes('bbq') ||
    lower.includes('flame')
  )
    return <Flame size={16} className={iconClass} />;
  if (
    lower.includes('parkir') ||
    lower.includes('car') ||
    lower.includes('parking')
  )
    return <Car size={16} className={iconClass} />;
  if (
    lower.includes('mushola') ||
    lower.includes('prayer') ||
    lower.includes('moon')
  )
    return <MoonStar size={16} className={iconClass} />;
  if (
    lower.includes('cafe') ||
    lower.includes('resto') ||
    lower.includes('coffee')
  )
    return <Coffee size={16} className={iconClass} />;
  if (
    lower.includes('kolam') ||
    lower.includes('pool') ||
    lower.includes('danau') ||
    lower.includes('sungai') ||
    lower.includes('waves')
  )
    return <Waves size={16} className={iconClass} />;
  if (
    lower.includes('keamanan') ||
    lower.includes('security') ||
    lower.includes('pos')
  )
    return <ShieldCheck size={16} className={iconClass} />;
  if (
    lower.includes('p3k') ||
    lower.includes('first aid') ||
    lower.includes('medis')
  )
    return <BriefcaseMedical size={16} className={iconClass} />;
  if (
    lower.includes('warung') ||
    lower.includes('toko') ||
    lower.includes('store')
  )
    return <Store size={16} className={iconClass} />;
  if (lower.includes('gunung') || lower.includes('bukit'))
    return <Mountain size={16} className={iconClass} />;
  if (
    lower.includes('hutan') ||
    lower.includes('pohon') ||
    lower.includes('rumput')
  )
    return <Trees size={16} className={iconClass} />;
  if (
    lower.includes('tenda') ||
    lower.includes('tent') ||
    lower.includes('ground')
  )
    return <Tent size={16} className={iconClass} />;
  return <CheckCircle2 size={16} className={iconClass} />;
}

function parseHtmlRules(htmlString?: string) {
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

// Dynamic Pannellum Loader for 360 viewer
let pannellumPromise: Promise<any> | null = null;
function loadPannellum(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).pannellum)
    return Promise.resolve((window as any).pannellum);
  if (pannellumPromise) return pannellumPromise;

  pannellumPromise = new Promise((resolve) => {
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
  });
  return pannellumPromise;
}

export function SpotRedirectClient() {
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [activeSpot, setActiveSpot] = useState<SpotItem | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [platformFee, setPlatformFee] = useState({
    adminFeeFlat: 4000,
    serviceFeeFlat: 2000,
    taxPct: 12,
  });

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/platform-fee`);
        if (res.ok) {
          const data = await res.json();
          setPlatformFee({
            adminFeeFlat: Number(data.adminFeeFlat ?? 4000),
            serviceFeeFlat: Number(data.serviceFeeFlat ?? 2000),
            taxPct: Number(data.taxPct ?? 12),
          });
        }
      } catch (e) {
        // Fallback to standard platform fee
      }
    };
    void fetchFee();
  }, []);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewAggregate, setReviewAggregate] =
    useState<ReviewAggregate | null>(null);

  // Gallery & 360 Lightbox state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<'photos' | '360' | 'map'>(
    'photos',
  );
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activePanoramaIdx, setActivePanoramaIdx] = useState(0);

  // Share & Favorite state
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Date selection
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddonsExpanded, setIsAddonsExpanded] = useState(false);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [paymentScheme, setPaymentScheme] = useState<'DP_50' | 'FULL'>('DP_50');
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>(
    {},
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [completedOrderData, setCompletedOrderData] = useState<any | null>(
    null,
  );
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isTour360Only, setIsTour360Only] = useState(false);

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const panoramaContainerRef = useRef<HTMLDivElement | null>(null);
  const pannellumViewerRef = useRef<any>(null);

  // 1. Initial Load & Fetch Data
  useEffect(() => {
    setCurrentUser(getStoredGuestProfile());

    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const is360Requested =
        sp.get('view360') === 'true' ||
        sp.get('tour360') === 'true' ||
        sp.get('tab') === '360';
      if (is360Requested) {
        setIsTour360Only(true);
        setIsGalleryOpen(true);
        setGalleryTab('360');
      }
    }

    const rawPath = window.location.pathname;
    const resolvedToken = resolveTokenFromPath(rawPath);

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
          // Fallback to active campsites
          const listRes = await fetch(`${API_BASE_URL}/public/campsites`);
          if (listRes.ok) {
            const list = await listRes.json();
            if (Array.isArray(list) && list.length > 0) {
              const fallbackCamp = list[0];
              setCampsite(fallbackCamp);
              const firstSpot = fallbackCamp.blocks?.[0] || null;
              setActiveSpot(firstSpot);
              if (firstSpot) {
                document.title = `${firstSpot.name} · ${fallbackCamp.name} | Embun`;
                setSelectedPackageId(
                  firstSpot.pricingPackages?.[0]?.id || null,
                );
              }
              // Fetch reviews for fallback camp
              fetchReviews(fallbackCamp.id);
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
        if (matched) {
          setSelectedPackageId(matched.pricingPackages?.[0]?.id || null);
        }
        if (matched && camp) {
          document.title = `${matched.name} · ${camp.name} | Embun`;
        }

        if (camp?.id) {
          fetchReviews(camp.id);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat rincian properti.');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async (campId: string) => {
      try {
        const [aggRes, revRes] = await Promise.all([
          fetch(`${API_BASE_URL}/public/reviews/campsite/${campId}/aggregate`),
          fetch(`${API_BASE_URL}/public/reviews/campsite/${campId}?limit=6`),
        ]);
        if (aggRes.ok) {
          const agg = await aggRes.json();
          setReviewAggregate(agg);
        }
        if (revRes.ok) {
          const rev = await revRes.json();
          setReviews(rev.items || []);
        }
      } catch (e) {
        console.error('Error loading reviews:', e);
      }
    };

    void fetchData();
  }, []);

  // Selected Pricing Package
  const selectedPackage = useMemo(() => {
    if (!activeSpot?.pricingPackages || activeSpot.pricingPackages.length === 0)
      return null;
    return (
      activeSpot.pricingPackages.find((p) => p.id === selectedPackageId) ||
      activeSpot.pricingPackages[0]
    );
  }, [activeSpot, selectedPackageId]);

  // Max capacity based on selected package
  const effectiveMaxCapacity = useMemo(() => {
    return (
      selectedPackage?.maxOccupancy ||
      selectedPackage?.baseCapacity ||
      activeSpot?.maxCapacity ||
      10
    );
  }, [selectedPackage, activeSpot]);

  // Sync check-in & check-out cross-validation
  const nights = useMemo(() => {
    try {
      const inD = new Date(checkInDate);
      const outD = new Date(checkOutDate);
      const diffTime = outD.getTime() - inD.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }, [checkInDate, checkOutDate]);

  // Sort and extract photos (deduplicated, prioritizing spot photos then campsite photos)
  const spotPhotos = useMemo(() => {
    if (!activeSpot && !campsite) return [];
    const list: PhotoItem[] = [];
    const seenUrls = new Set<string>();

    const addPhoto = (url?: string, category?: string) => {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim();
      if (!cleanUrl || seenUrls.has(cleanUrl)) return;
      seenUrls.add(cleanUrl);
      list.push({ url: cleanUrl, category });
    };

    // 1. Add spot's own photos
    if (activeSpot && Array.isArray(activeSpot.photos) && activeSpot.photos.length > 0) {
      activeSpot.photos.forEach((p) => {
        addPhoto(p?.url, p?.category);
      });
    }

    // 2. Add spot's images array
    if (activeSpot && Array.isArray(activeSpot.images)) {
      activeSpot.images.forEach((img) => {
        addPhoto(img, 'Foto Unit');
      });
    }

    // 3. Supplement with campsite general photos
    if (Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
        addPhoto(p?.url, p?.category || 'Area Campsite');
      });
    }

    // 4. Supplement with campsite cover / main image
    if ((campsite as any)?.coverImageUrl) {
      addPhoto((campsite as any).coverImageUrl, 'Pemandangan Utama');
    }
    if ((campsite as any)?.mainImage) {
      addPhoto((campsite as any).mainImage, 'Pemandangan Utama');
    }

    const priorities = [
      'Tampak Luar / Pemandangan',
      'Kamar Utama / Tenda',
      'Ruang Santai / Balkon',
      'Pemandangan Utama',
      'Area Campsite',
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

  // Primary cover photo of campsite property
  const campsiteCoverPhoto = useMemo(() => {
    if ((campsite as any)?.coverImageUrl) return (campsite as any).coverImageUrl;
    if ((campsite as any)?.mainImage) return (campsite as any).mainImage;
    if (Array.isArray(campsite?.photos) && campsite.photos.length > 0) {
      const cover = campsite.photos.find(
        (p) =>
          p?.url &&
          (p.category?.toLowerCase() === 'home' ||
            p.category?.toLowerCase() === 'cover' ||
            p.category?.toLowerCase() === 'main' ||
            p.category?.toLowerCase().includes('view') ||
            p.category?.toLowerCase().includes('pemandangan')),
      );
      if (cover?.url) return cover.url;
      const valid = campsite.photos.find((p) => p?.url);
      if (valid?.url) return valid.url;
    }
    if (Array.isArray(spotPhotos) && spotPhotos.length > 0) {
      return spotPhotos[0]?.url;
    }
    return campsite?.mapImageUrl || '';
  }, [campsite, spotPhotos]);

  // Extract 360 Panoramas
  const panoramaList = useMemo(() => {
    const list: PanoramaItem[] = [];
    const addedUrls = new Set<string>();

    // 1. Check activeSpot.panoramaPhotos
    if (activeSpot && Array.isArray(activeSpot.panoramaPhotos)) {
      activeSpot.panoramaPhotos.forEach((p: any) => {
        const url = p?.imageUrl || p?.url;
        if (url && !addedUrls.has(url)) {
          addedUrls.add(url);
          list.push({
            id: p.id || String(Math.random()),
            label: p.label || p.category || `${activeSpot.name} (360°)`,
            imageUrl: url,
            category: p.category,
          });
        }
      });
    }

    // 2. Check campsite.panoramaSpots
    if (Array.isArray((campsite as any)?.panoramaSpots)) {
      (campsite as any).panoramaSpots.forEach((p: any) => {
        const url = p?.imageUrl || p?.url;
        if (url && !addedUrls.has(url)) {
          addedUrls.add(url);
          list.push({
            id: p.id || String(Math.random()),
            label: p.label || p.description || 'Tur 360° Kawasan',
            imageUrl: url,
            category: 'panorama_campsite',
          });
        }
      });
    }

    // 3. Check all other spots in campsite for 360 photos
    if (Array.isArray(campsite?.blocks)) {
      campsite?.blocks.forEach((b: any) => {
        if (Array.isArray(b.panoramaPhotos)) {
          b.panoramaPhotos.forEach((p: any) => {
            const url = p?.imageUrl || p?.url;
            if (url && !addedUrls.has(url)) {
              addedUrls.add(url);
              list.push({
                id: p.id || String(Math.random()),
                label: p.label || `${b.name} (360°)`,
                imageUrl: url,
                category: p.category,
              });
            }
          });
        }
      });
    }

    // 4. Check campsite.photos for 360/panorama category
    if (Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
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
              category: p.category,
            });
          }
        }
      });
    }

    return list;
  }, [activeSpot, campsite]);

  // Init 360 Pannellum in modal
  useEffect(() => {
    if (!isGalleryOpen || galleryTab !== '360' || panoramaList.length === 0)
      return;

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
  }, [isGalleryOpen, galleryTab, activePanoramaIdx, panoramaList]);

  // Available addons
  const availableAddons = useMemo(() => {
    if (Array.isArray(campsite?.addons) && campsite.addons.length > 0) {
      return campsite.addons;
    }
    return [
      {
        id: 'addon_tent',
        name: 'Extra Dome Tent (Kapasitas 4 Org)',
        price: 100000,
      },
      { id: 'addon_sb', name: 'Sleeping Bag Tambahan', price: 30000 },
      { id: 'addon_mat', name: 'Kasur Angin Ekstra + Pompa', price: 50000 },
      { id: 'addon_bbq', name: 'Paket BBQ Grill & Arang', price: 75000 },
      {
        id: 'addon_wood',
        name: 'Kayu Bakar Api Unggun (1 Ikat)',
        price: 35000,
      },
      {
        id: 'addon_food',
        name: 'Sarapan Pagi Nasi Liwet Tradisional',
        price: 25000,
      },
    ];
  }, [campsite]);

  // Tent Package & Kavling Count Detection
  const isTentPackage = useMemo(() => {
    if (!selectedPackage) return false;
    const model = (selectedPackage.pricingModel || '').toUpperCase();
    const name = (selectedPackage.name || '').toLowerCase();
    return (
      model === 'FIXED_CAPACITY_PACKAGE' ||
      Boolean((selectedPackage as any).tentPackageAddonId) ||
      name.includes('tenda') ||
      name.includes('tent') ||
      name.includes('elcipta') ||
      name.includes('villager') ||
      name.includes('paket tenda')
    );
  }, [selectedPackage]);

  const kavlingCount = useMemo(() => {
    if (!activeSpot) return 1;
    return activeSpot.pitchStock && activeSpot.pitchStock > 0
      ? activeSpot.pitchStock
      : 1;
  }, [activeSpot]);

  // Helper to check if an addon is a Tent
  const isTentAddon = (addon: any) => {
    if (!addon) return false;
    const cat = (addon.category || '').toUpperCase();
    if (cat === 'TENT' || cat === 'TENT_UNIT' || cat === 'TENDA') return true;
    if (
      activeSpot?.pricingPackages?.some(
        (p: any) => p.tentPackageAddonId === addon.id,
      )
    )
      return true;
    const name = (addon.name || '').toLowerCase();
    const id = (addon.id || '').toLowerCase();
    const tentKeywords = [
      'tenda',
      'tent',
      'elcipta',
      'villager',
      'dome',
      'safari',
      'glamping',
      'arpenaz',
      'quechua',
      'naturehike',
      'charlie',
      'borneo',
      'kavling',
    ];
    return tentKeywords.some((kw) => name.includes(kw) || id.includes(kw));
  };

  // Total Tents currently selected across all tent addons combined
  const totalTentsSelected = useMemo(() => {
    return availableAddons.reduce((sum, a) => {
      if (isTentAddon(a)) {
        return sum + (selectedAddons[a.id] || 0);
      }
      return sum;
    }, 0);
  }, [availableAddons, selectedAddons, activeSpot]);

  // Clear tent addons if tent package is selected
  useEffect(() => {
    if (isTentPackage) {
      setSelectedAddons((prev) => {
        const next = { ...prev };
        let changed = false;
        availableAddons.forEach((a) => {
          if (isTentAddon(a) && next[a.id]) {
            delete next[a.id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [isTentPackage, availableAddons, activeSpot]);

  // Pricing calculations driven by selectedPackage
  const spotPricePerNight = useMemo(() => {
    if (selectedPackage) {
      if (
        selectedPackage.flatRateMode &&
        selectedPackage.flatRate != null &&
        selectedPackage.flatRate !== ''
      ) {
        return Number(selectedPackage.flatRate);
      }
      if (
        selectedPackage.weekdayRate != null &&
        selectedPackage.weekdayRate !== ''
      ) {
        return Number(selectedPackage.weekdayRate);
      }
    }
    if (!activeSpot) return 0;
    return activeSpot.weekdayPrice || 0;
  }, [selectedPackage, activeSpot]);

  // Helper to check if an addon is charged per night
  const isAddonPerNight = (addon: any) => {
    if (!addon) return false;
    if (
      addon.perNight === true ||
      addon.perNight === 'true' ||
      addon.perNight === 1
    )
      return true;
    if (addon.unit && addon.unit.toLowerCase().includes('malam')) return true;
    if (isTentAddon(addon)) return true;
    const cat = (addon.category || '').toUpperCase();
    if (cat === 'TENT' || cat === 'TENT_UNIT' || cat === 'RENTAL') return true;
    return false;
  };

  const addonTotal = useMemo(() => {
    let sum = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      const item = availableAddons.find((a) => a.id === addonId);
      if (item && qty > 0) {
        const itemNights = isAddonPerNight(item) ? Math.max(1, nights) : 1;
        sum += item.price * qty * itemNights;
      }
    });
    return sum;
  }, [selectedAddons, availableAddons, nights]);

  // Biaya Layanan & Pajak (Admin + Layanan + PPN 12%)
  const totalServiceAndTaxFee = useMemo(() => {
    const base =
      (platformFee.adminFeeFlat || 4000) + (platformFee.serviceFeeFlat || 2000);
    const tax = Math.round(base * ((platformFee.taxPct || 12) / 100));
    return base + tax;
  }, [platformFee]);

  const grandTotal = useMemo(() => {
    return spotPricePerNight * nights + addonTotal + totalServiceAndTaxFee;
  }, [spotPricePerNight, nights, addonTotal, totalServiceAndTaxFee]);

  const dp50Total = useMemo(() => {
    const rentalHalf = Math.round(
      (spotPricePerNight * nights + addonTotal) * 0.5,
    );
    return rentalHalf + totalServiceAndTaxFee;
  }, [spotPricePerNight, nights, addonTotal, totalServiceAndTaxFee]);

  const paymentAmountToPay = paymentScheme === 'DP_50' ? dp50Total : grandTotal;

  // Add-on counter helper with strict spot pitch / kavling count limitations
  const handleAddonQty = (addonId: string, delta: number) => {
    const addon = availableAddons.find((a) => a.id === addonId);
    const isTent = isTentAddon(addon);

    if (isTent && isTentPackage) return; // Cannot add tent if package already includes tent

    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      if (delta > 0) {
        if (isTent && totalTentsSelected >= kavlingCount) {
          return prev; // Total tent count across all tent models reached kavling limit
        }
        return { ...prev, [addonId]: current + delta };
      } else if (delta < 0) {
        const next = Math.max(0, current + delta);
        if (next === 0) {
          const updated = { ...prev };
          delete updated[addonId];
          return updated;
        }
        return { ...prev, [addonId]: next };
      }
      return prev;
    });
  };

  // Order Submission Flow
  const handleProceedBooking = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (!activeSpot || !campsite) return;

    if (!selectedPackage?.id) {
      setOrderError(
        'Paket harga belum tersedia untuk unit ini. Silakan pesan lewat aplikasi Embun.',
      );
      return;
    }

    if (!getGuestToken()) {
      // Stale/invalid local profile with no real session token - force
      // re-auth instead of attempting an order that will 401.
      clearGuestSession();
      setCurrentUser(null);
      setIsAuthOpen(true);
      return;
    }

    try {
      setSubmittingOrder(true);
      setOrderError(null);

      const addons = Object.entries(selectedAddons)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, quantity]) => ({ addonId, quantity }));

      const orderPayload = {
        campsiteId: campsite.id,
        paymentMethod: 'TRANSFER' as const,
        isDownPayment: paymentScheme === 'DP_50',
        items: [
          {
            blockId: activeSpot.id,
            pricingPackageId: selectedPackage.id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            adultCount: guestCount,
            addons,
          },
        ],
      };

      // 1. Create the real, server-authoritative Order (PENDING).
      const createdOrder = await createRealOrder(orderPayload);
      if (!createdOrder?.id) {
        throw new Error('Gagal membuat pesanan.');
      }

      // 2. Initiate Xendit payment — backend returns the Xendit Invoice URL.
      const paymentInit = await initiateOrderPayment(createdOrder.id);
      if (!paymentInit?.snapRedirectUrl) {
        throw new Error('Gagal mendapatkan URL pembayaran Xendit.');
      }

      const activeAddonsList = Object.entries(selectedAddons)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => {
          const a = availableAddons.find((x) => x.id === id);
          return { name: a?.name || 'Addon', price: a?.price || 0, qty };
        });

      const ticketPayload = {
        orderId: createdOrder.id,
        campsite: {
          name: campsite.name,
          address: campsite.address,
          city: campsite.city,
          photoUrl: spotPhotos[0]?.url || campsite.photos?.[0]?.url,
          googleMapsUrl: campsite.googleMapsUrl,
          checkInTime: campsite.checkInTime,
          checkOutTime: campsite.checkOutTime,
        },
        spot: {
          name: activeSpot.name,
          tentType: activeSpot.tentType,
          packageName: selectedPackage?.name,
        },
        guest: {
          fullName: currentUser.fullName || 'Tamu Embun',
          phone: currentUser.phone || '08123456789',
          email: currentUser.email,
        },
        checkInDate,
        checkOutDate,
        nights,
        guestCount,
        paymentScheme,
        spotPrice: spotPricePerNight,
        addons: activeAddonsList,
        serviceFee: totalServiceAndTaxFee,
        grandTotal: Number(createdOrder.totalAmount) || grandTotal,
        paidAmount: paymentAmountToPay,
        remainingBalance:
          paymentScheme === 'DP_50'
            ? (Number(createdOrder.totalAmount) || grandTotal) -
              paymentAmountToPay
            : 0,
      };

      // 3. Tampilkan e-tiket terlebih dahulu, lalu buka halaman Xendit.
      // Order sudah ada (PENDING), pembayaran bisa dilanjutkan kapan saja
      // dari halaman "Pesanan Saya" jika tab Xendit ditutup.
      setCompletedOrderData(ticketPayload);
      setIsMobileBookingOpen(false);
      setIsTicketOpen(true);

      // Buka Xendit invoice di tab baru agar tamu bisa bayar.
      initiateXenditPayment(paymentInit.snapRedirectUrl);
      // Best-effort sync status; webhook Xendit yang bersifat autoritatif.
      await syncOrderStatus(createdOrder.id).catch(() => {});
    } catch (err: any) {
      console.error('Booking error:', err);
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setCurrentUser(null);
        setIsAuthOpen(true);
        setOrderError('Sesi Anda telah berakhir. Silakan masuk kembali.');
        return;
      }
      setOrderError(
        err.message ||
          'Gagal menghubungkan ke payment gateway. Anda dapat memesan via aplikasi.',
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window === 'undefined' || !activeSpot || !campsite) return;
    const url = window.location.href;
    const text = `Hai! Yuk lihat unit *${activeSpot.name}* di *${campsite.name}* lewat Embun: ${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    if (!activeSpot || !campsite) return;
    const token = activeSpot.shareCode || activeSpot.id;
    const customUri = `embun://spot/${token}`;
    const fallbackUrl =
      typeof navigator !== 'undefined' &&
      /android/i.test(navigator.userAgent || '')
        ? GOOGLE_PLAY_HREF
        : APP_STORE_HREF;

    const start = Date.now();
    window.location.href = customUri;
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        window.location.href = fallbackUrl;
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-3 border-brand-blue border-t-transparent animate-spin mb-4" />
        <p className="text-xs font-bold text-foreground-muted uppercase tracking-widest animate-pulse">
          Memuat Detail Spot & Campsite...
        </p>
      </div>
    );
  }

  if (error || !activeSpot || !campsite) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-surface border border-border flex items-center justify-center text-foreground-muted mb-4 shadow-sm">
          <Tent size={28} />
        </div>
        <h1 className="text-xl font-black text-foreground mb-2">
          Spot Tidak Ditemukan
        </h1>
        <p className="text-xs text-foreground-muted mb-6 leading-relaxed">
          {error ||
            'Unit atau tenda ini mungkin sedang tidak aktif atau tautan tidak valid.'}
        </p>
        <a
          href="https://embun.app/explore"
          className="px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
        >
          Jelajahi Spot Lainnya
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-brand-lime selection:text-black flex flex-col pb-24 lg:pb-12">
      {/* ════════════════════════════════════════════════════════════════════════
          1. AIRBNB TOP NAVBAR
      ════════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Explore Badge */}
          <div className="flex items-center gap-3">
            <a
              href="https://embun.app/explore"
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

          {/* Center: Campsite Location pill (desktop) */}
          <div className="hidden md:flex items-center gap-2 border border-border rounded-full py-1.5 px-4 shadow-2xs bg-surface text-xs text-foreground font-medium">
            <MapPin size={13} className="text-brand-blue shrink-0" />
            <span className="font-bold">{campsite.name}</span>
            <span className="text-foreground-muted">
              · {campsite.address || campsite.city}
            </span>
          </div>

          {/* Top Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              title="Bagikan via WhatsApp"
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
              <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">
                {currentUser?.fullName
                  ? currentUser.fullName.charAt(0).toUpperCase()
                  : 'G'}
              </div>
              <span className="hidden sm:inline">
                {currentUser?.fullName
                  ? currentUser.fullName.split(' ')[0]
                  : 'Masuk'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════════
          2. MAIN CONTENT CONTAINER
      ════════════════════════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-12 w-full space-y-8">
        {/* Title & Metadata Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-2.5 py-0.5 rounded-full border border-brand-blue/20">
              {campsite.name}
            </span>
            {activeSpot.isEmbunPlus && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-brand-lime text-black px-2 py-0.5 rounded-full border border-brand-lime/80 shadow-2xs flex items-center gap-1">
                <Sparkles size={11} />
                <span>Embun Plus</span>
              </span>
            )}
            {activeSpot.tentType && (
              <span className="text-xs font-semibold text-foreground-muted bg-surface px-2.5 py-0.5 rounded-full border border-border">
                {activeSpot.tentType}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            {activeSpot.name}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-foreground-muted pt-1">
            <div className="flex items-center gap-3">
              {reviewAggregate && reviewAggregate.ratingCount > 0 ? (
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span>{reviewAggregate.ratingAvg.toFixed(1)}</span>
                  <span className="text-foreground-muted font-normal">
                    · {reviewAggregate.ratingCount} ulasan
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <Sparkles
                    size={14}
                    className="text-brand-lime fill-brand-lime"
                  />
                  <span className="text-brand-blue">Baru</span>
                  <span className="text-foreground-muted font-normal">
                    · Belum ada ulasan
                  </span>
                </div>
              )}
              <span>·</span>
              <span className="underline decoration-foreground/30 font-medium text-foreground">
                {campsite.city || campsite.address || 'Indonesia'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 hover:text-foreground font-semibold cursor-pointer underline text-xs"
              >
                <Share2 size={13} />
                <span>Bagikan</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 hover:text-foreground font-semibold cursor-pointer underline text-xs"
              >
                {copied ? (
                  <Check size={13} className="text-emerald-600" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            3. ADAPTIVE PHOTO BENTO GRID & 360 TRIGGER
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xs bg-surface">
          {spotPhotos.length <= 1 ? (
            /* 1 Single Photo Full Width */
            <div
              onClick={() => {
                setGalleryTab('photos');
                setActivePhotoIdx(0);
                setIsGalleryOpen(true);
              }}
              className="relative w-full h-[320px] sm:h-[420px] bg-surface overflow-hidden cursor-pointer group"
            >
              {spotPhotos[0] ? (
                <img
                  src={resolveAssetUrl(spotPhotos[0].url)}
                  alt={activeSpot.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface text-foreground-muted">
                  <Tent size={48} />
                </div>
              )}
            </div>
          ) : spotPhotos.length === 2 ? (
            /* 2 Photos Side-by-Side */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[320px] sm:h-[420px]">
              {spotPhotos.slice(0, 2).map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setGalleryTab('photos');
                    setActivePhotoIdx(idx);
                    setIsGalleryOpen(true);
                  }}
                  className="relative h-full bg-surface overflow-hidden cursor-pointer group"
                >
                  <img
                    src={resolveAssetUrl(photo.url)}
                    alt={`${activeSpot.name} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : spotPhotos.length === 3 ? (
            /* 3 Photos: 1 Big Left + 2 Stacked Right */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[420px]">
              <div
                onClick={() => {
                  setGalleryTab('photos');
                  setActivePhotoIdx(0);
                  setIsGalleryOpen(true);
                }}
                className="md:col-span-2 relative h-full bg-surface overflow-hidden cursor-pointer group"
              >
                <img
                  src={resolveAssetUrl(spotPhotos[0].url)}
                  alt={activeSpot.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="hidden md:grid col-span-2 grid-rows-2 gap-2 h-full">
                {spotPhotos.slice(1, 3).map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setGalleryTab('photos');
                      setActivePhotoIdx(idx + 1);
                      setIsGalleryOpen(true);
                    }}
                    className="relative h-[205px] bg-surface overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={resolveAssetUrl(photo.url)}
                      alt={`${activeSpot.name} ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : spotPhotos.length === 4 ? (
            /* 4 Photos: 1 Big Left + 3 Slots Right */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[420px]">
              <div
                onClick={() => {
                  setGalleryTab('photos');
                  setActivePhotoIdx(0);
                  setIsGalleryOpen(true);
                }}
                className="md:col-span-2 relative h-full bg-surface overflow-hidden cursor-pointer group"
              >
                <img
                  src={resolveAssetUrl(spotPhotos[0].url)}
                  alt={activeSpot.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="hidden md:grid col-span-2 grid-cols-2 grid-rows-2 gap-2 h-full">
                <div
                  onClick={() => {
                    setGalleryTab('photos');
                    setActivePhotoIdx(1);
                    setIsGalleryOpen(true);
                  }}
                  className="col-span-2 relative h-[205px] bg-surface overflow-hidden cursor-pointer group"
                >
                  <img
                    src={resolveAssetUrl(spotPhotos[1].url)}
                    alt={`${activeSpot.name} 2`}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                {spotPhotos.slice(2, 4).map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setGalleryTab('photos');
                      setActivePhotoIdx(idx + 2);
                      setIsGalleryOpen(true);
                    }}
                    className="relative h-[205px] bg-surface overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={resolveAssetUrl(photo.url)}
                      alt={`${activeSpot.name} ${idx + 3}`}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 5+ Photos: Airbnb 5-Photo Bento Grid */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[420px]">
              <div
                onClick={() => {
                  setGalleryTab('photos');
                  setActivePhotoIdx(0);
                  setIsGalleryOpen(true);
                }}
                className="md:col-span-2 relative h-full bg-surface overflow-hidden cursor-pointer group"
              >
                {spotPhotos[0] ? (
                  <img
                    src={resolveAssetUrl(spotPhotos[0].url)}
                    alt={activeSpot.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface text-foreground-muted">
                    <Tent size={48} />
                  </div>
                )}
              </div>

              <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
                {spotPhotos.slice(1, 5).map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setGalleryTab('photos');
                      setActivePhotoIdx(idx + 1);
                      setIsGalleryOpen(true);
                    }}
                    className="relative h-[205px] bg-surface overflow-hidden cursor-pointer group"
                  >
                    <img
                      src={resolveAssetUrl(photo.url)}
                      alt={`${activeSpot.name} ${idx + 2}`}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overlay Buttons */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {panoramaList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setGalleryTab('360');
                  setIsGalleryOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-brand-lime text-black text-xs font-bold shadow-lg flex items-center gap-1.5 hover:scale-103 transition-all cursor-pointer"
              >
                <Compass size={14} className="animate-spin-slow" />
                <span>Tur 360° ({panoramaList.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setGalleryTab('photos');
                setIsGalleryOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-sm text-foreground text-xs font-bold shadow-lg border border-border flex items-center gap-1.5 hover:bg-white hover:scale-103 transition-all cursor-pointer"
            >
              <Grid size={14} />
              <span>Tampilkan Semua {spotPhotos.length} Foto</span>
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            4. MAIN 2-COLUMN LAYOUT (Desktop 8 cols / 4 cols)
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── LEFT COLUMN: DETAILS, PACKAGES, CALENDAR, MAP, & CAMPSITE INFO (8 COLS) ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* Spot Overview Card */}
            <div className="pb-6 border-b border-border space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Kavling & Unit di {campsite.name}
                  </h2>
                  <p className="text-xs text-foreground-muted mt-1">
                    Maks. {effectiveMaxCapacity} Tamu{' '}
                    {activeSpot.tentType
                      ? `· Ground ${activeSpot.tentType}`
                      : ''}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                  <Tent size={24} />
                </div>
              </div>
            </div>

            {/* ── REAL SPOT SPECIFICATIONS (Tipe Ground, View, & Fasilitas Spot) ── */}
            <div className="space-y-4 pb-6 border-b border-border">
              <h3 className="font-bold text-base text-foreground">
                Spesifikasi & Fasilitas Spot
              </h3>

              {/* View & Ground Badges */}
              <div className="flex flex-wrap gap-2">
                {activeSpot.tentType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface border border-border text-xs font-semibold text-foreground">
                    <Tent size={14} className="text-brand-blue" />
                    <span>Tipe Ground: {activeSpot.tentType}</span>
                  </span>
                )}
                {Array.isArray(activeSpot.viewOptions) &&
                  activeSpot.viewOptions.map((v, vIdx) => (
                    <span
                      key={vIdx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-brand-blue/5 border border-brand-blue/20 text-xs font-semibold text-brand-blue"
                    >
                      <Trees size={14} />
                      <span>{v}</span>
                    </span>
                  ))}
              </div>

              {/* Real Spot Facilities */}
              {Array.isArray(activeSpot.facilities) &&
                activeSpot.facilities.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {activeSpot.facilities.map((fac, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 p-2.5 rounded-2xl bg-surface border border-border/80 text-xs text-foreground"
                      >
                        {getFacilityIcon(fac)}
                        <span className="font-medium truncate">{fac}</span>
                      </div>
                    ))}
                  </div>
                )}

              {/* Catatan Khusus Spot (from activeSpot.specificNotes) */}
              {activeSpot.specificNotes && (
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1.5 mt-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5">
                    <Info size={13} className="text-amber-600 shrink-0" />
                    <span>Catatan Khusus Unit:</span>
                  </h4>
                  <ul className="space-y-1 text-foreground/80 list-disc list-inside">
                    {parseHtmlRules(activeSpot.specificNotes).map(
                      (note, nIdx) => (
                        <li key={nIdx} className="leading-relaxed">
                          {note}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* ── SECTION: PILIHAN PAKET PENGINAPAN ── */}
            {Array.isArray(activeSpot.pricingPackages) &&
              activeSpot.pricingPackages.length > 0 && (
                <div className="space-y-4 pb-8 border-b border-border">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      Pilihan Paket Penginapan
                    </h3>
                    <p className="text-xs text-foreground-muted mt-0.5">
                      Pilih paket yang sesuai dengan kebutuhan Anda untuk unit{' '}
                      {activeSpot.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeSpot.pricingPackages.map((pkg) => {
                      const isSelected =
                        (selectedPackage?.id ||
                          activeSpot.pricingPackages?.[0]?.id) === pkg.id;
                      const pkgPrice =
                        pkg.flatRateMode && pkg.flatRate
                          ? Number(pkg.flatRate)
                          : Number(pkg.weekdayRate) || spotPricePerNight;
                      const cleanDesc = pkg.description
                        ? pkg.description
                            .replace(/<[^>]+>/g, '')
                            .replace(/&nbsp;/g, ' ')
                            .trim()
                        : null;

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackageId(pkg.id || null)}
                          className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-3 relative group ${
                            isSelected
                              ? 'border-brand-blue bg-brand-blue/5 shadow-md ring-2 ring-brand-blue/20'
                              : 'border-border bg-surface hover:border-brand-blue/40 hover:bg-surface-variant/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-foreground group-hover:text-brand-blue transition-colors">
                                {pkg.name}
                              </h4>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'border-brand-blue bg-brand-blue text-white'
                                  : 'border-border bg-white'
                              }`}
                            >
                              {isSelected && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </div>
                          </div>

                          {cleanDesc ? (
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {cleanDesc}
                            </p>
                          ) : null}

                          <div className="flex items-baseline justify-between pt-2 border-t border-border/80 text-xs">
                            <div>
                              <span className="text-base font-extrabold text-brand-blue">
                                {rupiah(pkgPrice)}
                              </span>
                              <span className="text-[10.5px] text-foreground-muted">
                                {' '}
                                / malam
                              </span>
                            </div>
                            <span className="text-[10.5px] font-bold text-foreground-muted bg-white px-2 py-0.5 rounded-full border border-border">
                              Maks.{' '}
                              {pkg.maxOccupancy ||
                                pkg.baseCapacity ||
                                activeSpot.maxCapacity}{' '}
                              Tamu
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* ── SECTION: PERLENGKAPAN TAMBAHAN (OPSIONAL) ── */}
            {availableAddons.length > 0 && (
              <div className="space-y-4 pb-8 border-b border-border">
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    Perlengkapan Tambahan (Opsional)
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Sewa perlengkapan camping ekstra untuk kenyamanan menginap
                    Anda di {campsite.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableAddons.map((addon) => {
                    const qty = selectedAddons[addon.id] || 0;
                    const isTent = isTentAddon(addon);
                    const isTentDisabled = isTent && isTentPackage;
                    const isMaxTentReached =
                      isTent &&
                      !isTentPackage &&
                      totalTentsSelected >= kavlingCount;

                    const perNight = isAddonPerNight(addon);
                    const rawUnit = (addon.unit || '').trim();
                    const unitDisplay = rawUnit ? rawUnit : 'unit';
                    const priceSuffix = perNight
                      ? unitDisplay.toLowerCase() === 'malam'
                        ? '/ malam'
                        : `/ ${unitDisplay} / malam`
                      : `/ ${unitDisplay}`;

                    return (
                      <div
                        key={addon.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isTentDisabled
                            ? 'border-border/60 bg-surface/30 opacity-75'
                            : qty > 0
                              ? 'border-brand-blue/60 bg-brand-blue/5 ring-1 ring-brand-blue/20'
                              : 'border-border bg-surface hover:bg-surface-variant/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-foreground text-xs sm:text-[13px] truncate">
                              {addon.name}
                            </p>
                            {isTentDisabled && (
                              <span className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded-full">
                                Termasuk di Paket
                              </span>
                            )}
                            {isTent && !isTentPackage && (
                              <span className="text-[9px] font-semibold text-foreground-muted bg-white px-1.5 py-0.5 rounded-full border border-border">
                                Maks. {kavlingCount} tenda ({kavlingCount}{' '}
                                kavling)
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-extrabold text-brand-blue mt-1">
                            +{rupiah(addon.price)}{' '}
                            <span className="text-[10px] font-medium text-foreground-muted">
                              {priceSuffix}
                            </span>
                          </p>
                        </div>

                        {!isTentDisabled ? (
                          <div className="flex items-center gap-2 shrink-0 bg-white border border-border p-1 rounded-full shadow-2xs">
                            <button
                              type="button"
                              disabled={qty <= 0}
                              onClick={() => handleAddonQty(addon.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-xs w-4 text-center text-foreground">
                              {qty}
                            </span>
                            <button
                              type="button"
                              disabled={isMaxTentReached}
                              onClick={() => handleAddonQty(addon.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-brand-blue shrink-0 px-2.5 py-1 bg-brand-blue/5 rounded-xl">
                            Included
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── AIRBNB INTEGRATED CALENDAR SECTION ── */}
            <div className="space-y-4 pb-8 border-b border-border">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Pilih Tanggal Menginap
                </h3>
                <p className="text-xs text-foreground-muted">
                  {nights} Malam di {campsite.name} (
                  {formatDateDisplay(checkInDate)} s/d{' '}
                  {formatDateDisplay(checkOutDate)})
                </p>
              </div>

              {/* Interactive Calendar Trigger Card */}
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="p-5 rounded-3xl bg-surface hover:bg-surface-variant/70 border border-border hover:border-brand-blue/60 transition-all cursor-pointer group shadow-2xs hover:shadow-md space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                      <Calendar size={13} className="text-brand-blue" />
                      <span>Check-In</span>
                    </span>
                    <div className="font-bold text-sm sm:text-base text-foreground group-hover:text-brand-blue transition-colors">
                      {formatDateDisplay(checkInDate)}
                    </div>
                  </div>

                  <div className="space-y-1 border-l border-border pl-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                      <Calendar size={13} className="text-brand-blue" />
                      <span>Check-Out</span>
                    </span>
                    <div className="font-bold text-sm sm:text-base text-foreground group-hover:text-brand-blue transition-colors">
                      {formatDateDisplay(checkOutDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Clock size={13} className="text-brand-blue" />
                    Durasi:{' '}
                    <strong className="text-brand-blue">{nights} Malam</strong>
                  </span>
                  <span className="text-xs font-bold text-brand-blue group-hover:underline flex items-center gap-1">
                    Pilih / Ubah Tanggal →
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION: LOKASI & PETA AREA (GOOGLE MAPS) ── */}
            <div className="space-y-4 pb-8 border-b border-border">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  Lokasi & Akses Area
                </h3>
                <p className="text-xs text-foreground-muted">
                  {campsite.name} ·{' '}
                  {[campsite.address, campsite.city, campsite.province]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>

              {/* Google Maps Iframe Embed */}
              {campsite.latitude &&
              campsite.longitude &&
              Number(campsite.latitude) !== 0 ? (
                <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-border bg-surface shadow-2xs">
                  <iframe
                    width="100%"
                    height="100%"
                    className="w-full h-full border-0"
                    loading="lazy"
                    title={`Peta Google Maps ${campsite.name}`}
                    src={`https://maps.google.com/maps?q=${campsite.latitude},${campsite.longitude}&hl=id&z=15&output=embed`}
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1.5 pointer-events-none">
                    <MapPin size={13} className="text-brand-lime" />
                    <span>{campsite.name}</span>
                  </div>
                </div>
              ) : null}

              {/* Denah Resmi Kavling (If Available) */}
              {campsite.mapImageUrl && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-foreground">
                    Denah Resmi Kavling / Site Plan
                  </h4>
                  <div
                    onClick={() => {
                      setGalleryTab('map');
                      setIsGalleryOpen(true);
                    }}
                    className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-border bg-surface cursor-pointer group shadow-2xs hover:border-brand-blue/60 transition-all"
                  >
                    <img
                      src={resolveAssetUrl(campsite.mapImageUrl)}
                      alt="Denah Kavling"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                      <Maximize2 size={16} />
                      <span>Buka Denah Penuh</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Google Maps Button & Directions */}
              <div className="pt-2">
                <a
                  href={
                    campsite.googleMapsUrl ||
                    (campsite.latitude && campsite.longitude
                      ? `https://www.google.com/maps/search/?api=1&query=${campsite.latitude},${campsite.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          campsite.name + ' ' + (campsite.address || ''),
                        )}`)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-white hover:bg-surface text-xs font-bold text-brand-blue shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <MapPin size={14} />
                  <span>Buka di Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* ── SECTION: TENTANG PROPERTI CAMPSITE (PROPERTY DETAILS) ── */}
            <div className="space-y-6 pb-8 border-b border-border">
              {/* Property Cover Banner & Mitra Profile Header */}
              <div className="rounded-3xl border border-border overflow-hidden bg-surface shadow-2xs">
                {campsiteCoverPhoto ? (
                  <div className="relative aspect-[16/9] sm:aspect-[21/8] w-full bg-surface overflow-hidden">
                    <img
                      src={resolveAssetUrl(campsiteCoverPhoto)}
                      alt={campsite.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                    {/* Campsite Logo & Badge Overlay on Banner */}
                    <div className="absolute bottom-4 left-4 sm:left-6 right-4 flex items-end justify-between gap-3 text-white">
                      <div className="flex items-center gap-3.5">
                        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                          {campsite.logoUrl ? (
                            <img
                              src={resolveAssetUrl(campsite.logoUrl)}
                              alt={campsite.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-blue text-white flex items-center justify-center font-black text-xl">
                              {campsite.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider bg-brand-lime text-black shadow-none">
                              Mitra Resmi Embun
                            </span>
                            <span className="text-[11px] text-white/80 font-medium">
                              · {campsite.city || campsite.address || 'Indonesia'}
                            </span>
                          </div>
                          <h3 className="font-extrabold text-base sm:text-2xl text-white tracking-tight drop-shadow-md">
                            {campsite.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-brand-blue/10 via-surface to-surface flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-blue text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-md overflow-hidden">
                      {campsite.logoUrl ? (
                        <img
                          src={resolveAssetUrl(campsite.logoUrl)}
                          alt={campsite.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        campsite.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-lime text-black shadow-none">
                        Mitra Resmi Embun
                      </span>
                      <h3 className="font-bold text-lg sm:text-xl text-foreground mt-1">
                        {campsite.name}
                      </h3>
                      <p className="text-xs text-foreground-muted">
                        {campsite.city || campsite.address || 'Indonesia'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description Body */}
                <div className="p-4 sm:p-6 space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-blue">
                    Tentang Kawasan
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                    {campsite.description ||
                      `${campsite.name} merupakan destinasi camping dan glamping pilihan di ${campsite.city || 'Jawa Barat'} dengan suasana asri, udara sejuk, dan fasilitas lengkap untuk liburan Anda.`}
                  </p>
                </div>
              </div>

              {/* Fasilitas Properti Campsite */}
              {Array.isArray(campsite.facilities) &&
                campsite.facilities.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-foreground">
                      Fasilitas Utama Properti
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-foreground">
                      {campsite.facilities.map((fac: any, idx: number) => {
                        const facName =
                          typeof fac === 'string'
                            ? fac
                            : fac.name || 'Fasilitas';
                        const facIcon =
                          typeof fac === 'object' ? fac.icon : null;
                        return (
                          <div
                            key={fac.id || idx}
                            className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface border border-border/80"
                          >
                            {getFacilityIcon(facName, facIcon || fac.id)}
                            <span className="font-medium truncate">
                              {facName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Aturan & Waktu Menginap */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground">
                  Aturan & Kebijakan Menginap
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-foreground-muted leading-relaxed">
                  <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                    <h5 className="font-bold text-foreground flex items-center gap-1.5">
                      <Clock size={13} className="text-brand-blue" />
                      <span>Waktu Menginap</span>
                    </h5>
                    <p>
                      Check-in mulai:{' '}
                      <strong>{campsite.checkInTime || '14:00'} WIB</strong>
                    </p>
                    <p>
                      Check-out maksimal:{' '}
                      <strong>{campsite.checkOutTime || '12:00'} WIB</strong>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                    <h5 className="font-bold text-foreground flex items-center gap-1.5">
                      <MoonStar size={13} className="text-brand-blue" />
                      <span>Jam Tenang (Quiet Hours)</span>
                    </h5>
                    <p>
                      <strong>22:00 - 06:00 WIB</strong>
                    </p>
                    <p className="text-[11px]">
                      Kecilkan volume musik dan suara demi kenyamanan bersama.
                    </p>
                  </div>
                </div>

                {/* Parsed Rules from CMS */}
                {campsite.rules && (
                  <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 text-xs">
                    <h5 className="font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>Tata Tertib & Keselamatan</span>
                    </h5>
                    <ul className="space-y-1.5 text-foreground/80 list-disc list-inside">
                      {parseHtmlRules(campsite.rules).map((rule, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION: ULASAN TAMU (REAL GUEST REVIEWS) ── */}
            <div className="space-y-6 pb-8 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Star size={20} className="fill-amber-500 text-amber-500" />
                  <h3 className="font-bold text-xl text-foreground">
                    {reviewAggregate && reviewAggregate.ratingCount > 0
                      ? `${reviewAggregate.ratingAvg.toFixed(1)} · ${reviewAggregate.ratingCount} Ulasan Tamu`
                      : 'Ulasan Tamu'}
                  </h3>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-3xl bg-surface border border-border space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-brand-blue/10 border border-border flex items-center justify-center font-bold text-xs text-brand-blue overflow-hidden">
                            {rev.authorPhotoUrl ? (
                              <img
                                src={resolveAssetUrl(rev.authorPhotoUrl)}
                                alt={rev.maskedAuthorName || 'Tamu'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (rev.maskedAuthorName || 'Tamu')
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-foreground">
                              {rev.maskedAuthorName || 'Tamu Embun'}
                            </h4>
                            <span className="text-[10px] text-foreground-muted">
                              {new Date(rev.createdAt).toLocaleDateString(
                                'id-ID',
                                {
                                  month: 'long',
                                  year: 'numeric',
                                },
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-border text-[11px] font-bold text-foreground">
                          <Star
                            size={11}
                            className="fill-amber-500 text-amber-500"
                          />
                          <span>{rev.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-foreground/90 leading-relaxed">
                        "{rev.message}"
                      </p>

                      {rev.photoUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-border">
                          <img
                            src={resolveAssetUrl(rev.photoUrl)}
                            alt="Foto ulasan"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-surface border border-border text-center space-y-2">
                  <Star size={28} className="mx-auto text-amber-500" />
                  <p className="text-xs font-bold text-foreground">
                    Belum ada ulasan tertulis
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    Jadilah tamu pertama yang memberikan ulasan setelah selesai
                    menginap!
                  </p>
                </div>
              )}
            </div>

            {/* ── SECTION: PROMOSI APLIKASI EMBUN ── */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0841b5] text-white space-y-4 shadow-md">
              <div className="max-w-xl space-y-2.5">
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Pesan Lebih Cepat & Lengkap di Aplikasi Embun
                </h3>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Nikmati pengalaman maksimal dengan tur 360° interaktif yang
                  mulus, peta interaktif spot & campsite, fitur gathering
                  rombongan, dan e-tiket QR code instan.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* App Store Button */}
                  <a
                    href={APP_STORE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-xs active:scale-95 group cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden="true"
                      fill="currentColor"
                    >
                      <path d="M17.05 12.53c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.02 1.01 7.99.67.96 1.47 2.04 2.51 2 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.98 2.44-1.95.77-1.12 1.09-2.2 1.11-2.26-.02-.01-2.13-.82-2.15-3.24zM15.04 6.34c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
                    </svg>
                    <div className="text-left">
                      <span className="block text-[9px] text-white/70 uppercase font-medium leading-none">
                        Download on
                      </span>
                      <span className="font-bold text-xs leading-tight">
                        App Store
                      </span>
                    </div>
                  </a>

                  {/* Google Play Button */}
                  <a
                    href={GOOGLE_PLAY_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all shadow-xs active:scale-95 group cursor-pointer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.6 2.3c-.24.25-.38.63-.38 1.13v17.14c0 .5.14.88.38 1.13l.06.05L13 12.06v-.12L3.66 2.25l-.06.05z"
                        fill="#00D0FF"
                      />
                      <path
                        d="M16.5 15.56 13 12.06v-.12l3.5-3.5.08.05 4.15 2.36c1.18.67 1.18 1.77 0 2.45l-4.15 2.36-.08.05z"
                        fill="#FFCE00"
                      />
                      <path
                        d="M16.58 15.51 13 12l-9.4 9.4c.39.41 1.03.46 1.76.05l11.22-6.44"
                        fill="#FF3D44"
                      />
                      <path
                        d="M16.58 8.49 5.36 2.05C4.63 1.64 3.99 1.69 3.6 2.1L13 11.5l3.58-3.01z"
                        fill="#00F076"
                      />
                    </svg>
                    <div className="text-left">
                      <span className="block text-[9px] text-white/70 uppercase font-medium leading-none">
                        Get it on
                      </span>
                      <span className="font-bold text-xs leading-tight">
                        Google Play
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: STICKY BOOKING CARD (DESKTOP ONLY) OR 360 TOUR CARD ── */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            {isTour360Only ? (
              <div className="sticky top-24 bg-white rounded-3xl border border-border shadow-xl p-6 space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center mx-auto">
                  <Compass size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Tur Virtual 360°
                  </h3>
                  <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                    Jelajahi lanskap, area camp, dan fasilitas di{' '}
                    <span className="font-semibold text-foreground">
                      {campsite.name}
                    </span>{' '}
                    secara visual interaktif.
                  </p>
                </div>
                {panoramaList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsGalleryOpen(true);
                      setGalleryTab('360');
                    }}
                    className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Compass size={16} />
                    <span>Buka Tur 360° ({panoramaList.length} Area)</span>
                  </button>
                )}
                <div className="pt-2 border-t border-border">
                  <a
                    href="/explore"
                    className="text-xs font-bold text-brand-blue hover:underline"
                  >
                    ← Kembali ke Embun Explore
                  </a>
                </div>
              </div>
            ) : (
              <div className="sticky top-24 bg-white rounded-3xl border border-border shadow-xl p-5 space-y-3.5">
                {/* Header Price & Rating */}
                <div className="flex items-baseline justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-2xl font-extrabold text-foreground tracking-tight">
                      {rupiah(spotPricePerNight)}
                    </span>
                    <span className="text-xs text-foreground-muted">
                      {' '}
                      / malam
                    </span>
                  </div>
                  {reviewAggregate && reviewAggregate.ratingCount > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                      <Star size={13} className="fill-amber-500 text-amber-500" />
                      <span>{reviewAggregate.ratingAvg.toFixed(1)}</span>
                      <span className="text-foreground-muted">
                        · {reviewAggregate.ratingCount} ulasan
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                      <Sparkles
                        size={13}
                        className="text-brand-lime fill-brand-lime"
                      />
                      <span className="text-brand-blue">Baru</span>
                    </div>
                  )}
                </div>

                {/* Package Selector (Sidebar) */}
                {Array.isArray(activeSpot.pricingPackages) &&
                  activeSpot.pricingPackages.length > 1 && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-foreground flex items-center justify-between">
                        <span>Pilihan Paket</span>
                        <span className="text-[10px] font-semibold text-brand-blue truncate max-w-[140px]">
                          {selectedPackage?.name}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        {activeSpot.pricingPackages.map((pkg) => {
                          const isSelected =
                            (selectedPackage?.id ||
                              activeSpot.pricingPackages?.[0]?.id) === pkg.id;
                          const pkgPrice =
                            pkg.flatRateMode && pkg.flatRate
                              ? Number(pkg.flatRate)
                              : Number(pkg.weekdayRate) || 0;
                          return (
                            <button
                              key={pkg.id}
                              type="button"
                              onClick={() => setSelectedPackageId(pkg.id || null)}
                              className={`p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
                                  : 'border-border bg-surface/50 hover:bg-surface'
                              }`}
                            >
                              <span className="font-bold text-foreground block truncate text-[11px]">
                                {pkg.name}
                              </span>
                              <span className="font-extrabold text-brand-blue block text-[10.5px] mt-0.5">
                                {rupiah(pkgPrice)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {/* Date & Guest Input Box */}
                <div className="border border-border rounded-2xl overflow-hidden shadow-2xs divide-y divide-border text-xs">
                  {/* Date Trigger Box in Sidebar */}
                  <div
                    onClick={() => setIsCalendarOpen(true)}
                    className="grid grid-cols-2 divide-x divide-border bg-surface/50 hover:bg-surface transition-colors cursor-pointer group"
                  >
                    <div className="p-2.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
                        Check-In
                      </span>
                      <span className="font-bold text-foreground group-hover:text-brand-blue text-xs block mt-0.5 transition-colors">
                        {formatDateDisplay(checkInDate)}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
                        Check-Out
                      </span>
                      <span className="font-bold text-foreground group-hover:text-brand-blue text-xs block mt-0.5 transition-colors">
                        {formatDateDisplay(checkOutDate)}
                      </span>
                    </div>
                  </div>

                  {/* Guest Counter in Sidebar */}
                  <div className="p-2.5 bg-white flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-foreground-muted">
                        Jumlah Tamu
                      </span>
                      <span className="font-bold text-foreground text-xs">
                        {guestCount} Orang (Maks. {effectiveMaxCapacity})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={guestCount <= 1}
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-bold text-xs w-3 text-center">
                        {guestCount}
                      </span>
                      <button
                        type="button"
                        disabled={guestCount >= effectiveMaxCapacity}
                        onClick={() =>
                          setGuestCount(
                            Math.min(effectiveMaxCapacity, guestCount + 1),
                          )
                        }
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Calculation Breakdown */}
                <div className="space-y-2 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between text-foreground-muted">
                    <span>
                      {selectedPackage?.name || 'Sewa'} (
                      {rupiah(spotPricePerNight)} x {nights} malam)
                    </span>
                    <span className="font-semibold text-foreground">
                      {rupiah(spotPricePerNight * nights)}
                    </span>
                  </div>

                  {addonTotal > 0 && (
                    <div className="flex justify-between text-foreground-muted">
                      <span>Perlengkapan Tambahan</span>
                      <span className="font-semibold text-foreground">
                        +{rupiah(addonTotal)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-foreground-muted">
                    <span>Biaya Layanan & Pajak</span>
                    <span className="font-semibold text-foreground">
                      +{rupiah(totalServiceAndTaxFee)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-border font-bold text-sm text-foreground">
                    <span>Total Tagihan</span>
                    <span className="text-base text-brand-blue font-extrabold">
                      {rupiah(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Payment Scheme Choice */}
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentScheme('DP_50')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentScheme === 'DP_50'
                          ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20'
                          : 'border-border bg-surface/50 hover:bg-surface'
                      }`}
                    >
                      <span className="block text-[11px] font-bold text-foreground">
                        DP 50%
                      </span>
                      <span className="block text-xs font-extrabold text-brand-blue mt-0.5">
                        {rupiah(dp50Total)}
                      </span>
                      <span className="block text-[9.5px] text-foreground-muted mt-0.5">
                        Sisa di lokasi / aplikasi
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentScheme('FULL')}
                      className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        paymentScheme === 'FULL'
                          ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20'
                          : 'border-border bg-surface/50 hover:bg-surface'
                      }`}
                    >
                      <span className="block text-[11px] font-bold text-foreground">
                        Bayar Lunas
                      </span>
                      <span className="block text-xs font-extrabold text-foreground mt-0.5">
                        {rupiah(grandTotal)}
                      </span>
                      <span className="block text-[9.5px] text-emerald-600 font-semibold mt-0.5">
                        Lunas langsung
                      </span>
                    </button>
                  </div>
                </div>

                {orderError && (
                  <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                    {orderError}
                  </div>
                )}

                {/* CTA Booking Button */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    disabled={submittingOrder}
                    onClick={handleProceedBooking}
                    className="w-full py-3.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    <span>
                      {submittingOrder
                        ? 'Memproses Pesanan...'
                        : `Pesan Sekarang · ${rupiah(paymentAmountToPay)}`}
                    </span>
                  </button>

                  {/* Direct App Store & Google Play Badges Under Booking Button */}
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <p className="text-[11px] font-bold text-foreground">
                      Tersedia di iOS & Android
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={APP_STORE_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center gap-1.5 text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="currentColor"
                        >
                          <path d="M17.05 12.53c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.02 1.01 7.99.67.96 1.47 2.04 2.51 2 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.98 2.44-1.95.77-1.12 1.09-2.2 1.11-2.26-.02-.01-2.13-.82-2.15-3.24zM15.04 6.34c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
                        </svg>
                        <span className="text-[11px] font-bold">App Store</span>
                      </a>

                      <a
                        href={GOOGLE_PLAY_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center gap-1.5 text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                      >
                        <svg viewBox="0 0 24 24" width="13" height="13">
                          <path
                            d="M3.6 2.3c-.24.25-.38.63-.38 1.13v17.14c0 .5.14.88.38 1.13l.06.05L13 12.06v-.12L3.66 2.25l-.06.05z"
                            fill="#00D0FF"
                          />
                          <path
                            d="M16.5 15.56 13 12.06v-.12l3.5-3.5.08.05 4.15 2.36c1.18.67 1.18 1.77 0 2.45l-4.15 2.36-.08.05z"
                            fill="#FFCE00"
                          />
                          <path
                            d="M16.58 15.51 13 12l-9.4 9.4c.39.41 1.03.46 1.76.05l11.22-6.44"
                            fill="#FF3D44"
                          />
                          <path
                            d="M16.58 8.49 5.36 2.05C4.63 1.64 3.99 1.69 3.6 2.1L13 11.5l3.58-3.01z"
                            fill="#00F076"
                          />
                        </svg>
                        <span className="text-[11px] font-bold">Google Play</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          5. MOBILE STICKY BOTTOM BAR
      ════════════════════════════════════════════════════════════════════════ */}
      {!isTour360Only && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-4 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div
              onClick={() => setIsCalendarOpen(true)}
              className="cursor-pointer group"
            >
            <span className="text-base font-extrabold text-foreground">
              {rupiah(spotPricePerNight)}
            </span>
            <span className="text-xs text-foreground-muted"> / malam</span>
            <p className="text-[10.5px] text-brand-blue font-bold group-hover:underline flex items-center gap-1">
              <span>{nights} Malam</span>
              <span>
                ({formatDateDisplay(checkInDate)} -{' '}
                {formatDateDisplay(checkOutDate)})
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileBookingOpen(true)}
            className="px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Pesan</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          6. FULLSCREEN GALLERY & 360 LIGHTBOX MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="h-16 shrink-0 px-4 sm:px-8 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
              <span className="font-bold text-sm truncate max-w-xs sm:max-w-md">
                {activeSpot.name} · Galeri & Tur
              </span>
            </div>

            {/* Gallery Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGalleryTab('photos')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  galleryTab === 'photos'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Foto ({spotPhotos.length})
              </button>
              {panoramaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGalleryTab('360')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    galleryTab === '360'
                      ? 'bg-brand-lime text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Tur 360° ({panoramaList.length})
                </button>
              )}
              {campsite.mapImageUrl && (
                <button
                  type="button"
                  onClick={() => setGalleryTab('map')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    galleryTab === 'map'
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Denah
                </button>
              )}
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 relative overflow-hidden bg-black/95 flex items-center justify-center p-4">
            {galleryTab === 'photos' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="relative max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
                  <img
                    src={resolveAssetUrl(spotPhotos[activePhotoIdx]?.url)}
                    alt={`Foto ${activePhotoIdx + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                  />

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
                        className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIdx((prev) =>
                            prev === spotPhotos.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {/* Bottom Photo Thumbnails */}
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 overflow-x-auto p-2 no-scrollbar">
                  {spotPhotos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`h-12 w-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                        activePhotoIdx === idx
                          ? 'border-brand-lime scale-105'
                          : 'border-transparent opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolveAssetUrl(p.url)}
                        alt="thumb"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {galleryTab === 'map' && campsite.mapImageUrl && (
              <div className="max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-4">
                <img
                  src={resolveAssetUrl(campsite.mapImageUrl)}
                  alt="Denah Kavling Lengkap"
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />
              </div>
            )}

            {galleryTab === '360' && (
              <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-6 bg-neutral-900 rounded-2xl">
                {panoramaList.length === 0 ? (
                  <div className="max-w-md space-y-3">
                    <Compass size={48} className="mx-auto text-brand-lime animate-pulse" />
                    <h3 className="text-white font-bold text-base">
                      Tur 360° Segera Hadir
                    </h3>
                    <p className="text-neutral-400 text-xs">
                      Foto panorama 360° interaktif untuk kawasan ini sedang dalam proses pemrosesan & pengunggahan. Silakan jelajahi galeri foto utama terlebih dahulu.
                    </p>
                    <button
                      type="button"
                      onClick={() => setGalleryTab('photos')}
                      className="mt-2 px-5 py-2.5 rounded-full bg-brand-lime text-black text-xs font-bold hover:scale-105 transition-transform cursor-pointer"
                    >
                      Buka Galeri Foto
                    </button>
                  </div>
                ) : (
                  <>
                    {panoramaList.length > 1 && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                        {panoramaList.map((pano, pIdx) => (
                          <button
                            key={pano.id}
                            type="button"
                            onClick={() => setActivePanoramaIdx(pIdx)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              activePanoramaIdx === pIdx
                                ? 'bg-brand-lime text-black'
                                : 'text-white/80 hover:text-white'
                            }`}
                          >
                            {pano.label || `Area ${pIdx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      ref={panoramaContainerRef}
                      className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                    />

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/90 flex items-center gap-2 pointer-events-none shadow-2xl">
                      <RotateCw
                        size={14}
                        className="text-brand-lime animate-spin"
                      />
                      <span>Geser layar / mouse untuk berputar 360°</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          7. BOOKING CALENDAR RANGE PICKER MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      <BookingCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onSelectDates={(inD, outD) => {
          setCheckInDate(inD);
          setCheckOutDate(outD);
        }}
        spotName={activeSpot?.name}
      />

      {/* ════════════════════════════════════════════════════════════════════════
          8. MOBILE BOOKING DRAWER / SHEET
      ════════════════════════════════════════════════════════════════════════ */}
      {isMobileBookingOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-white text-foreground rounded-t-3xl border-t border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-extrabold text-base text-foreground tracking-tight">
                  {activeSpot.name}
                </h3>
                <p className="text-xs text-foreground-muted">
                  {rupiah(spotPricePerNight)}{' '}
                  <span className="text-[11px]">/ malam</span> · {campsite.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileBookingOpen(false)}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Package Selector (Mobile Drawer) */}
            {Array.isArray(activeSpot.pricingPackages) &&
              activeSpot.pricingPackages.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Pilihan Paket
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {activeSpot.pricingPackages.map((pkg) => {
                      const isSelected =
                        (selectedPackage?.id ||
                          activeSpot.pricingPackages?.[0]?.id) === pkg.id;
                      const pkgPrice =
                        pkg.flatRateMode && pkg.flatRate
                          ? Number(pkg.flatRate)
                          : Number(pkg.weekdayRate) || 0;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id || null)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue'
                              : 'border-border bg-surface/50 hover:bg-surface'
                          }`}
                        >
                          <span className="font-bold text-foreground block truncate text-xs">
                            {pkg.name}
                          </span>
                          <span className="font-extrabold text-brand-blue block text-[11px] mt-0.5">
                            {rupiah(pkgPrice)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Date & Guest Selection */}
            <div className="border border-border rounded-2xl overflow-hidden shadow-2xs divide-y divide-border text-xs">
              <div
                onClick={() => setIsCalendarOpen(true)}
                className="grid grid-cols-2 divide-x divide-border bg-surface/50 hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="p-3">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-foreground-muted">
                    Check-In
                  </span>
                  <span className="font-bold text-foreground text-xs block mt-0.5">
                    {formatDateDisplay(checkInDate)}
                  </span>
                </div>
                <div className="p-3">
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-foreground-muted">
                    Check-Out
                  </span>
                  <span className="font-bold text-foreground text-xs block mt-0.5">
                    {formatDateDisplay(checkOutDate)}
                  </span>
                </div>
              </div>

              {/* Guest Counter */}
              <div className="p-3 bg-white flex items-center justify-between">
                <div>
                  <span className="block text-[9.5px] font-bold uppercase tracking-wider text-foreground-muted">
                    Jumlah Tamu
                  </span>
                  <span className="font-bold text-foreground text-xs">
                    {guestCount} Orang (Maks. {effectiveMaxCapacity})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={guestCount <= 1}
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-xs w-4 text-center">
                    {guestCount}
                  </span>
                  <button
                    type="button"
                    disabled={guestCount >= effectiveMaxCapacity}
                    onClick={() =>
                      setGuestCount(
                        Math.min(effectiveMaxCapacity, guestCount + 1),
                      )
                    }
                    className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            {availableAddons.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Perlengkapan Tambahan (Opsional)
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar text-xs">
                  {availableAddons.map((addon) => {
                    const qty = selectedAddons[addon.id] || 0;
                    const isTent = isTentAddon(addon);
                    const isTentDisabled = isTent && isTentPackage;
                    const isMaxTentReached =
                      isTent &&
                      !isTentPackage &&
                      totalTentsSelected >= kavlingCount;

                    const perNight = isAddonPerNight(addon);
                    const rawUnit = (addon.unit || '').trim();
                    const unitDisplay = rawUnit ? rawUnit : 'unit';
                    const priceSuffix = perNight
                      ? unitDisplay.toLowerCase() === 'malam'
                        ? '/ malam'
                        : `/ ${unitDisplay} / malam`
                      : `/ ${unitDisplay}`;

                    return (
                      <div
                        key={addon.id}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          isTentDisabled
                            ? 'border-border/60 bg-surface/20 opacity-70'
                            : 'border-border bg-surface/40'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-foreground text-[11.5px] truncate">
                              {addon.name}
                            </p>
                            {isTentDisabled && (
                              <span className="text-[9px] font-bold text-brand-blue bg-brand-blue/10 px-1.5 py-0.5 rounded-full">
                                Termasuk di Paket
                              </span>
                            )}
                            {isTent && !isTentPackage && (
                              <span className="text-[9px] font-semibold text-foreground-muted bg-surface px-1.5 py-0.5 rounded-full border border-border">
                                Maks. {kavlingCount} tenda ({kavlingCount}{' '}
                                kavling)
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-brand-blue font-bold mt-0.5">
                            +{rupiah(addon.price)}{' '}
                            <span className="text-[9.5px] font-normal text-foreground-muted">
                              {priceSuffix}
                            </span>
                          </p>
                        </div>

                        {!isTentDisabled ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={qty <= 0}
                              onClick={() => handleAddonQty(addon.id, -1)}
                              className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="font-bold text-xs w-3 text-center">
                              {qty}
                            </span>
                            <button
                              type="button"
                              disabled={isMaxTentReached}
                              onClick={() => handleAddonQty(addon.id, 1)}
                              className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] font-bold text-brand-blue shrink-0 px-2 py-1 bg-brand-blue/5 rounded-xl">
                            Included
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Calculation Breakdown */}
            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <div className="flex justify-between text-foreground-muted">
                <span>
                  {selectedPackage?.name || 'Sewa'} ({rupiah(spotPricePerNight)}{' '}
                  x {nights} malam)
                </span>
                <span className="font-semibold text-foreground">
                  {rupiah(spotPricePerNight * nights)}
                </span>
              </div>

              {addonTotal > 0 && (
                <div className="flex justify-between text-foreground-muted">
                  <span>Perlengkapan Tambahan</span>
                  <span className="font-semibold text-foreground">
                    +{rupiah(addonTotal)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-foreground-muted">
                <span>Biaya Layanan & Pajak</span>
                <span className="font-semibold text-emerald-600">Gratis</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-border font-bold text-sm text-foreground">
                <span>Total Tagihan</span>
                <span className="text-base text-brand-blue font-extrabold">
                  {rupiah(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Scheme Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Pilihan Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentScheme('DP_50')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentScheme === 'DP_50'
                      ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20'
                      : 'border-border bg-surface/50 hover:bg-surface'
                  }`}
                >
                  <span className="block text-xs font-bold text-foreground">
                    DP 50%
                  </span>
                  <span className="block text-xs font-extrabold text-brand-blue mt-0.5">
                    {rupiah(dp50Total)}
                  </span>
                  <span className="block text-[10px] text-foreground-muted mt-0.5">
                    Sisa di lokasi / aplikasi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentScheme('FULL')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentScheme === 'FULL'
                      ? 'border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20'
                      : 'border-border bg-surface/50 hover:bg-surface'
                  }`}
                >
                  <span className="block text-xs font-bold text-foreground">
                    Bayar Lunas
                  </span>
                  <span className="block text-xs font-extrabold text-foreground mt-0.5">
                    {rupiah(grandTotal)}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Lunas langsung
                  </span>
                </button>
              </div>
            </div>

            {orderError && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                {orderError}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={submittingOrder}
                onClick={handleProceedBooking}
                className="w-full py-3.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {submittingOrder
                    ? 'Memproses Pesanan...'
                    : `Pesan Sekarang · ${rupiah(paymentAmountToPay)}`}
                </span>
              </button>

              {/* Direct App Store & Google Play Features Box */}
              <div className="pt-3 border-t border-border space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    Pengalaman Terbaik di Aplikasi
                  </p>
                  <p className="text-[11px] text-foreground-muted leading-relaxed">
                    Tur 360° interaktif mulus, peta interaktif spot, fitur
                    gathering rombongan, dan e-tiket QR code otomatis di
                    aplikasi Embun.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <a
                    href={APP_STORE_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center gap-1.5 text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="currentColor"
                    >
                      <path d="M17.05 12.53c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.02 1.01 7.99.67.96 1.47 2.04 2.51 2 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.98 2.44-1.95.77-1.12 1.09-2.2 1.11-2.26-.02-.01-2.13-.82-2.15-3.24zM15.04 6.34c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
                    </svg>
                    <span className="text-[11px] font-bold">App Store</span>
                  </a>

                  <a
                    href={GOOGLE_PLAY_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-2xl border border-border bg-surface/60 hover:bg-surface flex items-center justify-center gap-1.5 text-foreground transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13">
                      <path
                        d="M3.6 2.3c-.24.25-.38.63-.38 1.13v17.14c0 .5.14.88.38 1.13l.06.05L13 12.06v-.12L3.66 2.25l-.06.05z"
                        fill="#00D0FF"
                      />
                      <path
                        d="M16.5 15.56 13 12.06v-.12l3.5-3.5.08.05 4.15 2.36c1.18.67 1.18 1.77 0 2.45l-4.15 2.36-.08.05z"
                        fill="#FFCE00"
                      />
                      <path
                        d="M16.58 15.51 13 12l-9.4 9.4c.39.41 1.03.46 1.76.05l11.22-6.44"
                        fill="#FF3D44"
                      />
                      <path
                        d="M16.58 8.49 5.36 2.05C4.63 1.64 3.99 1.69 3.6 2.1L13 11.5l3.58-3.01z"
                        fill="#00F076"
                      />
                    </svg>
                    <span className="text-[11px] font-bold">Google Play</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          9. GUEST AUTH MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      {isAuthOpen && (
        <GuestAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthOpen(false);
          }}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          10. AIRBNB-STYLE E-TIKET & INVOICE MODAL
      ════════════════════════════════════════════════════════════════════════ */}
      <BookingTicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        orderData={completedOrderData}
      />
    </div>
  );
}
