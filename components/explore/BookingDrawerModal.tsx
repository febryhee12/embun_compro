'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Star,
  Users,
  BedDouble,
  Check,
  Share2,
  Copy,
  Compass,
  Camera,
  RotateCw,
  Smartphone,
  Download,
  Calendar,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building,
  Clock,
  Sparkles,
  Map as MapIcon,
  Plus,
  Minus,
  ExternalLink,
  Package,
  Info,
} from 'lucide-react';
import { resolveAssetUrl, rupiah } from '@/lib/api-client';
import { SpotData } from './SpotCard';

interface BookingDrawerModalProps {
  spot: SpotData | null;
  onClose: () => void;
  onOpenAuth: () => void;
  currentUser: any | null;
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  icon?: string;
}

const DEFAULT_ADDONS: AddonItem[] = [
  {
    id: 'extra-tent',
    name: 'Tenda Tambahan (Kapasitas 4 Orang)',
    price: 80000,
    description: 'Tenda dome double layer tahan air & angin',
  },
  {
    id: 'sleeping-bag',
    name: 'Sleeping Bag Hangat',
    price: 20000,
    description: 'Bahan fleece tebal nyaman untuk cuaca dingin',
  },
  {
    id: 'matras-extra',
    name: 'Matras Angin / Kasur Tambahan',
    price: 25000,
    description: 'Matras empuk lengkap dengan bantal',
  },
  {
    id: 'bbq-set',
    name: 'Paket Alat Grill BBQ & Arang',
    price: 60000,
    description: 'Panggangan, capitan, dan 1 pack arang batok',
  },
  {
    id: 'kayu-bakar',
    name: 'Kayu Bakar Api Unggun (1 Ikat)',
    price: 30000,
    description: 'Kayu kering mudah dinyalakan untuk api unggun',
  },
  {
    id: 'breakfast',
    name: 'Paket Sarapan Pagi (Nasi Goreng / Roti)',
    price: 25000,
    description: 'Termasuk teh hangat / kopi untuk 1 porsi',
  },
];

function getPackageModelLabel(model?: string): string {
  if (!model) return 'Paket Pilihan';
  const clean = model.toUpperCase().trim();
  if (clean.includes('SPOT_ONLY')) return 'Sewa Kavling Saja';
  if (clean.includes('FIXED_CAPACITY')) return 'Paket Lengkap Unit';
  if (clean.includes('PER_PERSON')) return 'Tarif Per Orang';
  if (clean.includes('PER_TENT')) return 'Tarif Per Tenda';
  return 'Paket Pilihan';
}

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

export function BookingDrawerModal({
  spot,
  onClose,
  onOpenAuth,
  currentUser,
}: BookingDrawerModalProps) {
  const [viewMode, setViewMode] = useState<'photo' | '360' | 'map'>('photo');
  const [photoIdx, setPhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  // Unified Date State with Validation
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });

  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const minCheckOutStr = useMemo(() => {
    try {
      const d = new Date(checkInDate);
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return todayStr;
    }
  }, [checkInDate, todayStr]);

  const handleCheckInChange = (newCheckIn: string) => {
    setCheckInDate(newCheckIn);
    const d1 = new Date(newCheckIn);
    const d2 = new Date(checkOutDate);
    if (isNaN(d2.getTime()) || d2 <= d1) {
      const nextDay = new Date(d1);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    const d1 = new Date(checkInDate);
    const d2 = new Date(newCheckOut);
    if (d2 <= d1) {
      const nextDay = new Date(d1);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay.toISOString().split('T')[0]);
    } else {
      setCheckOutDate(newCheckOut);
    }
  };

  const [selectedPackageIdx, setSelectedPackageIdx] = useState(0);
  const [paymentOption, setPaymentOption] = useState<'dp50' | 'full'>('dp50');

  // Addons State
  const [addonQuantities, setAddonQuantities] = useState<Record<string, number>>({});

  const handleAddonQtyChange = (addonId: string, delta: number) => {
    setAddonQuantities((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[addonId];
        return copy;
      }
      return { ...prev, [addonId]: next };
    });
  };

  // Guest Information
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);

  const [failedPhotoUrls, setFailedPhotoUrls] = useState<Set<string>>(
    new Set(),
  );
  const panoramaRef = useRef<HTMLDivElement | null>(null);
  const panoViewerRef = useRef<any>(null);

  // Reset state on spot change
  useEffect(() => {
    setPhotoIdx(0);
    setViewMode('photo');
    setCopied(false);
    setIsDownloadDialogOpen(false);
    setSelectedPackageIdx(0);
    setAddonQuantities({});
    setBookingSuccessData(null);
    if (currentUser) {
      setGuestName(currentUser.fullName || currentUser.name || '');
      setGuestPhone(currentUser.phoneNumber || currentUser.phone || '');
      setGuestEmail(currentUser.email || '');
    }
  }, [spot?.id, currentUser]);

  // Extract & sort photos with accurate priority (Kamar Utama > Tampak Luar > Toilet Terakhir)
  const photos: string[] = useMemo(() => {
    if (!spot) return [];
    const list: Array<{ url: string; score: number }> = [];
    if (Array.isArray(spot.photos) && spot.photos.length > 0) {
      spot.photos.forEach((p) => {
        if (p?.url && !failedPhotoUrls.has(p.url)) {
          const clean = (p.category || '').toLowerCase().trim();
          let score = 50;
          if (
            clean.includes('mandi') ||
            clean.includes('toilet') ||
            clean.includes('wc')
          )
            score = 99;
          else if (
            clean.includes('utama') ||
            clean.includes('tenda') ||
            clean.includes('kamar')
          )
            score = 1;
          else if (
            clean.includes('luar') ||
            clean.includes('pemandangan') ||
            clean.includes('view')
          )
            score = 2;
          else if (clean.includes('balkon') || clean.includes('santai'))
            score = 3;
          list.push({ url: p.url, score });
        }
      });
    }
    if (list.length === 0 && Array.isArray(spot.images)) {
      spot.images.forEach((img) => {
        if (img && !failedPhotoUrls.has(img))
          list.push({ url: img, score: 50 });
      });
    }
    return list.sort((a, b) => a.score - b.score).map((item) => item.url);
  }, [spot, failedPhotoUrls]);

  const panoramaList = useMemo(() => spot?.panoramaPhotos || [], [spot]);

  // Init 360 viewer
  useEffect(() => {
    if (!spot || viewMode !== '360' || panoramaList.length === 0) return;
    let cancelled = false;

    const init = async () => {
      const p = await loadPannellum();
      if (cancelled || !p || !panoramaRef.current) return;
      if (panoViewerRef.current) {
        try {
          panoViewerRef.current.destroy();
        } catch {}
      }
      const firstPano = panoramaList[0];
      const panoUrl =
        typeof firstPano === 'string'
          ? firstPano
          : firstPano?.imageUrl || firstPano?.url || '';
      if (!panoUrl) return;
      panoViewerRef.current = p.viewer(panoramaRef.current, {
        type: 'equirectangular',
        panorama: resolveAssetUrl(panoUrl),
        autoLoad: true,
        autoRotate: -2,
        compass: true,
        hfov: 100,
      });
    };

    void init();

    return () => {
      cancelled = true;
      if (panoViewerRef.current) {
        try {
          panoViewerRef.current.destroy();
        } catch {}
        panoViewerRef.current = null;
      }
    };
  }, [spot, viewMode, panoramaList]);

  const packages: any[] = useMemo(() => {
    if (!spot) return [];
    return Array.isArray((spot as any).pricingPackages)
      ? (spot as any).pricingPackages
      : [];
  }, [spot]);

  // Available Addons List
  const availableAddons: AddonItem[] = useMemo(() => {
    if (!spot) return DEFAULT_ADDONS;
    if (Array.isArray(spot.campsite?.addons) && spot.campsite.addons.length > 0) {
      return spot.campsite.addons.map((a: any) => ({
        id: a.id || a.name,
        name: a.name,
        price: Number(a.price || 0),
        description: a.description || '',
      }));
    }
    return DEFAULT_ADDONS;
  }, [spot]);

  // Calculate nights
  const totalNights = useMemo(() => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }, [checkInDate, checkOutDate]);

  // Calculate active rate per night
  const activeRatePerNight = useMemo(() => {
    if (!spot) return 0;
    if (packages.length > 0 && packages[selectedPackageIdx]) {
      const pkg = packages[selectedPackageIdx];
      if (pkg.flatRateMode && pkg.flatRate) return Number(pkg.flatRate);
      if (pkg.weekdayRate && Number(pkg.weekdayRate) > 0) return Number(pkg.weekdayRate);
      if (pkg.flatRate && Number(pkg.flatRate) > 0) return Number(pkg.flatRate);
    }
    if (spot.weekdayPrice && Number(spot.weekdayPrice) > 0) {
      return Number(spot.weekdayPrice);
    }
    if (spot.weekendPrice && Number(spot.weekendPrice) > 0) {
      return Number(spot.weekendPrice);
    }
    return 0;
  }, [spot, packages, selectedPackageIdx]);

  // Addons total
  const addonsTotal = useMemo(() => {
    let sum = 0;
    Object.entries(addonQuantities).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const item = availableAddons.find((a) => a.id === addonId);
        if (item) {
          sum += item.price * qty;
        }
      }
    });
    return sum;
  }, [addonQuantities, availableAddons]);

  const subtotalPrice = activeRatePerNight * totalNights + addonsTotal;
  const payAmount = paymentOption === 'dp50' ? subtotalPrice * 0.5 : subtotalPrice;

  // Early return if no spot selected
  if (!spot) return null;

  const handleOpenAppDirect = () => {
    const blockIdentifier = spot.shareCode || spot.id;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `embun://spot?blockId=${encodeURIComponent(
        blockIdentifier,
      )}`;
      setTimeout(() => {
        setIsDownloadDialogOpen(true);
      }, 1800);
    } else {
      setIsDownloadDialogOpen(true);
    }
  };

  const handleOpenStandalonePage = () => {
    const shareUrl = `https://link.embun.app/spot/${spot.shareCode || spot.id}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareWhatsApp = () => {
    const shareUrl = `https://link.embun.app/spot/${spot.shareCode || spot.id}`;
    const text = `Halo! Lihat penginapan ${spot.name} di ${
      spot.campsite.name
    }. Tarif mulai dari ${rupiah(
      activeRatePerNight,
    )}/malam. Pesan di: ${shareUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  const handleCopy = () => {
    const shareUrl = `https://link.embun.app/spot/${spot.shareCode || spot.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitWebBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Mohon masukkan nama lengkap pemesan.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 8) {
      alert('Mohon masukkan nomor WhatsApp yang aktif.');
      return;
    }

    setIsSubmitting(true);
    const bookingCode = `EMB-${Date.now().toString().slice(-6)}`;
    const selectedPackage = packages[selectedPackageIdx]?.name || 'Paket Standar Unit';

    setTimeout(() => {
      setIsSubmitting(false);
      setBookingSuccessData({
        bookingCode,
        guestName,
        guestPhone,
        guestEmail,
        checkInDate,
        checkOutDate,
        totalNights,
        selectedPackage,
        paymentOption,
        payAmount,
        subtotalPrice,
        addonsTotal,
        addonQuantities,
      });
    }, 600);
  };

  const mapImage = spot.campsite?.mapImageUrl || (spot as any).mapImageUrl;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-4xl bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
          {/* Top Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  {spot.name}
                </h3>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                  <Star size={12} className="fill-amber-500 text-amber-500" />
                  <span>5.0</span>
                </div>
              </div>
              <p className="text-xs text-foreground-muted">{spot.campsite.name}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenStandalonePage}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer hidden sm:flex"
                title="Buka Halaman Mandiri"
              >
                <ExternalLink size={18} />
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                title="Bagikan ke WhatsApp"
              >
                <Share2 size={18} />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
                title="Salin Link"
              >
                {copied ? (
                  <Check size={18} className="text-emerald-600" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* 1. Media Carousel / 360 Viewer / Peta Kavling */}
            <div className="space-y-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('photo')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'photo'
                      ? 'bg-brand-blue text-white shadow-xs'
                      : 'bg-surface text-foreground hover:bg-surface-variant'
                  }`}
                >
                  <Camera size={13} />
                  <span>Foto ({photos.length})</span>
                </button>

                {panoramaList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('360')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === '360'
                        ? 'bg-brand-lime text-black shadow-xs font-black'
                        : 'bg-surface text-foreground hover:bg-surface-variant'
                    }`}
                  >
                    <Compass size={13} />
                    <span>Tur 360° Virtual</span>
                  </button>
                )}

                {mapImage && (
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === 'map'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-surface text-foreground hover:bg-surface-variant'
                    }`}
                  >
                    <MapIcon size={13} />
                    <span>Peta Kavling</span>
                  </button>
                )}
              </div>

              {/* Media Canvas Box */}
              <div className="relative aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black border border-border shadow-xs">
                {viewMode === '360' && panoramaList.length > 0 ? (
                  <div className="w-full h-full relative">
                    <div
                      ref={panoramaRef}
                      className="w-full h-full cursor-grab active:cursor-grabbing"
                    />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-[11px] text-white flex items-center gap-1.5 pointer-events-none">
                      <RotateCw
                        size={12}
                        className="text-brand-lime animate-spin"
                      />
                      <span>Geser untuk melihat 360°</span>
                    </div>
                  </div>
                ) : viewMode === 'map' && mapImage ? (
                  <div className="w-full h-full relative bg-[#1c2430] flex items-center justify-center p-2">
                    <img
                      src={resolveAssetUrl(mapImage)}
                      alt={`Peta ${spot.campsite.name}`}
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-[11px] text-white flex items-center gap-2 pointer-events-none">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Posisi: <strong>{spot.name}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {photos.length > 0 ? (
                      <img
                        src={resolveAssetUrl(photos[photoIdx])}
                        alt={spot.name}
                        onError={() => {
                          setFailedPhotoUrls(
                            (prev) => new Set([...prev, photos[photoIdx]]),
                          );
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                        Foto belum tersedia
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Photo Thumbnail Strip */}
              {viewMode === 'photo' && photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {photos.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoIdx(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        photoIdx === idx
                          ? 'border-brand-blue scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={resolveAssetUrl(url)}
                        alt={`Thumb ${idx}`}
                        onError={() => {
                          setFailedPhotoUrls(
                            (prev) => new Set([...prev, url]),
                          );
                        }}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Unit Specs & Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-4 rounded-2xl border border-border">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase">
                  Kapasitas
                </span>
                <p className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Users size={13} className="text-brand-blue" />
                  Maks. {spot.maxCapacity} Orang
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase">
                  Kasur
                </span>
                <p className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                  <BedDouble size={13} className="text-brand-blue shrink-0" />
                  <span className="truncate">
                    {spot.bedType || 'Bawa Sendiri'}
                  </span>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase">
                  Ukuran
                </span>
                <p className="text-xs font-bold text-foreground">
                  {spot.roomSize || '5x7 meter'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-foreground-muted uppercase">
                  Jenis Spot
                </span>
                <p className="text-xs font-bold text-foreground">
                  {spot.tentType || 'Glamping'}
                </p>
              </div>
            </div>

            {/* 3. FORM PEMESANAN RINGAN (WEB BOOKING) */}
            <div className="p-5 rounded-3xl bg-surface/80 border border-border space-y-6">
              {/* Step 1: Unified Date Picker with Cross-Validation */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Calendar size={14} className="text-brand-blue" />
                    1. Tanggal Menginap
                  </h4>
                  <span className="text-[11px] font-bold text-brand-blue bg-brand-blue/10 px-2.5 py-0.5 rounded-full">
                    {totalNights} Malam
                  </span>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-border grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                      Tanggal Check-In
                    </span>
                    <input
                      type="date"
                      min={todayStr}
                      value={checkInDate}
                      onChange={(e) => handleCheckInChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border/80 bg-surface/40 text-foreground font-semibold text-xs focus:outline-none focus:border-brand-blue"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">
                      Tanggal Check-Out
                    </span>
                    <input
                      type="date"
                      min={minCheckOutStr}
                      value={checkOutDate}
                      onChange={(e) => handleCheckOutChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border/80 bg-surface/40 text-foreground font-semibold text-xs focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Pilihan Paket Harga */}
              {packages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-brand-blue" />
                    2. Pilihan Paket Sewa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {packages.map((pkg: any, idx: number) => {
                      const isSelected = selectedPackageIdx === idx;
                      const price = pkg.flatRateMode
                        ? pkg.flatRate
                        : pkg.weekdayRate || pkg.flatRate;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPackageIdx(idx)}
                          className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue shadow-xs'
                              : 'bg-white border-border hover:border-brand-blue/40'
                          }`}
                        >
                          <div className="space-y-1.5 w-full">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-bold text-xs text-foreground">
                                {pkg.name}
                              </h5>
                              <span
                                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                                  isSelected
                                    ? 'bg-brand-blue text-white'
                                    : 'bg-surface-variant text-foreground-muted'
                                }`}
                              >
                                {getPackageModelLabel(pkg.pricingModel)}
                              </span>
                            </div>
                            {pkg.description && (
                              <p className="text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">
                                {pkg.description}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-border/60 flex items-baseline justify-between w-full">
                            <span className="text-[11px] text-foreground-muted">
                              Tarif / malam
                            </span>
                            <p className="font-black text-sm text-brand-blue">
                              {rupiah(price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Tambahan Perlengkapan / Add-on */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Package size={14} className="text-brand-blue" />
                    3. Tambahan Perlengkapan / Add-on (Opsional)
                  </h4>
                  {addonsTotal > 0 && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      + {rupiah(addonsTotal)}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {availableAddons.map((addon) => {
                    const qty = addonQuantities[addon.id] || 0;
                    return (
                      <div
                        key={addon.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          qty > 0
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-white border-border/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-foreground">
                            {addon.name}
                          </p>
                          {addon.description && (
                            <p className="text-[10.5px] text-foreground-muted">
                              {addon.description}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-brand-blue">
                            {rupiah(addon.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAddonQtyChange(addon.id, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-xl border border-border bg-surface hover:bg-surface-variant disabled:opacity-30 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-foreground"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-5 text-center font-bold text-xs text-foreground">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddonQtyChange(addon.id, 1)}
                            className="w-7 h-7 rounded-xl border border-brand-blue bg-brand-blue hover:bg-brand-blue-hover text-white flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Skema Pembayaran (DP 50% vs Lunas) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CreditCard size={14} className="text-brand-blue" />
                  4. Skema Pembayaran
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('dp50')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentOption === 'dp50'
                        ? 'bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue'
                        : 'bg-white border-border hover:border-brand-blue/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-foreground">
                        Bayar DP 50%
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Hemat Awal
                      </span>
                    </div>
                    <p className="text-sm font-black text-brand-blue">
                      {rupiah(subtotalPrice * 0.5)}
                    </p>
                    <p className="text-[10px] text-foreground-muted mt-0.5">
                      Sisa pelunasan di lokasi camp
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentOption('full')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentOption === 'full'
                        ? 'bg-brand-blue/10 border-brand-blue ring-1 ring-brand-blue'
                        : 'bg-white border-border hover:border-brand-blue/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-foreground">
                        Bayar Lunas 100%
                      </span>
                    </div>
                    <p className="text-sm font-black text-brand-blue">
                      {rupiah(subtotalPrice)}
                    </p>
                    <p className="text-[10px] text-foreground-muted mt-0.5">
                      Bebas urusan saat check-in
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 5: Form Identitas Tamu */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Users size={14} className="text-brand-blue" />
                  5. Data Pemesan (Untuk Pengiriman E-Pass)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                      Nomor WhatsApp (Aktif) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081234567890"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-brand-blue"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Fasilitas Unit */}
            {Array.isArray(spot.facilities) && spot.facilities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground-muted">
                  Fasilitas Unit
                </h4>
                <div className="flex flex-wrap gap-2">
                  {spot.facilities.map((fac, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-foreground font-semibold flex items-center gap-1.5"
                    >
                      <Check size={13} className="text-emerald-600 shrink-0" />
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 sm:p-5 border-t border-border bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-[11px] text-foreground-muted">
                Total Pembayaran ({totalNights} Malam{addonsTotal > 0 ? ' + Add-on' : ''})
              </p>
              <p className="text-xl font-black text-brand-blue">
                {rupiah(payAmount)}
                {paymentOption === 'dp50' && (
                  <span className="text-xs font-semibold text-emerald-700 ml-1.5">
                    (DP 50%)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleOpenAppDirect}
                className="px-4 py-3 rounded-2xl border border-border hover:bg-surface text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Buka di Aplikasi untuk memilih di peta interaktif"
              >
                <Smartphone size={15} />
                <span className="hidden sm:inline">Peta App</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitWebBooking}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting ? 'Memproses...' : `Pesan & Bayar via Web`}
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dialog Sukses Pemesanan Web ── */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white text-foreground rounded-3xl shadow-2xl border border-border p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Pesanan Berhasil Disiapkan!
              </h3>
              <p className="text-xs text-foreground-muted">
                Kode Referensi:{' '}
                <strong className="text-brand-blue font-mono font-bold">
                  {bookingSuccessData.bookingCode}
                </strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Unit & Campsite</span>
                <span className="font-bold text-foreground text-right">
                  {spot.name} · {spot.campsite.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Tanggal</span>
                <span className="font-semibold text-foreground">
                  {bookingSuccessData.checkInDate} s/d {bookingSuccessData.checkOutDate} ({bookingSuccessData.totalNights} Malam)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Pemesan</span>
                <span className="font-semibold text-foreground">
                  {bookingSuccessData.guestName} ({bookingSuccessData.guestPhone})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/80">
                <span className="font-bold text-foreground">
                  Total Tagihan {bookingSuccessData.paymentOption === 'dp50' ? '(DP 50%)' : '(Lunas)'}
                </span>
                <span className="font-black text-brand-blue text-sm">
                  {rupiah(bookingSuccessData.payAmount)}
                </span>
              </div>
            </div>

            {/* WhatsApp Confirmation & App CTA */}
            <div className="space-y-2.5">
              <a
                href={`https://api.whatsapp.com/send?phone=6282122650058&text=${encodeURIComponent(
                  `Halo Embun! Saya ingin konfirmasi pemesanan via Web:\nKode: ${bookingSuccessData.bookingCode}\nNama: ${bookingSuccessData.guestName}\nSpot: ${spot.name} (${spot.campsite.name})\nTanggal: ${bookingSuccessData.checkInDate} s/d ${bookingSuccessData.checkOutDate}\nSkema: ${bookingSuccessData.paymentOption === 'dp50' ? 'DP 50%' : 'Lunas 100%'}\nNominal: ${rupiah(bookingSuccessData.payAmount)}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <Share2 size={16} />
                <span>Konfirmasi Pembayaran via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setBookingSuccessData(null);
                  setIsDownloadDialogOpen(true);
                }}
                className="w-full py-3 px-4 rounded-2xl border border-border bg-surface hover:bg-surface-variant text-foreground font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <Smartphone size={16} className="text-brand-blue" />
                <span>Buka Tiket di Aplikasi Embun</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setBookingSuccessData(null);
                onClose();
              }}
              className="w-full text-center text-xs text-foreground-muted hover:text-foreground pt-1 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ── Dialog Install / Buka Aplikasi Embun ── */}
      {isDownloadDialogOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white text-foreground rounded-3xl shadow-2xl border border-border p-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logo/primary_blue.svg"
                  alt="Embun"
                  className="h-6 w-auto object-contain"
                />
                <span className="font-bold text-sm text-foreground">
                  Aplikasi Embun
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsDownloadDialogOpen(false)}
                className="p-1.5 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-brand-blue/10 text-brand-blue mx-auto flex items-center justify-center border-2 border-brand-blue/20">
                <Smartphone size={32} />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Lanjutkan di Aplikasi Embun
              </h3>
              <p className="text-xs text-foreground-muted max-w-xs mx-auto leading-relaxed">
                Pilih unit <strong className="text-foreground">{spot.name}</strong> langsung di peta interaktif {spot.campsite.name}, pilih tanggal menginap, dan dapatkan E-Pass instan.
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={`embun://spot?blockId=${encodeURIComponent(
                  spot.shareCode || spot.id,
                )}`}
                className="w-full py-3.5 px-4 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 text-center"
              >
                <Smartphone size={16} />
                <span>Buka di Aplikasi (Sudah Terpasang)</span>
              </a>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="https://play.google.com/store/apps/details?id=app.embun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl border border-border bg-surface hover:bg-surface-variant text-foreground font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span>Google Play</span>
                </a>
                <a
                  href="https://apps.apple.com/app/embun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl border border-border bg-surface hover:bg-surface-variant text-foreground font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                >
                  <Download size={14} className="text-brand-blue" />
                  <span>App Store</span>
                </a>
              </div>
            </div>

            <p className="text-[11px] text-center text-foreground-muted">
              Tersedia gratis untuk Android dan iOS.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

