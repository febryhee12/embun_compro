'use client';

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
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
  ArrowLeft,
} from "lucide-react";
import {
  getStoredGuestProfile,
  createPublicBookingOrder,
  initiateMidtransSnapPayment,
  resolveAssetUrl,
  rupiah,
} from "@/lib/api-client";
import { BookingCalendarModal } from "@/components/explore/BookingCalendarModal";
import { GuestAuthModal } from "@/components/explore/GuestAuthModal";

const APP_STORE_HREF = "https://apps.apple.com/app/embun";
const GOOGLE_PLAY_HREF =
  "https://play.google.com/store/apps/details?id=app.embun";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api-staging.embun.app/api";

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

function resolveTokenFromPath(pathname: string): string | null {
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const qToken =
      params.get("token") ||
      params.get("spotId") ||
      params.get("id") ||
      params.get("blockId");
    if (qToken) return qToken;
  }
  const segments = pathname.split("/").filter(Boolean);
  const spotIdx = segments.indexOf("spot");
  if (spotIdx !== -1 && segments[spotIdx + 1]) {
    return segments[spotIdx + 1];
  }
  return null;
}

function loadPannellum(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).pannellum) {
      return resolve((window as any).pannellum);
    }
    if (!document.querySelector("link[data-pannellum]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
      link.setAttribute("data-pannellum", "1");
      document.head.appendChild(link);
    }
    if (!document.querySelector("script[data-pannellum]")) {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
      script.setAttribute("data-pannellum", "1");
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

function getPackageModelLabel(model?: string): string {
  switch (model) {
    case "SPOT_ONLY":
      return "Sewa Kavling Saja (Bawa Tenda Sendiri)";
    case "FIXED_CAPACITY_PACKAGE":
      return "Paket Lengkap Unit Termasuk Tenda & Matras";
    case "PER_PERSON":
      return "Tarif Dihitung Per Orang";
    case "PER_TENT":
      return "Tarif Dihitung Per Tenda";
    default:
      return "Paket Unit Lengkap";
  }
}

export function SpotRedirectClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campsite, setCampsite] = useState<CampsiteDetail | null>(null);
  const [activeSpot, setActiveSpot] = useState<SpotItem | null>(null);

  // Gallery & 360 Lightbox state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<"photos" | "360" | "map">("photos");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activePanoramaIdx, setActivePanoramaIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Booking & Date picker state (Airbnb style)
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(2);
  const [paymentScheme, setPaymentScheme] = useState<"DP_50" | "FULL">("DP_50");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
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
              }
              return;
            }
          }
          throw new Error("Unit atau penginapan tidak ditemukan.");
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
        if (matched && camp) {
          document.title = `${matched.name} · ${camp.name} | Embun`;
        }
      } catch (err: any) {
        setError(err.message || "Gagal memuat rincian properti.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  // Sync check-in & check-out cross-validation
  const handleCheckInChange = (newVal: string) => {
    setCheckInDate(newVal);
    if (newVal >= checkOutDate) {
      const d = new Date(newVal);
      d.setDate(d.getDate() + 1);
      setCheckOutDate(d.toISOString().split("T")[0]);
    }
  };

  // Calculate Night Duration
  const nights = useMemo(() => {
    try {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diff = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  }, [checkInDate, checkOutDate]);

  // Sort and extract photos
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
        if (img) list.push({ url: img, category: "Foto Unit" });
      });
    }

    if (list.length === 0 && Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
        if (p?.url) list.push(p);
      });
    }

    const priorities = [
      "Tampak Luar / Pemandangan",
      "Kamar Utama / Tenda",
      "Ruang Santai / Balkon",
      "Fasilitas Lainnya",
      "Kamar Mandi / Toilet",
    ];

    return list.sort((a, b) => {
      const idxA = priorities.indexOf(a.category || "");
      const idxB = priorities.indexOf(b.category || "");
      const scoreA = idxA === -1 ? 99 : idxA;
      const scoreB = idxB === -1 ? 99 : idxB;
      return scoreA - scoreB;
    });
  }, [activeSpot, campsite]);

  // Extract 360 Panoramas
  const panoramaList = useMemo(() => {
    if (!activeSpot) return [];
    const list: PanoramaItem[] = [];

    if (Array.isArray(activeSpot.panoramaPhotos)) {
      activeSpot.panoramaPhotos.forEach((p: any) => {
        if (p?.imageUrl || p?.url) {
          list.push({
            id: p.id || String(Math.random()),
            label: p.label || p.category || "Tur 360° Unit",
            imageUrl: p.imageUrl || p.url,
            category: p.category,
          });
        }
      });
    }

    if (Array.isArray(campsite?.photos)) {
      campsite?.photos.forEach((p) => {
        if (
          p.category?.toLowerCase().includes("360") ||
          p.category?.toLowerCase().includes("panorama")
        ) {
          list.push({
            id: p.id,
            label: "Panorama Area Camp",
            imageUrl: p.url,
            category: p.category,
          });
        }
      });
    }

    return list;
  }, [activeSpot, campsite]);

  // Init 360 Pannellum in modal
  useEffect(() => {
    if (!isGalleryOpen || galleryTab !== "360" || panoramaList.length === 0)
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
            type: "equirectangular",
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
        console.error("Error init pannellum:", err);
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

  // Pricing calculations
  const spotPricePerNight = useMemo(() => {
    if (!activeSpot) return 0;
    const pkg = activeSpot.pricingPackages?.[0];
    if (pkg?.flatRateMode && pkg.flatRate != null && pkg.flatRate !== "") {
      return Number(pkg.flatRate);
    }
    if (pkg?.weekdayRate != null && pkg.weekdayRate !== "") {
      return Number(pkg.weekdayRate);
    }
    return activeSpot.weekdayPrice || 0;
  }, [activeSpot]);

  // Available addons
  const availableAddons = useMemo(() => {
    if (Array.isArray(campsite?.addons) && campsite.addons.length > 0) {
      return campsite.addons;
    }
    return [
      {
        id: "addon_tent",
        name: "Extra Dome Tent (Kapasitas 4 Org)",
        price: 100000,
      },
      { id: "addon_sb", name: "Sleeping Bag Tambahan", price: 30000 },
      { id: "addon_mat", name: "Kasur Angin Ekstra + Pompa", price: 50000 },
      { id: "addon_bbq", name: "Paket BBQ Grill & Arang", price: 75000 },
      { id: "addon_wood", name: "Kayu Bakar Api Unggun (1 Ikat)", price: 35000 },
      {
        id: "addon_food",
        name: "Sarapan Pagi Nasi Liwet Tradisional",
        price: 25000,
      },
    ];
  }, [campsite]);

  const addonTotal = useMemo(() => {
    let sum = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      const item = availableAddons.find((a) => a.id === addonId);
      if (item && qty > 0) {
        sum += item.price * qty;
      }
    });
    return sum;
  }, [selectedAddons, availableAddons]);

  const grandTotal = useMemo(() => {
    return spotPricePerNight * nights + addonTotal;
  }, [spotPricePerNight, nights, addonTotal]);

  const dp50Total = useMemo(() => {
    return Math.round(grandTotal * 0.5);
  }, [grandTotal]);

  const paymentAmountToPay =
    paymentScheme === "DP_50" ? dp50Total : grandTotal;

  // Add-on counter helper
  const handleAddonQty = (addonId: string, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [addonId]: next };
    });
  };

  // Order Submission Flow
  const handleProceedBooking = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    if (!activeSpot || !campsite) return;

    try {
      setSubmittingOrder(true);
      setOrderError(null);

      const items = [
        {
          blockId: activeSpot.id,
          name: `${activeSpot.name} (${campsite.name})`,
          price: spotPricePerNight,
          quantity: nights,
        },
      ];

      Object.entries(selectedAddons).forEach(([addonId, qty]) => {
        const item = availableAddons.find((a) => a.id === addonId);
        if (item && qty > 0) {
          items.push({
            blockId: addonId,
            name: `Add-on: ${item.name}`,
            price: item.price,
            quantity: qty,
          });
        }
      });

      const orderPayload = {
        campsiteId: campsite.id,
        blockId: activeSpot.id,
        checkInDate,
        checkOutDate,
        guestCount,
        paymentScheme,
        items,
        totalAmount: grandTotal,
        paymentAmount: paymentAmountToPay,
        guest: {
          id: currentUser.id,
          name: currentUser.fullName || currentUser.displayName || "Tamu Embun",
          email: currentUser.email,
          phone: currentUser.phone || "08123456789",
        },
      };

      const orderRes = await createPublicBookingOrder(orderPayload);
      if (orderRes?.snapToken) {
        await initiateMidtransSnapPayment(orderRes.snapToken);
      } else if (orderRes?.paymentUrl) {
        window.location.href = orderRes.paymentUrl;
      } else {
        alert(
          `Pesanan berhasil dibuat! Nomor Transaksi: ${
            orderRes?.orderId || "EMB-" + Date.now()
          }`,
        );
      }
    } catch (err: any) {
      setOrderError(err.message || "Gagal memproses pemesanan.");
    } finally {
      setSubmittingOrder(false);
    }
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
    }. Tarif ${rupiah(
      spotPricePerNight,
    )}/malam (Bisa DP 50%). Cek foto & reservasi di: ${shareUrl}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Loading View
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-foreground flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue animate-pulse">
            <Tent size={26} />
          </div>
          <p className="text-xs font-semibold text-foreground-muted">
            Memuat rincian properti Embun...
          </p>
        </div>
      </div>
    );
  }

  // Error View
  if (error || !campsite || !activeSpot) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center text-foreground">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mb-4 border border-red-200">
          <Tent size={32} />
        </div>
        <h1 className="text-xl font-bold mb-2">Spot Tidak Ditemukan</h1>
        <p className="text-xs text-foreground-muted max-w-sm mb-6 leading-relaxed">
          {error || "Tautan yang Anda tuju tidak valid atau telah dinonaktifkan."}
        </p>
        <Link
          href="/explore"
          className="px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
        >
          Kembali ke Jelajah Spot
        </Link>
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
          {/* Logo & Back to Explore */}
          <div className="flex items-center gap-4">
            <Link
              href="/explore"
              className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              title="Kembali ke Katalog"
            >
              <ArrowLeft size={20} />
            </Link>
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/images/logo/primary_blue.svg"
                alt="Embun"
                className="h-7 w-auto object-contain"
              />
              <span className="hidden sm:inline-block text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
                Detail Spot
              </span>
            </Link>
          </div>

          {/* Center: Campsite Location pill (desktop) */}
          <div className="hidden md:flex items-center gap-2 border border-border rounded-full py-1.5 px-4 shadow-2xs bg-surface text-xs text-foreground font-medium">
            <MapPin size={13} className="text-brand-blue shrink-0" />
            <span className="font-bold">{campsite.name}</span>
            <span className="text-foreground-muted">· {campsite.address}</span>
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
                isFavorite ? "text-red-500" : "text-foreground"
              }`}
              title="Simpan ke Favorit"
            >
              <Heart
                size={16}
                className={isFavorite ? "fill-red-500" : ""}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-2 border border-border rounded-full py-1.5 px-3 hover:shadow-sm transition-all bg-white text-xs font-semibold text-foreground cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-[11px] overflow-hidden">
                {currentUser?.fullName
                  ? currentUser.fullName.charAt(0).toUpperCase()
                  : "G"}
              </div>
              <span className="hidden sm:inline">
                {currentUser?.fullName
                  ? currentUser.fullName.split(" ")[0]
                  : "Masuk"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-8 flex-1">
        {/* ════════════════════════════════════════════════════════════════════════
            2. LISTING HEADER TITLE & META
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {activeSpot.name}
            </h1>
            {activeSpot.isEmbunPlus && (
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-brand-lime text-black border border-brand-lime/80 shadow-2xs flex items-center gap-1">
                <Sparkles size={11} className="fill-black" />
                Embun Plus
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-muted">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-bold text-foreground">
                <Star size={13} className="fill-amber-500 text-amber-500" />
                5.0
              </span>
              <span>·</span>
              <span className="underline font-semibold text-foreground cursor-pointer">
                48 ulasan
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-medium text-foreground">
                <MapPin size={13} className="text-brand-blue" />
                {campsite.name}, {campsite.address || "Kawasan Wisata Alam"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 hover:underline font-semibold text-foreground cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? "Tersalin!" : "Salin Tautan"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            3. AIRBNB 5-GRID PHOTO GALLERY
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden shadow-sm border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[420px]">
            {/* Main Big Hero Photo (Left 2 cols) */}
            <div
              onClick={() => {
                setGalleryTab("photos");
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
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface text-foreground-muted">
                  <Tent size={48} />
                </div>
              )}
            </div>

            {/* 4 Small Grid Photos (Right 2 cols) */}
            <div className="hidden md:grid col-span-2 grid-cols-2 gap-2 h-full">
              {[1, 2, 3, 4].map((idx) => {
                const photo = spotPhotos[idx] || spotPhotos[0];
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setGalleryTab("photos");
                      setActivePhotoIdx(idx < spotPhotos.length ? idx : 0);
                      setIsGalleryOpen(true);
                    }}
                    className="relative h-[205px] bg-surface overflow-hidden cursor-pointer group"
                  >
                    {photo ? (
                      <img
                        src={resolveAssetUrl(photo.url)}
                        alt={`Foto ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface text-foreground-muted">
                        <Tent size={24} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overlay Buttons */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            {panoramaList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setGalleryTab("360");
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
                setGalleryTab("photos");
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
          {/* ── LEFT COLUMN: DETAILS & CALENDAR (8 COLS) ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* Property Overview Card */}
            <div className="pb-8 border-b border-border space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Kavling & Unit di {campsite.name}
                  </h2>
                  <p className="text-xs text-foreground-muted mt-1">
                    Maks. {activeSpot.maxCapacity} Tamu · {activeSpot.bedType || "Bawa Kasur Sendiri"} · Luas {activeSpot.roomSize || "4x6 meter"} · {getPackageModelLabel(activeSpot.pricingPackages?.[0]?.pricingModel)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                  <Trees size={22} />
                </div>
              </div>
            </div>

            {/* Highlights Feature Cards */}
            <div className="space-y-4 pb-8 border-b border-border">
              {activeSpot.isEmbunPlus && (
                <div className="flex items-start gap-3.5">
                  <Sparkles size={20} className="text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Terverifikasi Embun Plus
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      Akomodasi pilihan dengan standar kebersihan, pemandangan, dan kenyamanan tertinggi.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3.5">
                <Clock size={20} className="text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Self Check-in Mandiri
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Proses masuk cepat dan mudah mulai pukul 14:00 WIB.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <ShieldCheck size={20} className="text-brand-blue shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Skema Fleksibel DP 50%
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Cukup bayar uang muka 50% untuk mengunci jadwal, sisa dilunasi saat tiba di lokasi.
                  </p>
                </div>
              </div>

              {panoramaList.length > 0 && (
                <div className="flex items-start gap-3.5">
                  <Compass size={20} className="text-brand-blue shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Tur Virtual 360° Tersedia
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      Jelajahi sudut pandang panorama dan interior tenda secara interaktif.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Deskripsi Properti */}
            <div className="space-y-3 pb-8 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                Tentang Spot Ini
              </h3>
              <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed space-y-2">
                <p>
                  {campsite.description ||
                    "Nikmati pengalaman berkemah dan glamping di tengah kesejukan alam pegunungan dengan pemandangan terbuka dan udara segar."}
                </p>
                <p>
                  Unit {activeSpot.name} didesain untuk kenyamanan menginap keluarga dan sahabat, dilengkapi akses mudah ke fasilitas umum serta pemandangan spektakuler.
                </p>
              </div>
            </div>

            {/* Fasilitas yang Ditawarkan (Airbnb Grid) */}
            <div className="space-y-4 pb-8 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                Fasilitas yang Tersedia
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-foreground">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/80">
                  <Flame size={18} className="text-amber-500 shrink-0" />
                  <span>Area Api Unggun & BBQ Grill</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/80">
                  <Droplets size={18} className="text-blue-500 shrink-0" />
                  <span>10 Bilik Toilet Bersih & Air Mengalir</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/80">
                  <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                  <span>Akses Listrik 24 Jam di Area Kavling</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/80">
                  <Trees size={18} className="text-emerald-600 shrink-0" />
                  <span>Area Parkir Kendaraan Motor & Mobil</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/80">
                  <Sparkles size={18} className="text-brand-blue shrink-0" />
                  <span>Mushola & Tempat Wudhu</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/80">
                  <Info size={18} className="text-brand-blue shrink-0" />
                  <span>Warung Camilan & Kebutuhan Dasar</span>
                </div>
              </div>
            </div>

            {/* ── AIRBNB INTEGRATED CALENDAR SECTION ── */}
            <div className="space-y-4 pb-8 border-b border-border">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  Pilih Tanggal Menginap
                </h3>
                <p className="text-xs text-foreground-muted">
                  {nights} Malam di {campsite.name} ({formatDateDisplay(checkInDate)} s/d {formatDateDisplay(checkOutDate)})
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
                    Durasi: <strong className="text-brand-blue">{nights} Malam</strong>
                  </span>
                  <span className="text-xs font-bold text-brand-blue group-hover:underline flex items-center gap-1">
                    Pilih / Ubah Tanggal →
                  </span>
                </div>
              </div>
            </div>

            {/* Peta Lokasi & Denah Kavling */}
            <div className="space-y-4 pb-8 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                Lokasi & Peta Area
              </h3>
              <p className="text-xs text-foreground-muted">
                {campsite.name} · {campsite.address || "Kawasan Wisata Alam"}
              </p>

              {campsite.mapImageUrl ? (
                <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden border border-border bg-surface">
                  <img
                    src={resolveAssetUrl(campsite.mapImageUrl)}
                    alt="Peta Campsite"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                    <MapPin size={13} className="text-brand-lime" />
                    <span>Denah Resmi Kavling</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-surface border border-border text-center space-y-2">
                  <MapPin size={32} className="mx-auto text-brand-blue" />
                  <p className="text-xs font-semibold text-foreground">
                    {campsite.name}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    {campsite.address}
                  </p>
                </div>
              )}

              {campsite.googleMapsUrl && (
                <a
                  href={campsite.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-brand-blue hover:underline"
                >
                  <span>Buka Petunjuk Arah di Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Aturan & Kebijakan Menginap */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-foreground">
                Aturan & Kebijakan Menginap
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-foreground-muted leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Waktu Menginap</h4>
                  <p>Check-in mulai: 14:00 WIB</p>
                  <p>Check-out maksimal: 12:00 WIB</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Jam Tenang</h4>
                  <p>22:00 - 06:00 WIB (Kecilkan volume musik & suara demi kenyamanan bersama).</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Api Unggun & Sampah</h4>
                  <p>Gunakan wadah api yang disediakan dan wajib membawa turun kembali seluruh sampah.</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">Reschedule & Refund</h4>
                  <p>Perubahan jadwal dapat diajukan sesuai kebijakan pengelola campsite dan Embun.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: STICKY BOOKING CARD (4 COLS) ── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl border border-border shadow-xl p-6 space-y-6">
              {/* Header Price & Rating */}
              <div className="flex items-baseline justify-between border-b border-border pb-4">
                <div>
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    {rupiah(spotPricePerNight)}
                  </span>
                  <span className="text-xs text-foreground-muted"> / malam</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                  <Star size={13} className="fill-amber-500 text-amber-500" />
                  <span>5.0</span>
                  <span className="text-foreground-muted">· 48 ulasan</span>
                </div>
              </div>

              {/* Date & Guest Input Box */}
              <div className="border border-border rounded-2xl overflow-hidden shadow-2xs divide-y divide-border text-xs">
                {/* Date Trigger Box in Sidebar */}
                <div
                  onClick={() => setIsCalendarOpen(true)}
                  className="grid grid-cols-2 divide-x divide-border bg-surface/50 hover:bg-surface transition-colors cursor-pointer group"
                >
                  <div className="p-3">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-foreground-muted">
                      Check-In
                    </span>
                    <span className="font-bold text-foreground group-hover:text-brand-blue text-xs block mt-0.5 transition-colors">
                      {formatDateDisplay(checkInDate)}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="block text-[9.5px] font-bold uppercase tracking-wider text-foreground-muted">
                      Check-Out
                    </span>
                    <span className="font-bold text-foreground group-hover:text-brand-blue text-xs block mt-0.5 transition-colors">
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
                      {guestCount} Orang (Maks. {activeSpot.maxCapacity})
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
                      disabled={guestCount >= activeSpot.maxCapacity}
                      onClick={() =>
                        setGuestCount(
                          Math.min(activeSpot.maxCapacity, guestCount + 1),
                        )
                      }
                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add-on Selection */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-foreground block">
                  Perlengkapan Tambahan (Opsional)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar text-xs">
                  {availableAddons.map((addon) => {
                    const qty = selectedAddons[addon.id] || 0;
                    return (
                      <div
                        key={addon.id}
                        className="p-2.5 rounded-2xl border border-border bg-surface/40 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-[11.5px] truncate">
                            {addon.name}
                          </p>
                          <p className="text-[10.5px] text-foreground-muted font-bold">
                            +{rupiah(addon.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={qty <= 0}
                            onClick={() => handleAddonQty(addon.id, -1)}
                            className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:bg-surface disabled:opacity-30 cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-bold text-xs w-3 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddonQty(addon.id, 1)}
                            className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:bg-surface cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between text-foreground-muted">
                  <span>
                    {rupiah(spotPricePerNight)} × {nights} malam
                  </span>
                  <span className="font-semibold text-foreground">
                    {rupiah(spotPricePerNight * nights)}
                  </span>
                </div>

                {addonTotal > 0 && (
                  <div className="flex justify-between text-foreground-muted">
                    <span>Total Perlengkapan Tambahan</span>
                    <span className="font-semibold text-foreground">
                      {rupiah(addonTotal)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-foreground-muted">
                  <span>Biaya Layanan</span>
                  <span className="font-bold text-emerald-600">Gratis</span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-foreground pt-2 border-t border-border">
                  <span>Total Tagihan</span>
                  <span className="text-brand-blue">{rupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Scheme Radio */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
                  Pilihan Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentScheme("DP_50")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentScheme === "DP_50"
                        ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue"
                        : "border-border bg-surface hover:bg-surface-variant"
                    }`}
                  >
                    <span className="block font-bold text-xs text-foreground">
                      DP 50%
                    </span>
                    <span className="block font-extrabold text-xs text-brand-blue mt-0.5">
                      {rupiah(dp50Total)}
                    </span>
                    <span className="block text-[10px] text-foreground-muted mt-0.5">
                      Sisa di lokasi
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentScheme("FULL")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentScheme === "FULL"
                        ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue"
                        : "border-border bg-surface hover:bg-surface-variant"
                    }`}
                  >
                    <span className="block font-bold text-xs text-foreground">
                      Bayar Lunas
                    </span>
                    <span className="block font-extrabold text-xs text-foreground mt-0.5">
                      {rupiah(grandTotal)}
                    </span>
                    <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Bebas ribet
                    </span>
                  </button>
                </div>
              </div>

              {orderError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  {orderError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={submittingOrder}
                  onClick={handleProceedBooking}
                  className="w-full py-3.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock size={15} />
                  <span>
                    {submittingOrder
                      ? "Memproses Pesanan..."
                      : `Pesan Sekarang · ${rupiah(paymentAmountToPay)}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenApp}
                  className="w-full py-2.5 rounded-full bg-[#cefb0a] hover:bg-[#c2ed08] text-[#0841b5] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Smartphone size={14} />
                  <span>Buka di Aplikasi Embun</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-foreground-muted">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Pembayaran aman & bergaransi via Midtrans</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          5. MOBILE STICKY BOTTOM BAR
      ════════════════════════════════════════════════════════════════════════ */}
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
              <span>({formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)})</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleProceedBooking}
            className="px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Pesan ({paymentScheme === "DP_50" ? "DP 50%" : "Lunas"})</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

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
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setGalleryTab("photos")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  galleryTab === "photos"
                    ? "bg-brand-blue text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Foto ({spotPhotos.length})
              </button>

              {panoramaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGalleryTab("360")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                    galleryTab === "360"
                      ? "bg-brand-lime text-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Compass size={12} />
                  <span>Tur 360°</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Canvas Content */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
            {galleryTab === "photos" ? (
              <div className="w-full max-w-5xl h-full flex flex-col items-center justify-center space-y-4">
                <div className="relative flex-1 w-full max-h-[70vh] flex items-center justify-center">
                  <img
                    src={resolveAssetUrl(spotPhotos[activePhotoIdx]?.url)}
                    alt={`Foto ${activePhotoIdx + 1}`}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                  />

                  {spotPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIdx(
                            (activePhotoIdx - 1 + spotPhotos.length) %
                              spotPhotos.length,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActivePhotoIdx(
                            (activePhotoIdx + 1) % spotPhotos.length,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails Row */}
                <div className="w-full max-w-3xl overflow-x-auto flex items-center gap-2 p-2 no-scrollbar">
                  {spotPhotos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer ${
                        activePhotoIdx === idx
                          ? "border-brand-lime ring-2 ring-brand-lime scale-105"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={resolveAssetUrl(p.url)}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* 360 Panorama Viewer */
              <div className="w-full h-full relative">
                <div
                  ref={panoramaContainerRef}
                  className="w-full h-full cursor-grab active:cursor-grabbing"
                />

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-xs font-semibold text-white/90 flex items-center gap-2 pointer-events-none shadow-2xl">
                  <RotateCw size={14} className="text-brand-lime animate-spin" />
                  <span>Geser layar / mouse untuk berputar 360°</span>
                </div>
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
          8. GUEST AUTH MODAL
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
    </div>
  );
}
