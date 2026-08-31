'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Star,
  MapPin,
  Users,
  BedDouble,
  Layers,
  Check,
  Calendar,
  Sparkles,
  ShieldCheck,
  Share2,
  Copy,
  ArrowRight,
  Compass,
  Camera,
  RotateCw,
  Smartphone,
  CreditCard,
  Building,
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
  const [paymentOption, setPaymentOption] = useState<'dp50' | 'full'>('dp50');
  const [copied, setCopied] = useState(false);

  // Date selection state
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

  const [failedPhotoUrls, setFailedPhotoUrls] = useState<Set<string>>(new Set());

  const panoramaRef = useRef<HTMLDivElement | null>(null);
  const panoViewerRef = useRef<any>(null);

  if (!spot) return null;

  // Extract & sort photos with accurate priority (Kamar Utama > Tampak Luar > Toilet Terakhir)
  const photos: string[] = (() => {
    const list: Array<{ url: string; score: number }> = [];
    if (Array.isArray(spot.photos) && spot.photos.length > 0) {
      spot.photos.forEach((p) => {
        if (p?.url && !failedPhotoUrls.has(p.url)) {
          const clean = (p.category || '').toLowerCase().trim();
          let score = 50;
          if (clean.includes('mandi') || clean.includes('toilet') || clean.includes('wc')) score = 99;
          else if (clean.includes('utama') || clean.includes('tenda') || clean.includes('kamar')) score = 1;
          else if (clean.includes('luar') || clean.includes('pemandangan') || clean.includes('view')) score = 2;
          else if (clean.includes('balkon') || clean.includes('santai')) score = 3;
          list.push({ url: p.url, score });
        }
      });
    }
    if (list.length === 0 && Array.isArray(spot.images)) {
      spot.images.forEach((img) => {
        if (img && !failedPhotoUrls.has(img)) list.push({ url: img, score: 50 });
      });
    }
    return list.sort((a, b) => a.score - b.score).map((item) => item.url);
  })();

  const panoramaList = spot.panoramaPhotos || [];

  // Init 360 viewer
  useEffect(() => {
    if (viewMode !== '360' || panoramaList.length === 0) return;
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
      panoViewerRef.current = p.viewer(panoramaRef.current, {
        type: 'equirectangular',
        panorama: resolveAssetUrl(firstPano.imageUrl || firstPano.url),
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
  }, [viewMode, panoramaList]);

  // Deep Link CTA Handlers
  const handleOpenApp = () => {
    const blockIdentifier = spot.shareCode || spot.id;
    window.location.href = `embun://spot?blockId=${encodeURIComponent(
      blockIdentifier,
    )}`;
  };

  const handleShareWhatsApp = () => {
    const shareUrl = `https://link.embun.app/spot/${spot.shareCode || spot.id}`;
    const text = `Halo! Lihat penginapan ${spot.name} di ${
      spot.campsite.name
    }. Tarif mulai ${rupiah(
      spot.weekdayPrice,
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

  const totalNights = 1;
  const totalPrice = spot.weekdayPrice * totalNights;
  const payAmount = paymentOption === 'dp50' ? totalPrice * 0.5 : totalPrice;

  return (
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
                    <RotateCw size={12} className="text-brand-lime animate-spin" />
                    <span>Geser untuk melihat 360°</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  {photos.length > 0 ? (
                    <img
                      src={resolveAssetUrl(photos[photoIdx])}
                      alt={spot.name}
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
                <span className="truncate">{spot.bedType || 'Bawa Sendiri'}</span>
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

          {/* 3. Booking Options & Date Selection */}
          <div className="p-5 rounded-2xl bg-surface/60 border border-border space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground-muted">
              Pilih Tanggal & Skema Pembayaran
            </h4>

            {/* Date Inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-brand-blue"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-foreground-muted mb-1">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-foreground focus:outline-none focus:border-brand-blue"
                />
              </div>
            </div>

            {/* DP 50% vs Lunas Selection */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaymentOption('dp50')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
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
                  {rupiah(totalPrice * 0.5)}
                </p>
                <p className="text-[10px] text-foreground-muted mt-0.5">
                  Sisa pelunasan di lokasi camp
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption('full')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
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
                  {rupiah(totalPrice)}
                </p>
                <p className="text-[10px] text-foreground-muted mt-0.5">
                  Bebas urusan saat check-in
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="p-4 sm:p-5 border-t border-border bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <p className="text-[11px] text-foreground-muted">Total Pembayaran</p>
            <p className="text-xl font-black text-brand-blue">
              {rupiah(payAmount)}
              {paymentOption === 'dp50' && (
                <span className="text-xs font-normal text-emerald-700 ml-1.5">
                  (DP 50%)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleOpenApp}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone size={16} />
              <span>Buka & Pesan di App</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
