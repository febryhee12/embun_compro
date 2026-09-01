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
  Wifi,
  Bath,
  Zap,
  Car,
  MoonStar,
  Coffee,
  Waves,
  BriefcaseMedical,
  Store,
  Package,
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
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[0] === "spot") {
    return parts[1];
  }
  return null;
}

function getPackageModelLabel(model?: string): string {
  switch (model) {
    case "SPOT_ONLY":
      return "Sewa Kavling Saja";
    case "FIXED_CAPACITY_PACKAGE":
      return "Paket Tenda & Fasilitas";
    case "PER_PERSON":
      return "Harga Per Tamu / Orang";
    case "HYBRID":
      return "Sewa Kavling + Ekstra Tamu";
    default:
      return "Paket Penginapan Standar";
  }
}

function getFacilityIcon(name?: string, id?: string) {
  const lower = (name || id || "").toLowerCase();
  if (lower.includes("wifi"))
    return <Wifi size={18} className="text-brand-blue shrink-0" />;
  if (
    lower.includes("toilet") ||
    lower.includes("kamar mandi") ||
    lower.includes("bath")
  )
    return <Bath size={18} className="text-blue-500 shrink-0" />;
  if (lower.includes("water heater") || lower.includes("pemanas"))
    return <Droplets size={18} className="text-amber-500 shrink-0" />;
  if (
    lower.includes("listrik") ||
    lower.includes("colokan") ||
    lower.includes("power") ||
    lower.includes("zap")
  )
    return <Zap size={18} className="text-amber-500 shrink-0" />;
  if (
    lower.includes("api") ||
    lower.includes("bonfire") ||
    lower.includes("bbq") ||
    lower.includes("flame")
  )
    return <Flame size={18} className="text-orange-500 shrink-0" />;
  if (
    lower.includes("parkir") ||
    lower.includes("car") ||
    lower.includes("parking")
  )
    return <Car size={18} className="text-emerald-600 shrink-0" />;
  if (
    lower.includes("mushola") ||
    lower.includes("prayer") ||
    lower.includes("moon")
  )
    return <MoonStar size={18} className="text-purple-500 shrink-0" />;
  if (
    lower.includes("cafe") ||
    lower.includes("resto") ||
    lower.includes("coffee")
  )
    return <Coffee size={18} className="text-amber-700 shrink-0" />;
  if (
    lower.includes("kolam") ||
    lower.includes("pool") ||
    lower.includes("danau") ||
    lower.includes("sungai") ||
    lower.includes("waves")
  )
    return <Waves size={18} className="text-cyan-500 shrink-0" />;
  if (
    lower.includes("keamanan") ||
    lower.includes("security") ||
    lower.includes("pos")
  )
    return <ShieldCheck size={18} className="text-emerald-500 shrink-0" />;
  if (
    lower.includes("p3k") ||
    lower.includes("first aid") ||
    lower.includes("medis")
  )
    return <BriefcaseMedical size={18} className="text-red-500 shrink-0" />;
  if (
    lower.includes("warung") ||
    lower.includes("toko") ||
    lower.includes("store")
  )
    return <Store size={18} className="text-amber-600 shrink-0" />;
  if (lower.includes("tenda") || lower.includes("tent"))
    return <Tent size={18} className="text-brand-blue shrink-0" />;
  return <CheckCircle2 size={18} className="text-brand-blue shrink-0" />;
}

function parseHtmlRules(htmlString?: string) {
  if (!htmlString) return [];
  const liMatches = htmlString.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches
      .map((li) => li.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
  }
  return htmlString
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Dynamic Pannellum Loader for 360 viewer
let pannellumPromise: Promise<any> | null = null;
function loadPannellum(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if ((window as any).pannellum) return Promise.resolve((window as any).pannellum);
  if (pannellumPromise) return pannellumPromise;

  pannellumPromise = new Promise((resolve) => {
    if (!document.getElementById("pannellum-css")) {
      const link = document.createElement("link");
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewAggregate, setReviewAggregate] = useState<ReviewAggregate | null>(null);

  // Gallery & 360 Lightbox state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTab, setGalleryTab] = useState<"photos" | "360" | "map">("photos");
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [activePanoramaIdx, setActivePanoramaIdx] = useState(0);

  // Share & Favorite state
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Date selection
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);
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
                setSelectedPackageId(firstSpot.pricingPackages?.[0]?.id || null);
              }
              // Fetch reviews for fallback camp
              fetchReviews(fallbackCamp.id);
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
        setError(err.message || "Gagal memuat rincian properti.");
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
        console.error("Error loading reviews:", e);
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

  // Pricing calculations driven by selectedPackage
  const spotPricePerNight = useMemo(() => {
    if (selectedPackage) {
      if (
        selectedPackage.flatRateMode &&
        selectedPackage.flatRate != null &&
        selectedPackage.flatRate !== ""
      ) {
        return Number(selectedPackage.flatRate);
      }
      if (
        selectedPackage.weekdayRate != null &&
        selectedPackage.weekdayRate !== ""
      ) {
        return Number(selectedPackage.weekdayRate);
      }
    }
    if (!activeSpot) return 0;
    return activeSpot.weekdayPrice || 0;
  }, [selectedPackage, activeSpot]);

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
          name: `${activeSpot.name} - ${selectedPackage?.name || "Paket Standar"} (${campsite.name})`,
          price: spotPricePerNight,
          quantity: nights,
        },
      ];

      Object.entries(selectedAddons).forEach(([addonId, qty]) => {
        if (qty > 0) {
          const addon = availableAddons.find((a) => a.id === addonId);
          if (addon) {
            items.push({
              blockId: addon.id,
              name: `Add-on: ${addon.name}`,
              price: addon.price,
              quantity: qty,
            });
          }
        }
      });

      const orderPayload = {
        campsiteId: campsite.id,
        blockId: activeSpot.id,
        pricingPackageId: selectedPackage?.id,
        checkInDate,
        checkOutDate,
        guestCount,
        paymentScheme,
        items,
        customerDetails: {
          fullName: currentUser.fullName || "Tamu Embun",
          email: currentUser.email || "guest@embun.app",
          phone: currentUser.phone || "08123456789",
        },
      };

      const createdOrder = await createPublicBookingOrder(orderPayload);
      if (!createdOrder?.id) {
        throw new Error("Gagal membuat pesanan.");
      }

      const snapToken = createdOrder.snapToken || createdOrder.id;
      const payResult = await initiateMidtransSnapPayment(snapToken);
      if (
        payResult?.transaction_status === "settlement" ||
        payResult?.transaction_status === "capture"
      ) {
        alert("Pembayaran berhasil! E-tiket telah dikirimkan.");
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      setOrderError(
        err.message ||
          "Gagal menghubungkan ke payment gateway. Anda dapat memesan via aplikasi.",
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window === "undefined" || !activeSpot || !campsite) return;
    const url = window.location.href;
    const text = `Hai! Yuk lihat unit *${activeSpot.name}* di *${campsite.name}* lewat Embun: ${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenApp = () => {
    if (!activeSpot || !campsite) return;
    const token = activeSpot.shareCode || activeSpot.id;
    const customUri = `embun://spot/${token}`;
    const fallbackUrl =
      typeof navigator !== "undefined" &&
      /android/i.test(navigator.userAgent || "")
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
            "Unit atau tenda ini mungkin sedang tidak aktif atau tautan tidak valid."}
        </p>
        <Link
          href="/explore"
          className="px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
        >
          Jelajahi Spot Lainnya
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
          {/* Logo & Explore Badge */}
          <div className="flex items-center gap-3">
            <Link
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
            </Link>
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
                  <Sparkles size={14} className="text-brand-lime fill-brand-lime" />
                  <span className="text-brand-blue">Baru</span>
                  <span className="text-foreground-muted font-normal">
                    · Belum ada ulasan
                  </span>
                </div>
              )}
              <span>·</span>
              <span className="underline decoration-foreground/30 font-medium text-foreground">
                {campsite.city || campsite.address || "Indonesia"}
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
                <span>{copied ? "Tersalin!" : "Salin Link"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════════
            3. AIRBNB 5-PHOTO BENTO GRID & 360 TRIGGER
        ════════════════════════════════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[320px] sm:h-[420px]">
            {/* Big Main Photo (Left 2 cols) */}
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
          {/* ── LEFT COLUMN: DETAILS, PACKAGES, CALENDAR, MAP, & CAMPSITE INFO (8 COLS) ── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* Spot Overview Card */}
            <div className="pb-8 border-b border-border space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Kavling & Unit di {campsite.name}
                  </h2>
                  <p className="text-xs text-foreground-muted mt-1">
                    Maks. {effectiveMaxCapacity} Tamu · {activeSpot.bedType || "Bawa Kasur Sendiri"} · Luas {activeSpot.roomSize || "4x6 meter"} · {getPackageModelLabel(selectedPackage?.pricingModel)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 border border-brand-blue/30 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                  <Tent size={24} />
                </div>
              </div>
            </div>

            {/* Key Spot Highlights */}
            <div className="space-y-4 pb-8 border-b border-border">
              <div className="flex items-start gap-3.5">
                <Sparkles size={20} className="text-brand-lime fill-brand-lime shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    Standar Kenyamanan Embun
                  </h3>
                  <p className="text-xs text-foreground-muted">
                    Properti telah diverifikasi langsung oleh tim Embun untuk kebersihan toilet, akses listrik, dan keamanan 24 jam.
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

            {/* ── SECTION: PILIHAN PAKET MENGINAP (PACKAGE SELECTION) ── */}
            {Array.isArray(activeSpot.pricingPackages) && activeSpot.pricingPackages.length > 0 && (
              <div className="space-y-4 pb-8 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-lime text-black border border-brand-lime/80 shadow-2xs">
                      Pilihan Paket
                    </span>
                    <h3 className="font-bold text-lg text-foreground">
                      Pilihan Paket Penginapan
                    </h3>
                  </div>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Pilih paket yang sesuai dengan kebutuhan Anda untuk unit {activeSpot.name}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeSpot.pricingPackages.map((pkg) => {
                    const isSelected = (selectedPackage?.id || activeSpot.pricingPackages?.[0]?.id) === pkg.id;
                    const pkgPrice =
                      pkg.flatRateMode && pkg.flatRate
                        ? Number(pkg.flatRate)
                        : (Number(pkg.weekdayRate) || spotPricePerNight);
                    const cleanDesc = pkg.description
                      ? pkg.description
                          .replace(/<[^>]+>/g, "")
                          .replace(/&nbsp;/g, " ")
                          .trim()
                      : null;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackageId(pkg.id || null)}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-3 relative group ${
                          isSelected
                            ? "border-brand-blue bg-brand-blue/5 shadow-md ring-2 ring-brand-blue/20"
                            : "border-border bg-surface hover:border-brand-blue/40 hover:bg-surface-variant/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-brand-blue transition-colors">
                              {pkg.name}
                            </h4>
                            <span className="text-[10px] font-medium text-foreground-muted block mt-0.5">
                              {getPackageModelLabel(pkg.pricingModel)}
                            </span>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-brand-blue bg-brand-blue text-white"
                                : "border-border bg-white"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>

                        {cleanDesc ? (
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {cleanDesc}
                          </p>
                        ) : (
                          <p className="text-xs text-foreground-muted italic leading-relaxed">
                            {pkg.pricingModel === "FIXED_CAPACITY_PACKAGE"
                              ? "Paket lengkap dengan unit tenda dan perlengkapan siap pakai."
                              : "Sewa kavling area camping dengan akses ke fasilitas campsite."}
                          </p>
                        )}

                        <div className="flex items-baseline justify-between pt-2 border-t border-border/80 text-xs">
                          <div>
                            <span className="text-base font-extrabold text-brand-blue">
                              {rupiah(pkgPrice)}
                            </span>
                            <span className="text-[10.5px] text-foreground-muted">
                              {" "}
                              / malam
                            </span>
                          </div>
                          <span className="text-[10.5px] font-bold text-foreground-muted bg-white px-2 py-0.5 rounded-full border border-border">
                            Maks. {pkg.maxOccupancy || pkg.baseCapacity || activeSpot.maxCapacity} Tamu
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deskripsi Spot */}
            <div className="space-y-3 pb-8 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                Tentang Spot Ini
              </h3>
              <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed space-y-2">
                <p>
                  Unit {activeSpot.name} di {campsite.name} menawarkan pengalaman bermalam di alam terbuka yang tenang dengan udara sejuk dan pemandangan asri.
                </p>
                <p>
                  Cocok untuk kumpul keluarga, pasangan, maupun teman-teman. Dilengkapi akses cepat ke fasilitas air bersih, toilet, colokan listrik, serta titik api unggun bersama.
                </p>
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

            {/* ── SECTION: LOKASI & PETA AREA (GOOGLE MAPS) ── */}
            <div className="space-y-4 pb-8 border-b border-border">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  Lokasi & Akses Area
                </h3>
                <p className="text-xs text-foreground-muted">
                  {campsite.name} · {[campsite.address, campsite.city, campsite.province].filter(Boolean).join(", ")}
                </p>
              </div>

              {/* Google Maps Iframe Embed */}
              {campsite.latitude && campsite.longitude && Number(campsite.latitude) !== 0 ? (
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
                      setGalleryTab("map");
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
                          campsite.name + " " + (campsite.address || ""),
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                    Info Properti
                  </span>
                  <h3 className="font-bold text-xl text-foreground">
                    Tentang Properti {campsite.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  {campsite.description ||
                    `${campsite.name} merupakan destinasi camping dan glamping pilihan di ${campsite.city || "Jawa Barat"} dengan suasana asri, udara sejuk, dan fasilitas lengkap untuk liburan Anda.`}
                </p>
              </div>

              {/* Fasilitas Properti Campsite */}
              {Array.isArray(campsite.facilities) && campsite.facilities.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-foreground">
                    Fasilitas Utama Properti
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs text-foreground">
                    {campsite.facilities.map((fac: any, idx: number) => {
                      const facName = typeof fac === "string" ? fac : fac.name || "Fasilitas";
                      const facIcon = typeof fac === "object" ? fac.icon : null;
                      return (
                        <div
                          key={fac.id || idx}
                          className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface border border-border/80"
                        >
                          {getFacilityIcon(facName, facIcon || fac.id)}
                          <span className="font-medium truncate">{facName}</span>
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
                    <p>Check-in mulai: <strong>{campsite.checkInTime || "14:00"} WIB</strong></p>
                    <p>Check-out maksimal: <strong>{campsite.checkOutTime || "12:00"} WIB</strong></p>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border space-y-1">
                    <h5 className="font-bold text-foreground flex items-center gap-1.5">
                      <MoonStar size={13} className="text-brand-blue" />
                      <span>Jam Tenang (Quiet Hours)</span>
                    </h5>
                    <p><strong>22:00 - 06:00 WIB</strong></p>
                    <p className="text-[11px]">Kecilkan volume musik dan suara demi kenyamanan bersama.</p>
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
                      : "Ulasan Tamu"}
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
                                alt={rev.maskedAuthorName || "Tamu"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (rev.maskedAuthorName || "Tamu").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-foreground">
                              {rev.maskedAuthorName || "Tamu Embun"}
                            </h4>
                            <span className="text-[10px] text-foreground-muted">
                              {new Date(rev.createdAt).toLocaleDateString("id-ID", {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-border text-[11px] font-bold text-foreground">
                          <Star size={11} className="fill-amber-500 text-amber-500" />
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
                    Jadilah tamu pertama yang memberikan ulasan setelah selesai menginap!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: STICKY BOOKING CARD (DESKTOP ONLY) ── */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl border border-border shadow-xl p-6 space-y-5">
              {/* Header Price & Rating */}
              <div className="flex items-baseline justify-between border-b border-border pb-4">
                <div>
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    {rupiah(spotPricePerNight)}
                  </span>
                  <span className="text-xs text-foreground-muted"> / malam</span>
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
                    <Sparkles size={13} className="text-brand-lime fill-brand-lime" />
                    <span className="text-brand-blue">Baru</span>
                  </div>
                )}
              </div>

              {/* Package Selector (Sidebar) */}
              {Array.isArray(activeSpot.pricingPackages) && activeSpot.pricingPackages.length > 1 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Pilihan Paket</span>
                    <span className="text-[10px] font-semibold text-brand-blue truncate max-w-[140px]">
                      {selectedPackage?.name}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {activeSpot.pricingPackages.map((pkg) => {
                      const isSelected = (selectedPackage?.id || activeSpot.pricingPackages?.[0]?.id) === pkg.id;
                      const pkgPrice =
                        pkg.flatRateMode && pkg.flatRate
                          ? Number(pkg.flatRate)
                          : (Number(pkg.weekdayRate) || 0);
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id || null)}
                          className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue"
                              : "border-border bg-surface/50 hover:bg-surface"
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
                            <Minus size={11} />
                          </button>
                          <span className="font-bold text-xs w-3 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddonQty(addon.id, 1)}
                            className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:bg-surface cursor-pointer"
                          >
                            <Plus size={11} />
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
                    {selectedPackage?.name || "Sewa"} ({rupiah(spotPricePerNight)} x {nights} malam)
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
                    onClick={() => setPaymentScheme("DP_50")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentScheme === "DP_50"
                        ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20"
                        : "border-border bg-surface/50 hover:bg-surface"
                    }`}
                  >
                    <span className="block text-xs font-bold text-foreground">
                      DP 50%
                    </span>
                    <span className="block text-xs font-extrabold text-brand-blue mt-0.5">
                      {rupiah(dp50Total)}
                    </span>
                    <span className="block text-[10px] text-foreground-muted mt-0.5">
                      Sisa bayar di lokasi
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentScheme("FULL")}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      paymentScheme === "FULL"
                        ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20"
                        : "border-border bg-surface/50 hover:bg-surface"
                    }`}
                  >
                    <span className="block text-xs font-bold text-foreground">
                      Bayar Lunas
                    </span>
                    <span className="block text-xs font-extrabold text-foreground mt-0.5">
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

              {/* CTA Booking Button */}
              <div className="space-y-2.5 pt-2">
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
            onClick={() => setIsMobileBookingOpen(true)}
            className="px-6 py-3 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <span>Pesan</span>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGalleryTab("photos")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  galleryTab === "photos"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Foto ({spotPhotos.length})
              </button>
              {panoramaList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setGalleryTab("360")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    galleryTab === "360"
                      ? "bg-brand-lime text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Tur 360° ({panoramaList.length})
                </button>
              )}
              {campsite.mapImageUrl && (
                <button
                  type="button"
                  onClick={() => setGalleryTab("map")}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    galleryTab === "map"
                      ? "bg-white text-black"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  Denah
                </button>
              )}
            </div>
          </div>

          {/* Modal Content Body */}
          <div className="flex-1 relative overflow-hidden bg-black/95 flex items-center justify-center p-4">
            {galleryTab === "photos" && (
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
                          ? "border-brand-lime scale-105"
                          : "border-transparent opacity-50 hover:opacity-100"
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

            {galleryTab === "map" && campsite.mapImageUrl && (
              <div className="max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center p-4">
                <img
                  src={resolveAssetUrl(campsite.mapImageUrl)}
                  alt="Denah Kavling Lengkap"
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />
              </div>
            )}

            {galleryTab === "360" && (
              <div className="relative w-full h-full">
                {panoramaList.length > 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10">
                    {panoramaList.map((pano, pIdx) => (
                      <button
                        key={pano.id}
                        type="button"
                        onClick={() => setActivePanoramaIdx(pIdx)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          activePanoramaIdx === pIdx
                            ? "bg-brand-lime text-black"
                            : "text-white/80 hover:text-white"
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
                  {rupiah(spotPricePerNight)} <span className="text-[11px]">/ malam</span> · {campsite.name}
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
            {Array.isArray(activeSpot.pricingPackages) && activeSpot.pricingPackages.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  Pilihan Paket
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {activeSpot.pricingPackages.map((pkg) => {
                    const isSelected = (selectedPackage?.id || activeSpot.pricingPackages?.[0]?.id) === pkg.id;
                    const pkgPrice =
                      pkg.flatRateMode && pkg.flatRate
                        ? Number(pkg.flatRate)
                        : (Number(pkg.weekdayRate) || 0);
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id || null)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-blue bg-brand-blue/5 ring-1 ring-brand-blue"
                            : "border-border bg-surface/50 hover:bg-surface"
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
                            <Minus size={11} />
                          </button>
                          <span className="font-bold text-xs w-3 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddonQty(addon.id, 1)}
                            className="w-6 h-6 rounded-full border border-border bg-white flex items-center justify-center text-foreground hover:bg-surface cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
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
                  {selectedPackage?.name || "Sewa"} ({rupiah(spotPricePerNight)} x {nights} malam)
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
                  onClick={() => setPaymentScheme("DP_50")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentScheme === "DP_50"
                      ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20"
                      : "border-border bg-surface/50 hover:bg-surface"
                  }`}
                >
                  <span className="block text-xs font-bold text-foreground">
                    DP 50%
                  </span>
                  <span className="block text-xs font-extrabold text-brand-blue mt-0.5">
                    {rupiah(dp50Total)}
                  </span>
                  <span className="block text-[10px] text-foreground-muted mt-0.5">
                    Sisa bayar di lokasi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentScheme("FULL")}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    paymentScheme === "FULL"
                      ? "border-brand-blue bg-brand-blue/5 ring-2 ring-brand-blue/20"
                      : "border-border bg-surface/50 hover:bg-surface"
                  }`}
                >
                  <span className="block text-xs font-bold text-foreground">
                    Bayar Lunas
                  </span>
                  <span className="block text-xs font-extrabold text-foreground mt-0.5">
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

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-2">
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

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-foreground-muted pb-2">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Pembayaran aman & bergaransi via Midtrans</span>
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
    </div>
  );
}
