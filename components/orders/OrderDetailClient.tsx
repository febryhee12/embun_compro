'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tent,
  Copy,
  Check,
  QrCode,
  Receipt,
  CreditCard,
  RefreshCw,
  Loader2,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  XCircle,
  Clock3,
  Mail,
  LogIn,
  HelpCircle,
  Printer,
  FileText,
  PackageCheck,
  ScrollText,
} from 'lucide-react';
import {
  fetchGuestOrder,
  initiateOrderPayment,
  initiateSettlementPayment,
  syncOrderStatus,
  initiateXenditPayment,
  getGuestToken,
  clearGuestSession,
  getStoredGuestProfile,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { CompleteProfileModal } from '@/components/explore/CompleteProfileModal';
import { InvoiceModal, InvoiceDocument } from '@/components/orders/InvoiceModal';

function getOrderBadge(order: any) {
  if (order.status === 'PAID') {
    const isUnsettled =
      order.isDownPayment && (!order.settledAt || (order.remainingBalance ?? 0) > 0);
    if (isUnsettled) {
      return {
        label: 'DP 50% (Belum Lunas)',
        className: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
        isDP: true,
      };
    }
    return {
      label: 'Lunas',
      className: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
      isDP: false,
    };
  }
  if (order.status === 'PENDING') {
    return {
      label: 'Menunggu Pembayaran',
      className: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
      isDP: false,
    };
  }
  if (order.status === 'COMPLETE') {
    return {
      label: 'Selesai',
      className: 'bg-neutral-100 text-neutral-700 border-neutral-200/80',
      isDP: false,
    };
  }
  if (order.status === 'CANCELLED') {
    return {
      label: 'Dibatalkan',
      className: 'bg-neutral-100 text-neutral-500 border-neutral-200/80',
      isDP: false,
    };
  }
  if (order.status === 'EXPIRED') {
    return {
      label: 'Kedaluwarsa',
      className: 'bg-neutral-100 text-neutral-500 border-neutral-200/80',
      isDP: false,
    };
  }
  if (order.status === 'REFUNDED') {
    return {
      label: 'Direfund',
      className: 'bg-neutral-100 text-neutral-600 border-neutral-200/80',
      isDP: false,
    };
  }
  return {
    label: order.status || 'Draft',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200/80',
    isDP: false,
  };
}

function DummyQrPlaceholder({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Top-Left Finder */}
      <rect x="6" y="6" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="14" y="14" width="12" height="12" rx="2" fill="currentColor" />

      {/* Top-Right Finder */}
      <rect x="66" y="6" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="74" y="14" width="12" height="12" rx="2" fill="currentColor" />

      {/* Bottom-Left Finder */}
      <rect x="6" y="66" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="14" y="74" width="12" height="12" rx="2" fill="currentColor" />

      {/* Alignment Pattern */}
      <rect x="68" y="68" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="73" y="73" width="6" height="6" rx="1" fill="currentColor" />

      {/* Dummy timing / module squares */}
      <rect x="38" y="8" width="5" height="5" rx="1" />
      <rect x="48" y="8" width="5" height="5" rx="1" />
      <rect x="56" y="8" width="5" height="5" rx="1" />
      <rect x="42" y="16" width="5" height="5" rx="1" />
      <rect x="52" y="16" width="5" height="5" rx="1" />
      <rect x="38" y="24" width="5" height="5" rx="1" />
      <rect x="48" y="24" width="5" height="5" rx="1" />
      <rect x="58" y="24" width="5" height="5" rx="1" />

      <rect x="8" y="38" width="5" height="5" rx="1" />
      <rect x="8" y="48" width="5" height="5" rx="1" />
      <rect x="8" y="56" width="5" height="5" rx="1" />
      <rect x="16" y="42" width="5" height="5" rx="1" />
      <rect x="16" y="52" width="5" height="5" rx="1" />
      <rect x="24" y="38" width="5" height="5" rx="1" />
      <rect x="24" y="48" width="5" height="5" rx="1" />
      <rect x="24" y="58" width="5" height="5" rx="1" />

      {/* Center cluster */}
      <rect x="38" y="38" width="6" height="6" rx="1" />
      <rect x="48" y="38" width="6" height="6" rx="1" />
      <rect x="56" y="38" width="6" height="6" rx="1" />
      <rect x="38" y="48" width="6" height="6" rx="1" />
      <rect x="46" y="46" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="58" y="48" width="6" height="6" rx="1" />
      <rect x="38" y="58" width="6" height="6" rx="1" />
      <rect x="48" y="58" width="6" height="6" rx="1" />
      <rect x="58" y="58" width="6" height="6" rx="1" />

      {/* Right / Bottom clusters */}
      <rect x="70" y="38" width="5" height="5" rx="1" />
      <rect x="80" y="40" width="5" height="5" rx="1" />
      <rect x="88" y="38" width="5" height="5" rx="1" />
      <rect x="74" y="48" width="5" height="5" rx="1" />
      <rect x="84" y="52" width="5" height="5" rx="1" />

      <rect x="38" y="70" width="5" height="5" rx="1" />
      <rect x="44" y="80" width="5" height="5" rx="1" />
      <rect x="38" y="88" width="5" height="5" rx="1" />
      <rect x="50" y="74" width="5" height="5" rx="1" />
      <rect x="54" y="84" width="5" height="5" rx="1" />
    </svg>
  );
}

function getShortCode(campsiteName?: string, orderId?: string) {
  if (!orderId) return '-';
  const prefix = (campsiteName || 'EMB')
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  const shortPart = orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
  return `${prefix}-${shortPart}`;
}

function formatDateDisplay(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatSettlementDeadline(
  settlementDeadline?: string | Date | null,
  checkInStr?: string | Date | null,
): string | null {
  try {
    let targetDate: Date | null = null;
    if (settlementDeadline) {
      targetDate = new Date(settlementDeadline);
    } else if (checkInStr) {
      if (typeof checkInStr === 'string' && !checkInStr.includes('T')) {
        const [y, m, day] = checkInStr.split('-').map(Number);
        targetDate = new Date(Date.UTC(y, m - 1, day - 1, 16, 59, 59));
      } else {
        const cin = new Date(checkInStr);
        targetDate = new Date(cin.getTime() - 24 * 60 * 60 * 1000);
      }
    }
    if (!targetDate || isNaN(targetDate.getTime())) return null;

    return targetDate.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export function OrderDetailClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const payToken = searchParams.get('payToken');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredGuestProfile());
  }, []);

  const handleLoginSuccess = (user?: any) => {
    setIsAuthOpen(false);
    setAuthRequired(false);
    if (user) {
      setCurrentUser(user);
    } else {
      setCurrentUser(getStoredGuestProfile());
    }
    void load();
  };

  // Action states
  const [paying, setPaying] = useState(false);
  const [settling, setSettling] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = React.useCallback(async () => {
    if (!orderId) return;
    if (!getGuestToken() && !payToken) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let data = await fetchGuestOrder(orderId, payToken);
      // Bila pesanan masih PENDING (misalnya baru kembali dari redirect Xendit), lakukan auto-sync sekali
      if (data?.status === 'PENDING') {
        const syncRes = await syncOrderStatus(orderId).catch(() => null);
        if (syncRes && (syncRes.status === 'PAID' || syncRes.status === 'COMPLETE')) {
          data = await fetchGuestOrder(orderId, payToken).catch(() => data);
        }
      }
      setOrder(data);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        if (!payToken) {
          clearGuestSession();
          setAuthRequired(true);
        } else {
          setError('Tautan pelunasan ini tidak valid atau sudah kedaluwarsa.');
        }
      } else {
        setError(err.message || 'Gagal memuat detail pesanan.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId, payToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCopyCode = (code: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Bayar pesanan awal (jika status masih PENDING)
  const handlePayNow = async () => {
    if (!orderId) return;
    setError(null);
    setPaying(true);
    try {
      const paymentInit = await initiateOrderPayment(orderId);
      const xenditPaymentUrl =
        paymentInit?.snapRedirectUrl ||
        paymentInit?.redirectUrl ||
        paymentInit?.invoiceUrl;
      if (!xenditPaymentUrl) {
        throw new Error('Gagal mendapatkan URL pembayaran Xendit.');
      }
      initiateXenditPayment(xenditPaymentUrl);
      await syncOrderStatus(orderId).catch(() => {});
      await load();
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setAuthRequired(true);
      } else {
        setError(err.message || 'Gagal memulai pembayaran.');
      }
    } finally {
      setPaying(false);
    }
  };

  // Lunasi sisa tagihan DP (jika isDownPayment dan belum lunas)
  const handleSettleDP = async () => {
    if (!orderId) return;
    setError(null);
    setSettling(true);
    try {
      const res = await initiateSettlementPayment(orderId, payToken);
      const xenditUrl = res?.invoiceUrl || res?.snapRedirectUrl || res?.redirectUrl;
      if (!xenditUrl) {
        throw new Error('Gagal membuat invoice pelunasan Xendit.');
      }
      initiateXenditPayment(xenditUrl);
      await load();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pelunasan DP.');
    } finally {
      setSettling(false);
    }
  };

  const handleSync = async () => {
    if (!orderId) return;
    setSyncing(true);
    setError(null);
    try {
      await syncOrderStatus(orderId);
      await load();
    } catch (err: any) {
      setError(err.message || 'Gagal menyinkronkan status pesanan.');
    } finally {
      setSyncing(false);
    }
  };

  const badge = order ? getOrderBadge(order) : null;
  const booking = order?.bookings?.[0];
  const shortCode = order ? getShortCode(order.campsite?.name, order.id) : '';

  // Hitung jumlah malam
  const checkInDt = booking?.checkIn ? new Date(booking.checkIn) : null;
  const checkOutDt = booking?.checkOut ? new Date(booking.checkOut) : null;
  const nights =
    checkInDt && checkOutDt
      ? Math.max(
          1,
          Math.round(
            (checkOutDt.getTime() - checkInDt.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 1;

  const isPaid = order?.status === 'PAID' || order?.status === 'COMPLETE';
  const isPending = order?.status === 'PENDING';
  const isExpired = order?.status === 'EXPIRED';
  const isCancelled = order?.status === 'CANCELLED';

  const isDP = order?.isDownPayment;
  const remainingBalance = Number(order?.remainingBalance) || 0;
  const isUnsettledDP = isPaid && isDP && (!order?.settledAt || remainingBalance > 0);

  const settlementDeadlineFormatted = React.useMemo(() => {
    return formatSettlementDeadline(order?.settlementDeadline, booking?.checkIn);
  }, [order?.settlementDeadline, booking?.checkIn]);

  const bookingNote =
    order?.bookingNote || booking?.bookingNote || order?.notes || null;
  const campsiteRules = order?.campsite?.rules || null;
  const campsiteHostNotes =
    order?.campsite?.hostNotes || order?.campsite?.campNotes || null;

  const addonLines = React.useMemo(() => {
    if (!order) return [];
    const list: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      perNight?: boolean;
    }> = [];

    // 1. Dari booking.addons
    const bAddons = booking?.addons;
    if (Array.isArray(bAddons) && bAddons.length > 0) {
      for (const a of bAddons) {
        const qty = Number(a.quantity) || 1;
        const total =
          Number(a.amount ?? a.totalPrice ?? (a.unitPrice ? a.unitPrice * qty : 0)) || 0;
        const uPrice =
          Number(a.unitPrice ?? a.price ?? (total ? total / qty : 0)) || 0;
        list.push({
          name: a.name || a.label || a.addon?.name || 'Layanan Tambahan',
          quantity: qty,
          unitPrice: uPrice,
          amount: total,
          perNight: Boolean(a.perNight),
        });
      }
    }

    // 2. Dari booking.breakdown.lines
    if (list.length === 0 && Array.isArray(booking?.breakdown?.lines)) {
      for (const l of booking.breakdown.lines) {
        if (l.code === 'ADDON') {
          const qty =
            Number(l.quantity) ||
            Number(l.effectiveQuantity) ||
            Number(l.includedQuantity) ||
            1;
          const total = Number(l.amount) || 0;
          const uPrice =
            Number(l.unitPrice) || (total && qty ? total / qty : 0);
          list.push({
            name: l.label || 'Layanan Tambahan',
            quantity: qty,
            unitPrice: uPrice,
            amount: total,
            perNight: Boolean(l.perNight),
          });
        }
      }
    }

    // 3. Fallback order.addons
    if (list.length === 0 && Array.isArray(order.addons)) {
      for (const a of order.addons) {
        const qty = Number(a.quantity) || 1;
        const total = Number(a.amount ?? a.totalPrice ?? 0) || 0;
        const uPrice = Number(a.unitPrice ?? a.price ?? 0) || 0;
        list.push({
          name: a.name || a.label || 'Layanan Tambahan',
          quantity: qty,
          unitPrice: uPrice,
          amount: total,
          perNight: Boolean(a.perNight),
        });
      }
    }

    return list;
  }, [order, booking]);

  const serviceFees =
    (Number(order?.guestAdminFee) || 0) +
    (Number(order?.guestServiceFee) || 0) +
    (Number(order?.guestTaxFee) || 0);

  const promoDiscount =
    (Number(order?.promoRentalDiscount) || 0) +
    (Number(order?.promoFeeDiscount) || 0);

  const fullRental =
    isDP && isUnsettledDP
      ? (Number(order?.downPaymentAmount) || 0) + remainingBalance
      : Math.max(
          0,
          (Number(order?.totalAmount) || 0) - serviceFees + promoDiscount,
        );

  const paidAddonLines = React.useMemo(
    () => addonLines.filter((a) => (Number(a.amount) || 0) > 0),
    [addonLines],
  );
  const totalPaidAddons = paidAddonLines.reduce(
    (s, a) => s + (Number(a.amount) || 0),
    0,
  );

  const baseRental = Math.max(0, fullRental - totalPaidAddons);

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground flex flex-col justify-between print:bg-white">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA SEARCH BAR) ═══ */}
      <div className="print:hidden">
        <ExploreHeader
          showSearch={false}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-1 w-full print:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue" />
            <p className="text-xs font-semibold">Memuat rincian pesanan...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-5 shadow-2xs max-w-md mx-auto my-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/8 flex items-center justify-center p-3 border border-brand-blue/15 shadow-2xs">
              <img
                src="/images/logo/logogram_blue.svg"
                alt="Embun"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Masuk ke Akun Anda</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Sesi masuk Anda telah berakhir atau belum aktif. Silakan masuk untuk melihat rincian pemesanan ini.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all cursor-pointer"
            >
              <LogIn size={15} />
              <span>Masuk Sekarang</span>
            </button>
            <div>
              <Link
                href="/orders"
                className="text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Kembali ke Pesanan Saya
              </Link>
            </div>
          </div>
        ) : error && !order ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-border text-foreground text-sm max-w-md mx-auto my-12 space-y-4 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">Gagal Memuat Detail</h3>
              <p className="text-xs text-foreground-muted">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold hover:bg-brand-blue-hover transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw size={13} />
              <span>Coba Lagi</span>
            </button>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Navigasi Breadcrumb */}
            <div className="print:hidden">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 text-xs font-bold text-foreground-muted hover:text-brand-blue transition-colors group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-brand-blue" />
                <span>Kembali ke Pesanan Saya</span>
              </Link>
            </div>

            {/* Header Judul Halaman & Status / Cetak Invoice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Detail Pesanan
              </h1>

              <div className="flex items-center gap-2.5 flex-wrap print:hidden">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border hover:border-brand-blue hover:text-brand-blue bg-white text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs hover:bg-brand-blue/5"
                  title="Lihat atau cetak invoice resmi seperti aplikasi Flutter"
                >
                  <Printer size={14} className="text-brand-blue" />
                  <span>Cetak Invoice</span>
                </button>
                {badge && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                )}
              </div>
            </div>

            {/* Error Banner jika ada aksi yang gagal */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ═══ GRID RESPONSIVE 2 KOLOM (DESKTOP) ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* ── KOLOM KIRI (KONTEN UTAMA) ── */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                {/* ════════════════════════════════════════════════════════════════
                    1. KARTU STATUS HERO
                ════════════════════════════════════════════════════════════════ */}
                {isPaid ? (
                  /* KARTU TIKET RESMI */
                  <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-neutral-700 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0">
                          <span className="text-[10.5px] uppercase font-bold tracking-wider">
                            Tiket Resmi
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] uppercase font-bold tracking-wider text-foreground-muted block">
                            Kode Booking
                          </span>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                            <span className="text-2xl sm:text-3xl font-black text-brand-blue tracking-wider font-mono">
                              {shortCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(shortCode)}
                              className="p-1.5 rounded-xl border border-border bg-white hover:bg-surface text-foreground-muted hover:text-foreground cursor-pointer transition-colors"
                              title="Salin Kode"
                            >
                              {copied ? (
                                <Check size={16} className="text-emerald-600" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-foreground-muted font-mono break-all pt-1">
                          No. Transaksi: <span className="text-foreground">{order.id}</span>
                        </p>
                      </div>

                      {/* QR Code Container Check-in */}
                      <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border shadow-xs shrink-0 self-center sm:self-auto">
                        <div className="w-44 h-44 sm:w-48 sm:h-48 bg-surface flex items-center justify-center rounded-2xl p-2.5 border border-border/60 relative overflow-hidden">
                          {isUnsettledDP ? (
                            <>
                              <DummyQrPlaceholder className="w-full h-full object-contain filter blur-md opacity-25 select-none pointer-events-none scale-105 text-neutral-800" />
                              <div className="absolute inset-0 flex items-center justify-center p-3">
                                <span className="px-4 py-1.5 rounded-full bg-white/95 border border-neutral-200/90 text-neutral-600 text-xs font-semibold shadow-2xs backdrop-blur-xs tracking-wide select-none">
                                  Belum Aktif
                                </span>
                              </div>
                            </>
                          ) : (
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
                                order.id,
                              )}`}
                              alt="QR Code Check-in"
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                        {isUnsettledDP ? (
                          <span className="text-[11px] font-medium text-foreground-muted text-center select-none">
                            Aktif setelah pelunasan
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-foreground-muted flex items-center gap-1.5">
                            <QrCode size={13} className="text-brand-blue" />
                            Scan untuk Check-in
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : isExpired ? (
                  /* KARTU STATUS KEDALUWARSA */
                  <div className="bg-neutral-50 rounded-3xl border border-neutral-300/80 p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-neutral-700 bg-neutral-200/70 border border-neutral-300 px-2.5 py-1 rounded-full w-fit">
                          <Clock3 size={14} />
                          <span className="text-[10.5px] uppercase font-bold tracking-wider">
                            Batas Waktu Pembayaran Berakhir
                          </span>
                        </div>
                        <h2 className="text-lg font-extrabold text-foreground">
                          Pesanan Ini Telah Kedaluwarsa
                        </h2>
                        <p className="text-xs text-foreground-muted max-w-md leading-relaxed">
                          Batas waktu pembayaran untuk transaksi ini telah habis. Kuota unit penginapan telah
                          dilepaskan kembali dan <strong>tiket tidak berlaku untuk check-in</strong>.
                        </p>
                      </div>

                      <Link
                        href="/explore"
                        className="px-5 py-2.5 rounded-full bg-brand-blue text-white text-xs font-bold shadow-xs hover:bg-brand-blue-hover transition-all shrink-0"
                      >
                        Pesan Ulang di Explore
                      </Link>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-neutral-200 text-neutral-600 text-[11px] font-mono">
                      No. Transaksi: {order.id} · Kedaluwarsa pada {order.paymentExpiresAt ? formatDateDisplay(order.paymentExpiresAt) : '-'}
                    </div>
                  </div>
                ) : isCancelled ? (
                  /* KARTU STATUS DIBATALKAN */
                  <div className="bg-red-50/70 rounded-3xl border border-red-200 p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-red-700 bg-red-100/80 border border-red-200 px-2.5 py-1 rounded-full w-fit">
                        <XCircle size={14} />
                        <span className="text-[10.5px] uppercase font-bold tracking-wider">
                          Pesanan Dibatalkan
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-red-950">
                        Pemesanan Ini Telah Dibatalkan
                      </h2>
                      <p className="text-xs text-red-800/80 max-w-md leading-relaxed">
                        Pesanan ini tidak dapat digunakan untuk menginap di campsite.
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/90 border border-red-200 text-red-700 text-[11px] font-mono">
                      No. Transaksi: <span className="font-semibold">{order.id}</span>
                    </div>
                  </div>
                ) : isPending ? (
                  /* KARTU STATUS MENUNGGU PEMBAYARAN */
                  <div className="bg-amber-50/70 rounded-3xl border border-amber-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-800 bg-amber-100/80 border border-amber-200 px-2.5 py-1 rounded-full w-fit">
                        <Clock size={14} />
                        <span className="text-[10.5px] uppercase font-bold tracking-wider">
                          Menunggu Pembayaran
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-amber-950">
                        Selesaikan Pembayaran via Xendit
                      </h2>
                      <p className="text-xs text-amber-900/80 max-w-md leading-relaxed">
                        Silakan selesaikan pembayaran sebelum batas waktu berakhir untuk menerbitkan <strong>E-Tiket & QR Code Check-in resmi</strong>.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 text-amber-900 text-[11px] font-mono flex items-center justify-between flex-wrap gap-2">
                      <span>No. Transaksi: <span className="font-semibold">{order.id}</span></span>
                      {order.paymentExpiresAt && (
                        <span className="text-amber-700 font-sans">Batas: {formatDateDisplay(order.paymentExpiresAt)}</span>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={paying}
                        className="w-full sm:w-auto py-3 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {paying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                        <span>{paying ? 'Menghubungkan ke Xendit...' : `Bayar Sekarang · ${rupiah(order.totalAmount)}`}</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* ════════════════════════════════════════════════════════════════
                    2. CARD SKEMA DP 50% (JIKA BERLAKU)
                ════════════════════════════════════════════════════════════════ */}
                {isPaid && isDP && (
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                          Skema Pembayaran: Uang Muka (DP 50%)
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isUnsettledDP
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isUnsettledDP ? 'Belum Dilunasi' : 'Lunas'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/50 space-y-1">
                        <span className="text-amber-800/80 font-medium">DP Dibayar Online</span>
                        <p className="text-base font-black text-foreground">
                          {rupiah(order.downPaymentAmount || order.totalAmount)}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white/80 border border-amber-200/50 space-y-1">
                        <span className="text-amber-800/80 font-medium">Sisa Tagihan Pelunasan</span>
                        <p className="text-base font-black text-amber-900">
                          {rupiah(remainingBalance)}
                        </p>
                      </div>
                    </div>

                    {isUnsettledDP ? (
                      <div className="space-y-3 pt-1 print:hidden">
                        <div className="p-3.5 rounded-2xl bg-amber-100/60 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                          💡 <strong>Pemberitahuan Pelunasan:</strong> Sisa tagihan wajib dilunasi paling
                          lambat{' '}
                          <strong>
                            {settlementDeadlineFormatted
                              ? `${settlementDeadlineFormatted} (H-1 sebelum check-in)`
                              : 'H-1 sebelum jadwal check-in'} pukul 23:59 WIB
                          </strong>{' '}
                          melalui aplikasi/web Embun.
                        </div>

                        <button
                          type="button"
                          onClick={handleSettleDP}
                          disabled={settling}
                          className="w-full py-3.5 px-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          {settling ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CreditCard size={16} />
                          )}
                          <span>
                            {settling
                              ? 'Membuka Invoice Pelunasan...'
                              : `Lunasi Sisa Tagihan Sekarang · ${rupiah(remainingBalance)}`}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                        <Check size={16} className="text-emerald-700" />
                        <span>Tagihan DP pesanan ini sudah berhasil dilunasi sepenuhnya.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════════
                    3. PROPERTI & JADWAL MENGINAP
                ════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 space-y-5 shadow-2xs">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
                    <div className="space-y-1.5 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-brand-blue/8 text-brand-blue">
                        {order.campsite?.name || 'Campsite'}
                      </span>
                      <h3 className="font-extrabold text-lg sm:text-xl text-foreground">
                        {booking?.block?.name || 'Unit Penginapan'}
                      </h3>
                      <p className="text-xs text-foreground-muted">
                        {booking?.packageName ? `${booking.packageName} · ` : ''}
                        {order.campsite?.address || order.campsite?.city}
                      </p>
                    </div>

                    {order.campsite?.coverPhotoUrl && (
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-border shrink-0">
                        <img
                          src={resolveAssetUrl(order.campsite.coverPhotoUrl)}
                          alt="Campsite"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Links ke Maps / WA */}
                  <div className="flex items-center gap-2.5 flex-wrap print:hidden">
                    {order.campsite?.googleMapsUrl && (
                      <a
                        href={order.campsite.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border hover:bg-surface text-xs font-semibold text-foreground transition-colors"
                      >
                        <MapPin size={13} className="text-brand-blue" />
                        <span>Buka Google Maps</span>
                        <ExternalLink size={11} className="text-foreground-muted" />
                      </a>
                    )}
                    {isPaid && !isUnsettledDP && order.campsite?.emergencyWhatsapp && (
                      <a
                        href={`https://wa.me/${order.campsite.emergencyWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-semibold text-emerald-800 transition-colors"
                      >
                        <MessageCircle size={13} className="text-emerald-600" />
                        <span>Hubungi Pengelola Camp</span>
                      </a>
                    )}
                  </div>

                  {/* Check-In / Check-Out Grid */}
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                        <Calendar size={13} className="text-brand-blue" /> Check-In
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {formatDateDisplay(booking?.checkIn)}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        Mulai {order.campsite?.checkInTime || '14:00'} WIB
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                        <Calendar size={13} className="text-brand-blue" /> Check-Out
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {formatDateDisplay(booking?.checkOut)}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        Maksimal {order.campsite?.checkOutTime || '12:00'} WIB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <Users size={14} className="text-brand-blue" />
                      Jumlah Tamu: <strong className="text-foreground">{booking?.adultCount || 2} Orang</strong>
                    </span>
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-blue" />
                      Durasi: <strong className="text-brand-blue">{nights} Malam</strong>
                    </span>
                  </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    4. DATA TAMU PEMESAN
                ════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 space-y-3 shadow-2xs">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    Data Tamu Pemesan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-surface border border-border/50">
                      <span className="text-foreground-muted block text-[10.5px]">Nama Lengkap</span>
                      <strong className="text-foreground text-sm">
                        {order.guestName || 'Tamu Embun'}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-surface border border-border/50">
                      <span className="text-foreground-muted block text-[10.5px]">Nomor WhatsApp</span>
                      <strong className="text-foreground text-sm">
                        {order.guestPhone || '-'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    5. LAYANAN TAMBAHAN (ADD-ON)
                ════════════════════════════════════════════════════════════════ */}
                {addonLines.length > 0 && (
                  <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/70 pb-3">
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                        <PackageCheck size={16} className="text-brand-blue" />
                        <span>Fasilitas & Layanan Tambahan (Add-on)</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
                        {addonLines.length} Item
                      </span>
                    </div>

                    <div className="divide-y divide-border/60">
                      {addonLines.map((item, idx) => {
                        const isFree = (Number(item.amount) || 0) === 0;
                        return (
                          <div
                            key={idx}
                            className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0 text-xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <p className="font-bold text-foreground text-sm">{item.name}</p>
                              <p className="text-[11px] text-foreground-muted">
                                {isFree ? (
                                  <span className="text-emerald-700 font-medium">
                                    Sudah termasuk dalam paket
                                  </span>
                                ) : (
                                  <>
                                    {item.quantity} × {rupiah(item.unitPrice)}
                                    {item.perNight ? ` · ${nights} malam` : ''}
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="font-bold text-foreground text-sm shrink-0">
                              {isFree ? (
                                <span className="text-emerald-700 text-[11px] font-semibold bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                                  Gratis
                                </span>
                              ) : (
                                rupiah(item.amount)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════════
                    6. CATATAN UNTUK CAMPSITE
                ════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 space-y-3 shadow-2xs">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-brand-blue" />
                    <span>Catatan untuk Campsite</span>
                  </h4>
                  {bookingNote ? (
                    <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-line">
                      {bookingNote}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic">
                      Tidak ada catatan khusus dari tamu untuk pesanan ini.
                    </p>
                  )}
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    7. ATURAN & KEBIJAKAN CAMPSITE
                ════════════════════════════════════════════════════════════════ */}
                {(campsiteRules || campsiteHostNotes) && (
                  <div className="bg-white rounded-3xl border border-border p-6 sm:p-7 space-y-4 shadow-2xs">
                    <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ScrollText size={16} className="text-brand-blue" />
                      <span>Aturan & Kebijakan Campsite</span>
                    </h4>
                    <div className="space-y-3 text-xs">
                      {campsiteRules && (
                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 text-amber-950 space-y-1.5">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 block">
                            Aturan Menginap
                          </span>
                          <p className="leading-relaxed whitespace-pre-line text-neutral-700">
                            {campsiteRules}
                          </p>
                        </div>
                      )}
                      {campsiteHostNotes && (
                        <div className="p-4 rounded-2xl bg-surface border border-border/60 text-neutral-700 space-y-1.5">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground-muted block">
                            Catatan dari Pengelola Campsite
                          </span>
                          <p className="leading-relaxed whitespace-pre-line">
                            {campsiteHostNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── KOLOM KANAN (SIDEBAR: INVOICE & BANTUAN) ── */}
              <aside className="lg:col-span-5 xl:col-span-4 space-y-6">
                {/* ════════════════════════════════════════════════════════════════
                    8. RINCIAN BIAYA & INVOICE
                ════════════════════════════════════════════════════════════════ */}
                <div className="bg-white rounded-3xl border border-border p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt size={14} className="text-brand-blue" />
                      Rincian Pembayaran
                    </h4>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Biaya Sewa Unit Pokok */}
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">
                        Sewa {booking?.block?.name || 'Unit'} ({nights} malam)
                      </span>
                      <span className="font-semibold text-foreground">
                        {rupiah(baseRental)}
                      </span>
                    </div>

                    {/* Rincian Item Add-on Berbayar */}
                    {paidAddonLines.map((addon, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-foreground-muted">
                          {addon.name} ({addon.quantity}x
                          {addon.perNight ? ` · ${nights} malam` : ''})
                        </span>
                        <span className="font-semibold text-foreground">
                          {rupiah(addon.amount)}
                        </span>
                      </div>
                    ))}

                    {/* Biaya Layanan */}
                    {order.guestServiceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Biaya Layanan</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(order.guestServiceFee)}
                        </span>
                      </div>
                    )}

                    {/* Biaya Admin */}
                    {order.guestAdminFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">Biaya Admin</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(order.guestAdminFee)}
                        </span>
                      </div>
                    )}

                    {/* PPN */}
                    {order.guestTaxFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">PPN</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(order.guestTaxFee)}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
                      <span className="font-bold text-foreground">Total Tagihan Transaksi</span>
                      <span className="text-base font-black text-brand-blue">
                        {rupiah(order.totalAmount)}
                      </span>
                    </div>

                    {isPaid && isDP && (
                      <div className="pt-2.5 border-t border-border/60 space-y-1.5 text-xs">
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Sudah Dibayar (DP Online)</span>
                          <span>{rupiah(order.downPaymentAmount || order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-amber-900 font-bold">
                          <span>Sisa Tagihan Belum Dibayar</span>
                          <span>{rupiah(remainingBalance)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tombol Cetak Invoice Resmi */}
                  <div className="pt-3 border-t border-border/60 print:hidden">
                    <button
                      type="button"
                      onClick={() => setIsInvoiceOpen(true)}
                      className="w-full py-3 px-4 rounded-full border border-border bg-white hover:bg-surface text-brand-blue font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:border-brand-blue"
                    >
                      <Printer size={15} />
                      <span>Cetak Invoice / Unduh PDF</span>
                    </button>
                  </div>

                  {/* Tombol Aksi Pembayaran jika Pending */}
                  {isPending && (
                    <div className="pt-2 print:hidden">
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={paying}
                        className="w-full py-3 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {paying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                        <span>{paying ? 'Menghubungkan ke Xendit...' : `Bayar Sekarang · ${rupiah(order.totalAmount)}`}</span>
                      </button>
                    </div>
                  )}

                  {/* Tombol Sinkronisasi Status */}
                  <div className="pt-2 border-t border-border/60 print:hidden">
                    <button
                      type="button"
                      onClick={handleSync}
                      disabled={syncing}
                      className="w-full py-3 px-4 rounded-full border border-border bg-white hover:bg-surface text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw size={13} className={syncing ? 'animate-spin text-brand-blue' : ''} />
                      <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Status'}</span>
                    </button>
                  </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    9. WIDGET BANTUAN PELANGGAN CS
                ════════════════════════════════════════════════════════════════ */}
                <div className="p-6 rounded-3xl bg-white border border-border/80 shadow-2xs space-y-3 print:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-blue/8 flex items-center justify-center text-brand-blue shrink-0 border border-brand-blue/15">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Butuh Bantuan?</h4>
                      <p className="text-[11px] text-foreground-muted">Layanan pelanggan Embun</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    Punya pertanyaan seputar check-in, pelunasan sisa tagihan, atau kebijakan pembatalan?
                  </p>
                  <div className="space-y-2 pt-1">
                    <a
                      href="https://wa.me/6282131411919?text=Halo%20Embun%20CS,%20saya%20butuh%20bantuan%20terkait%20pesanan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-emerald-500 hover:text-emerald-700 bg-surface/50 hover:bg-emerald-50/50 text-xs font-bold text-foreground transition-all cursor-pointer"
                    >
                      <MessageCircle size={14} className="text-emerald-600" />
                      <span>Chat WhatsApp CS</span>
                    </a>
                    <a
                      href="mailto:support@embun.app"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-brand-blue hover:text-brand-blue bg-surface/50 hover:bg-brand-blue/5 text-xs font-bold text-foreground transition-all cursor-pointer"
                    >
                      <Mail size={14} className="text-brand-blue" />
                      <span>support@embun.app</span>
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </main>

      {/* ═══ FOOTER RESMI EXPLORE ═══ */}
      <div className="print:hidden">
        <ExploreFooter />
      </div>

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onSuccess={handleLoginSuccess}
        onLogout={() => {
          setCurrentUser(null);
          void load();
        }}
      />

      {/* Complete Profile Dialog */}
      <CompleteProfileModal
        isOpen={isCompleteProfileOpen}
        currentUser={currentUser}
        onClose={() => setIsCompleteProfileOpen(false)}
        onSuccess={(updated) => {
          setCurrentUser(updated);
          setIsCompleteProfileOpen(false);
        }}
      />

      {/* ═══ DOKUMEN INVOICE RESMI KHUSUS CETAK BROWSER / PDF (100% SESUAI FLUTTER INVOICE_PDF_SERVICE) ═══ */}
      {order && (
        <div className="hidden print:block p-0 m-0 w-full">
          <InvoiceDocument
            order={order}
            booking={booking}
            addonLines={addonLines}
            nights={nights}
            shortCode={shortCode}
          />
        </div>
      )}

      {/* Modal Dialog Preview & Cetak Invoice Resmi */}
      {order && (
        <InvoiceModal
          isOpen={isInvoiceOpen}
          onClose={() => setIsInvoiceOpen(false)}
          order={order}
          booking={booking}
          addonLines={addonLines}
          nights={nights}
          shortCode={shortCode}
        />
      )}
    </div>
  );
}
