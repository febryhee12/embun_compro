'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
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
  const [viewMode, setViewMode] = useState<'photo' | '360'>('photo');
  const [photoIdx, setPhotoIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);

  const [failedPhotoUrls, setFailedPhotoUrls] = useState<Set<string>>(
    new Set(),
  );
  const panoramaRef = useRef<HTMLDivElement | null>(null);
  const panoViewerRef = useRef<any>(null);

  // Reset photo index and view mode on spot change
  useEffect(() => {
    setPhotoIdx(0);
    setViewMode('photo');
    setCopied(false);
    setIsDownloadDialogOpen(false);
  }, [spot?.id]);

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

  // Calculate starting price from packages / rates
  const startingPrice = useMemo(() => {
    if (!spot) return 0;
    if (
      Array.isArray((spot as any).pricingPackages) &&
      (spot as any).pricingPackages.length > 0
    ) {
      const prices: number[] = [];
      (spot as any).pricingPackages.forEach((pkg: any) => {
        if (pkg.flatRateMode && pkg.flatRate && Number(pkg.flatRate) > 0) {
          prices.push(Number(pkg.flatRate));
        } else if (pkg.weekdayRate && Number(pkg.weekdayRate) > 0) {
          prices.push(Number(pkg.weekdayRate));
        } else if (pkg.weekendRate && Number(pkg.weekendRate) > 0) {
          prices.push(Number(pkg.weekendRate));
        } else if (pkg.flatRate && Number(pkg.flatRate) > 0) {
          prices.push(Number(pkg.flatRate));
        }
      });
      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }
    if (spot.weekdayPrice && Number(spot.weekdayPrice) > 0) {
      return Number(spot.weekdayPrice);
    }
    if (spot.weekendPrice && Number(spot.weekendPrice) > 0) {
      return Number(spot.weekendPrice);
    }
    return 0;
  }, [spot]);

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

  const handleShareWhatsApp = () => {
    const shareUrl = `https://link.embun.app/spot/${spot.shareCode || spot.id}`;
    const text = `Halo! Lihat penginapan ${spot.name} di ${
      spot.campsite.name
    }. Tarif mulai dari ${rupiah(
      startingPrice,
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

  const packages: any[] = Array.isArray((spot as any).pricingPackages)
    ? (spot as any).pricingPackages
    : [];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-4xl bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
          {/* Top Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-base text-foreground">
                {spot.name}
              </h3>
              <p className="text-xs text-foreground-muted">{spot.campsite.name}</p>
            </div>

            <div className="flex items-center gap-2">
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
            {/* 1. Media Carousel / 360 Viewer */}
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

            {/* 3. Pilihan Paket Harga */}
            {packages.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground-muted">
                  Pilihan Paket & Tarif Sewa
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.map((pkg: any, idx: number) => {
                    const price = pkg.flatRateMode
                      ? pkg.flatRate
                      : pkg.weekdayRate || pkg.flatRate;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-surface/70 border border-border flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-bold text-xs text-foreground">
                              {pkg.name}
                            </h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue">
                              {pkg.pricingModel || 'Paket Unit'}
                            </span>
                          </div>
                          {pkg.description && (
                            <p className="text-[11px] text-foreground-muted line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/60 flex items-baseline justify-between">
                          <span className="text-[11px] text-foreground-muted">
                            Tarif Paket
                          </span>
                          <p className="font-black text-sm text-brand-blue">
                            {rupiah(price)}
                            <span className="text-[10px] font-normal text-foreground-muted ml-1">
                              / malam
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Fasilitas Unit */}
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

            {/* 5. Info Pemesanan Melalui Aplikasi */}
            <div className="p-4 rounded-2xl bg-brand-blue/5 border border-brand-blue/20 flex items-start gap-3">
              <Info size={18} className="text-brand-blue shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-foreground">
                  Pilih Kavling di Peta & Booking Instan
                </p>
                <p className="text-foreground-muted leading-relaxed">
                  Gunakan aplikasi Embun untuk memilih posisi unit di peta
                  interaktif, cek ketersediaan tanggal, dan dapatkan konfirmasi E-Pass instan.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="p-4 sm:p-5 border-t border-border bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div>
              <p className="text-[11px] text-foreground-muted">Tarif Sewa Mulai</p>
              <p className="text-xl font-black text-brand-blue">
                {rupiah(startingPrice)}
                <span className="text-xs font-normal text-foreground-muted ml-1">
                  / malam
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="p-3 rounded-2xl border border-border hover:bg-surface text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Bagikan ke WhatsApp"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAppDirect}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Smartphone size={16} />
                <span>Buka & Pesan di App</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
                Pilih unit <strong className="text-foreground">{spot.name}</strong> langsung di peta interaktif {spot.campsite.name}, pilih tanggal menginap, dan lakukan pembayaran aman.
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
