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
  RotateCcw,
} from 'lucide-react';
import {
  fetchGuestOrder,
  initiateOrderPayment,
  initiateSettlementPayment,
  syncOrderStatus,
  initiatePayment,
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
import { CancelRefundModal } from '@/components/orders/CancelRefundModal';
import { RescheduleModal } from '@/components/orders/RescheduleModal';
import { ACCOUNT_I18N, type Language } from '@/lib/account-i18n';

function getOrderBadge(order: any, lang: Language = 'id') {
  const t = ACCOUNT_I18N[lang].orders.badges;
  if (order.status === 'PAID') {
    const isUnsettled =
      order.isDownPayment && (!order.settledAt || (order.remainingBalance ?? 0) > 0);
    if (isUnsettled) {
      return {
        label: t.dpUnsettled,
        className: 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-white/10',
        isDP: true,
      };
    }
    return {
      label: t.paid,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-white/10',
      isDP: false,
    };
  }
  if (order.status === 'PENDING') {
    return {
      label: t.pendingPayment,
      className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/20',
      isDP: false,
    };
  }
  if (order.status === 'COMPLETE' || order.status === 'COMPLETED') {
    return {
      label: t.complete,
      className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/20',
      isDP: false,
    };
  }
  if (order.status === 'CANCELLED') {
    return {
      label: t.cancelled,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10',
      isDP: false,
    };
  }
  if (order.status === 'EXPIRED') {
    return {
      label: t.expired,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10',
      isDP: false,
    };
  }
  if (order.status === 'REFUNDED') {
    return {
      label: t.refunded,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10',
      isDP: false,
    };
  }
  return {
    label: order.status || 'Draft',
    className: 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10',
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

function formatDateDisplay(dateStr?: string, lang: Language = 'id') {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
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
  lang: Language = 'id',
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

    return targetDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
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
  const [isCancelRefundOpen, setIsCancelRefundOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  // Language state (defaults to 'id', persist in localStorage)
  const [lang, setLang] = useState<Language>('id');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('embun_lang');
      if (savedLang === 'en' || savedLang === 'id') {
        setLang(savedLang);
      }
    }
  }, []);

  const handleToggleLanguage = () => {
    const nextLang: Language = lang === 'id' ? 'en' : 'id';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('embun_lang', nextLang);
    }
  };

  const t = ACCOUNT_I18N[lang].orderDetail;

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
      // Bila pesanan masih PENDING (misalnya baru kembali dari redirect pembayaran), lakukan auto-sync sekali
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
      const paymentUrl =
        paymentInit?.snapRedirectUrl ||
        paymentInit?.redirectUrl ||
        paymentInit?.invoiceUrl;
      if (!paymentUrl) {
        throw new Error('Gagal mendapatkan URL pembayaran.');
      }
      initiatePayment(paymentUrl);
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
      const paymentUrl = res?.invoiceUrl || res?.snapRedirectUrl || res?.redirectUrl;
      if (!paymentUrl) {
        throw new Error('Gagal membuat invoice pelunasan.');
      }
      initiatePayment(paymentUrl);
      await load();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pelunasan DP.');
    } finally {
      setSettling(false);
    }
  };



  const badge = order ? getOrderBadge(order, lang) : null;
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

  // Kelayakan Ubah Jadwal (Reschedule):
  // Syarat: Status PAID, bukan DP belum lunas, belum pernah reschedule, dan minimal H-7 sebelum check-in
  const canReschedule = React.useMemo(() => {
    if (!order || order.status !== 'PAID') return false;
    if (order.isRescheduled || order.bookings?.some((b: any) => b.isRescheduled || b.rescheduledAt)) return false;
    if (isUnsettledDP) return false;
    if (!booking?.checkIn) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  }, [order, isUnsettledDP, booking?.checkIn]);

  const isSettlementExpired = React.useMemo(() => {
    if (!isUnsettledDP) return false;
    let targetDate: Date | null = null;
    if (order?.settlementDeadline) {
      targetDate = new Date(order.settlementDeadline);
    } else if (booking?.checkIn) {
      if (typeof booking.checkIn === 'string' && !booking.checkIn.includes('T')) {
        const [y, m, day] = booking.checkIn.split('-').map(Number);
        targetDate = new Date(Date.UTC(y, m - 1, day - 1, 16, 59, 59));
      } else {
        const cin = new Date(booking.checkIn);
        targetDate = new Date(cin.getTime() - 24 * 60 * 60 * 1000);
      }
    }
    if (!targetDate || isNaN(targetDate.getTime())) return false;
    return Date.now() > targetDate.getTime();
  }, [isUnsettledDP, order?.settlementDeadline, booking?.checkIn]);

  // Kelayakan Batal / Refund:
  // Muncul saat PENDING atau PAID (sebelum tanggal check-in lewat, dan DP belum expired)
  const canCancel = React.useMemo(() => {
    if (!order) return false;
    if (order.status === 'CANCELLED' || order.status === 'EXPIRED' || order.status === 'REFUNDED') {
      return false;
    }
    if (isSettlementExpired) return false;
    if (order.status === 'PENDING') return true;
    if (order.status === 'PAID') {
      if (!booking?.checkIn) return true;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const checkInDate = new Date(booking.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() >= now.getTime();
    }
    return false;
  }, [order, booking?.checkIn, isSettlementExpired]);

  const isActuallyRefundEligible = isPaid && Boolean(order?.refund?.refundEligible);

  const settlementDeadlineFormatted = React.useMemo(() => {
    return formatSettlementDeadline(order?.settlementDeadline, booking?.checkIn, lang);
  }, [order?.settlementDeadline, booking?.checkIn, lang]);

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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between print:bg-white">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA SEARCH BAR) ═══ */}
      <div className="print:hidden">
        <ExploreHeader
          showSearch={false}
          showUserMenu={true}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          lang={lang}
          onToggleLanguage={handleToggleLanguage}
        />
      </div>

      <main className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 flex-1 w-full print:hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue dark:text-brand-lime" />
            <p className="text-xs font-semibold">{t.loadingDetail}</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-20 bg-white dark:bg-surface rounded-3xl border border-border p-8 space-y-5 shadow-2xs max-w-md mx-auto my-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/8 dark:bg-brand-lime/10 flex items-center justify-center p-3 border border-brand-blue/15 dark:border-brand-lime/20 shadow-2xs">
              <img
                src="/images/logo/logogram_blue.svg"
                alt="Embun"
                className="w-full h-full object-contain dark:hidden"
              />
              <img
                src="/images/logo/logogram_green.svg"
                alt="Embun"
                className="w-full h-full object-contain hidden dark:block"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">{t.authRequiredTitle}</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {t.authRequiredDesc}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-blue dark:bg-brand-lime text-white dark:text-black text-xs font-bold dark:font-black shadow-md hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 transition-all cursor-pointer"
            >
              <LogIn size={15} />
              <span>{t.loginNow}</span>
            </button>
            <div>
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-white dark:bg-surface hover:bg-surface text-xs font-semibold text-foreground transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
              >
                <ArrowLeft
                  size={13}
                  className="text-foreground-muted group-hover:text-brand-blue dark:group-hover:text-brand-lime group-hover:-translate-x-0.5 transition-transform"
                />
                <span>{t.backToOrders}</span>
              </Link>
            </div>
          </div>
        ) : error && !order ? (
          <div className="p-8 text-center bg-white dark:bg-surface rounded-3xl border border-border text-foreground text-sm max-w-md mx-auto my-12 space-y-4 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">{t.loadFailed}</h3>
              <p className="text-xs text-foreground-muted">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-brand-blue dark:bg-brand-lime text-white dark:text-black text-xs font-bold dark:font-black hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw size={13} />
              <span>{t.retry}</span>
            </button>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Header Judul Halaman & Status / Cetak Invoice */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/70">
              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer shrink-0 print:hidden"
                  aria-label={t.backToOrders}
                >
                  <ArrowLeft size={22} className="stroke-[2.2]" />
                </Link>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {t.title}
                </h1>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap print:hidden">
                <button
                  type="button"
                  onClick={() => setIsInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-white dark:bg-surface text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10"
                  title={t.printInvoice}
                >
                  <Printer size={14} className="text-brand-blue dark:text-brand-lime" />
                  <span>{t.printInvoice}</span>
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
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
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
                  <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0">
                          <span className="text-[10.5px] uppercase font-bold tracking-wider">
                            {t.officialTicket}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] uppercase font-bold tracking-wider text-foreground-muted block">
                            {t.bookingCode}
                          </span>
                          <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                            <span className="text-2xl sm:text-3xl font-black text-brand-blue dark:text-brand-lime tracking-wider font-mono">
                              {shortCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(shortCode)}
                              className="p-1.5 rounded-xl border border-border bg-white dark:bg-surface hover:bg-surface text-foreground-muted hover:text-foreground cursor-pointer transition-colors"
                              title={t.copyCode}
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
                          {t.transactionNo} <span className="text-foreground">{order.id}</span>
                        </p>
                      </div>

                      {/* QR Code Container Check-in */}
                      <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-surface border border-border shadow-xs shrink-0 self-center sm:self-auto">
                        <div className="w-44 h-44 sm:w-48 sm:h-48 bg-surface flex items-center justify-center rounded-2xl p-2.5 border border-border/60 relative overflow-hidden">
                          {isUnsettledDP ? (
                            <>
                              <DummyQrPlaceholder className="w-full h-full object-contain filter blur-md opacity-25 select-none pointer-events-none scale-105 text-neutral-800" />
                              <div className="absolute inset-0 flex items-center justify-center p-3">
                                <span className="px-4 py-1.5 rounded-full bg-white/95 dark:bg-black/90 border border-neutral-200/90 dark:border-white/10 text-neutral-600 dark:text-neutral-300 text-xs font-semibold shadow-2xs backdrop-blur-xs tracking-wide select-none">
                                  {t.qrNotActive}
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
                            {t.dpActiveNotice}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-foreground-muted flex items-center gap-1.5">
                            <QrCode size={13} className="text-brand-blue" />
                            {t.qrScanNotice}
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
                            {t.expiredDeadline}
                          </span>
                        </div>
                        <h2 className="text-lg font-extrabold text-foreground">
                          {t.expiredTitle}
                        </h2>
                        <p className="text-xs text-foreground-muted max-w-md leading-relaxed">
                          {t.expiredDesc}
                        </p>
                      </div>

                      <Link
                        href="/explore"
                        className="px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover dark:bg-brand-lime dark:text-black dark:hover:bg-brand-lime/90 text-white text-xs font-bold shadow-xs transition-all shrink-0"
                      >
                        {t.reorderInExplore}
                      </Link>
                    </div>
                    <div className="p-3 rounded-2xl bg-white dark:bg-surface border border-neutral-200 dark:border-border text-neutral-600 dark:text-neutral-400 text-[11px] font-mono">
                      {t.transactionNo} {order.id} · {order.paymentExpiresAt ? t.expiredOn(formatDateDisplay(order.paymentExpiresAt, lang)) : '-'}
                    </div>
                  </div>
                ) : isCancelled ? (
                  /* KARTU STATUS DIBATALKAN */
                  <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 px-2.5 py-1 rounded-full w-fit">
                        <XCircle size={14} className="text-neutral-500 dark:text-neutral-400" />
                        <span className="text-[10.5px] uppercase font-bold tracking-wider">
                          {t.cancelledBadge}
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-foreground">
                        {t.cancelledTitle}
                      </h2>
                      <p className="text-xs text-foreground-muted max-w-md leading-relaxed">
                        {t.cancelledDesc}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-surface/50 border border-border text-foreground-muted text-[11px] font-mono">
                      {t.transactionNo} <span className="font-semibold text-foreground">{order.id}</span>
                    </div>
                  </div>
                ) : isPending ? (
                  /* KARTU STATUS MENUNGGU PEMBAYARAN */
                  <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 px-2.5 py-1 rounded-full w-fit">
                        <Clock size={14} />
                        <span className="text-[10.5px] uppercase font-bold tracking-wider">
                          {t.pendingBadge}
                        </span>
                      </div>
                      <h2 className="text-lg font-extrabold text-foreground">
                        {t.pendingTitle}
                      </h2>
                      <p className="text-xs text-foreground-muted max-w-md leading-relaxed">
                        {t.pendingDesc}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-surface/50 border border-border text-foreground-muted text-[11px] font-mono flex items-center justify-between flex-wrap gap-2">
                      <span>{t.transactionNo} <span className="font-semibold text-foreground">{order.id}</span></span>
                      {order.paymentExpiresAt && (
                        <span className="text-amber-600 dark:text-amber-400 font-sans font-medium">{t.paymentDeadline(formatDateDisplay(order.paymentExpiresAt, lang))}</span>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={paying}
                        className="w-full sm:w-auto py-3 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover dark:bg-brand-lime dark:text-black dark:hover:bg-brand-lime/90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {paying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                        <span>{paying ? t.connectingPayment : t.payNowAmount(rupiah(order.totalAmount))}</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* ════════════════════════════════════════════════════════════════
                    2. CARD SKEMA DP 50% (JIKA BERLAKU)
                ════════════════════════════════════════════════════════════════ */}
                {isPaid && isDP && (
                  <div className="bg-white dark:bg-surface border border-border rounded-3xl p-6 sm:p-7 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                          {t.dpSchemeTitle}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isUnsettledDP
                            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50'
                            : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50'
                        }`}
                      >
                        {isUnsettledDP ? t.unsettled : t.settled}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-surface/50 border border-border space-y-1">
                        <span className="text-foreground-muted font-medium">{t.dpPaidOnline}</span>
                        <p className="text-base font-black text-foreground">
                          {rupiah(order.downPaymentAmount || order.totalAmount)}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-surface/50 border border-border space-y-1">
                        <span className="text-foreground-muted font-medium">{t.remainingBalanceLabel}</span>
                        <p className="text-base font-black text-foreground">
                          {rupiah(remainingBalance)}
                        </p>
                      </div>
                    </div>

                    {isUnsettledDP ? (
                      <div className="space-y-3 pt-1 print:hidden">
                        {isSettlementExpired ? (
                          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
                            ⏳ <strong>{t.settleExpired}:</strong> {t.settlementExpiredNotice}
                          </div>
                        ) : (
                          <>
                            <div className="p-3.5 rounded-2xl bg-amber-100/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs leading-relaxed">
                              💡 {t.settlementNotice(
                                settlementDeadlineFormatted
                                  ? `${settlementDeadlineFormatted} (${lang === 'en' ? 'D-1 before check-in' : 'H-1 sebelum check-in'})`
                                  : (lang === 'en' ? 'D-1 before check-in' : 'H-1 sebelum jadwal check-in')
                              )}
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
                                  ? t.openingSettlementInvoice
                                  : t.settleBalanceNow(rupiah(remainingBalance))}
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <Check size={16} className="text-emerald-700 dark:text-emerald-400" />
                        <span>{t.dpFullySettled}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════════
                    3. PROPERTI & JADWAL MENGINAP
                ════════════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 space-y-5 shadow-2xs">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/70">
                    <div className="space-y-1.5 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider bg-brand-blue/8 dark:bg-brand-lime/15 text-brand-blue dark:text-brand-lime">
                        {order.campsite?.name || t.campsiteDefault}
                      </span>
                      <h3 className="font-extrabold text-lg sm:text-xl text-foreground">
                        {booking?.block?.name || t.unitStay}
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border hover:bg-surface text-xs font-semibold text-foreground transition-colors hover:text-brand-blue dark:hover:text-brand-lime"
                      >
                        <MapPin size={13} className="text-brand-blue dark:text-brand-lime" />
                        <span>{t.openGoogleMaps}</span>
                        <ExternalLink size={11} className="text-foreground-muted" />
                      </a>
                    )}
                    {isPaid && !isUnsettledDP && order.campsite?.emergencyWhatsapp && (
                      <a
                        href={`https://wa.me/${order.campsite.emergencyWhatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300 transition-colors"
                      >
                        <MessageCircle size={13} className="text-emerald-500" />
                        <span>{t.contactHost}</span>
                      </a>
                    )}
                  </div>

                  {/* Check-In / Check-Out Grid */}
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                        <Calendar size={13} className="text-brand-blue dark:text-brand-lime" /> {t.checkIn}
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {formatDateDisplay(booking?.checkIn, lang)}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        {t.checkInTimeFrom(order.campsite?.checkInTime || '14:00')}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                        <Calendar size={13} className="text-brand-blue dark:text-brand-lime" /> {t.checkOut}
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {formatDateDisplay(booking?.checkOut, lang)}
                      </p>
                      <p className="text-[11px] text-foreground-muted">
                        {t.checkOutTimeTo(order.campsite?.checkOutTime || '12:00')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <Users size={14} className="text-brand-blue dark:text-brand-lime" />
                      <strong className="text-foreground">{t.guestCount(booking?.adultCount || 2)}</strong>
                    </span>
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-blue dark:text-brand-lime" />
                      <strong className="text-brand-blue dark:text-brand-lime">{t.duration(nights)}</strong>
                    </span>
                  </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    4. DATA TAMU PEMESAN
                ════════════════════════════════════════════════════════════════ */}
                <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 space-y-3 shadow-2xs">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                    {t.guestDetailsTitle}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-surface border border-border/50">
                      <span className="text-foreground-muted block text-[10.5px]">{t.guestFullName}</span>
                      <strong className="text-foreground text-sm">
                        {order.guestName || t.guestDefault}
                      </strong>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-surface border border-border/50">
                      <span className="text-foreground-muted block text-[10.5px]">{t.guestWhatsapp}</span>
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
                  <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-border/70 pb-3">
                      <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                        <PackageCheck size={16} className="text-brand-blue dark:text-brand-lime" />
                        <span>{t.addonsTitle}</span>
                      </h4>
                      <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full border border-neutral-200 dark:border-white/10">
                        {t.addonsCount(addonLines.length)}
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
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {t.includedInPackage}
                                  </span>
                                ) : (
                                  <>
                                    {item.quantity} × {rupiah(item.unitPrice)}
                                    {item.perNight ? ` · ${t.nightsDuration(nights)}` : ''}
                                  </>
                                )}
                              </p>
                            </div>
                            <div className="font-bold text-foreground text-sm shrink-0">
                              {isFree ? (
                                <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                                  {t.free}
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
                <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 space-y-3 shadow-2xs">
                  <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                    <FileText size={16} className="text-brand-blue dark:text-brand-lime" />
                    <span>{t.campsiteNoteTitle}</span>
                  </h4>
                  {bookingNote ? (
                    <div className="p-4 rounded-2xl bg-surface/80 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-line">
                      {bookingNote}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted italic">
                      {t.campsiteNoteEmpty}
                    </p>
                  )}
                </div>

                {/* ════════════════════════════════════════════════════════════════
                    7. ATURAN & KEBIJAKAN CAMPSITE
                ════════════════════════════════════════════════════════════════ */}
                {(campsiteRules || campsiteHostNotes) && (
                  <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 sm:p-7 space-y-4 shadow-2xs">
                    <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                      <ScrollText size={16} className="text-brand-blue dark:text-brand-lime" />
                      <span>{t.rulesTitle}</span>
                    </h4>
                    <div className="space-y-3 text-xs">
                      {campsiteRules && (
                        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-amber-950 dark:text-amber-200 space-y-1.5">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                            {t.stayRules}
                          </span>
                          <p className="leading-relaxed whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                            {campsiteRules}
                          </p>
                        </div>
                      )}
                      {campsiteHostNotes && (
                        <div className="p-4 rounded-2xl bg-surface border border-border/60 text-neutral-700 dark:text-neutral-300 space-y-1.5">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground-muted block">
                            {t.hostNotes}
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
                <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                      {t.paymentSummaryTitle}
                    </h4>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Biaya Sewa Unit Pokok */}
                    <div className="flex justify-between">
                      <span className="text-foreground-muted">
                        {t.rentUnit(booking?.block?.name || t.unitStay, nights)}
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
                          {addon.perNight ? ` · ${t.nightsDuration(nights)}` : ''})
                        </span>
                        <span className="font-semibold text-foreground">
                          {rupiah(addon.amount)}
                        </span>
                      </div>
                    ))}

                    {/* Biaya Layanan */}
                    {order.guestServiceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">{t.serviceFee}</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(order.guestServiceFee)}
                        </span>
                      </div>
                    )}

                    {/* Biaya Admin */}
                    {order.guestAdminFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">{t.adminFee}</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(order.guestAdminFee)}
                        </span>
                      </div>
                    )}

                    {/* PPN */}
                    {order.guestTaxFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-foreground-muted">{t.taxVat}</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(order.guestTaxFee)}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
                      <span className="font-bold text-foreground">{t.totalTransaction}</span>
                      <span className="text-base font-black text-brand-blue dark:text-brand-lime">
                        {rupiah(order.totalAmount)}
                      </span>
                    </div>

                    {isPaid && isDP && (
                      <div className="pt-2.5 border-t border-border/60 space-y-1.5 text-xs">
                        <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                          <span>{t.dpPaidSummary}</span>
                          <span>{rupiah(order.downPaymentAmount || order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-amber-900 dark:text-amber-300 font-bold">
                          <span>{t.remainingBalanceSummary}</span>
                          <span>{rupiah(remainingBalance)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi: Reschedule / Batal / Ajukan Refund */}
                  {(canReschedule || canCancel) && (
                    <div className="pt-3 border-t border-border/60 space-y-2 print:hidden">
                      {/* Tombol Ubah Jadwal (Reschedule) */}
                      {canReschedule && (
                        <button
                          type="button"
                          onClick={() => setIsRescheduleOpen(true)}
                          className="w-full py-3 px-4 rounded-full border border-brand-blue dark:border-brand-lime bg-white dark:bg-surface hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10 text-brand-blue dark:text-brand-lime font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <Calendar size={15} />
                          <span>{t.rescheduleButton}</span>
                        </button>
                      )}

                      {/* Tombol Batal / Ajukan Refund */}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => setIsCancelRefundOpen(true)}
                          className={`w-full py-3 px-4 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                            isActuallyRefundEligible
                              ? 'border border-rose-200 dark:border-rose-500/30 bg-rose-50/50 dark:bg-rose-500/10 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : 'border border-border bg-white dark:bg-surface hover:bg-surface text-foreground-muted hover:text-rose-600 dark:hover:text-rose-400'
                          }`}
                        >
                          <RotateCcw size={14} />
                          <span>
                            {isActuallyRefundEligible
                              ? t.applyRefund
                              : isPending
                              ? t.cancelOrder
                              : t.cancelOrderNoRefund}
                          </span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Tombol Aksi Pembayaran jika Pending */}
                  {isPending && (
                    <div className="pt-2 print:hidden">
                      <button
                        type="button"
                        onClick={handlePayNow}
                        disabled={paying}
                        className="w-full py-3 px-6 rounded-full bg-brand-blue dark:bg-brand-lime hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 text-white dark:text-black font-bold dark:font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {paying ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                        <span>{paying ? t.connectingPayment : t.payNowAmount(rupiah(order.totalAmount))}</span>
                      </button>
                    </div>
                  )}


                </div>

                {/* ════════════════════════════════════════════════════════════════
                    9. WIDGET BANTUAN PELANGGAN CS
                ════════════════════════════════════════════════════════════════ */}
                <div className="p-6 rounded-3xl bg-white dark:bg-surface border border-border/80 shadow-2xs space-y-3 print:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-brand-blue/8 dark:bg-brand-lime/10 flex items-center justify-center text-brand-blue dark:text-brand-lime shrink-0 border border-brand-blue/15 dark:border-brand-lime/20">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{t.needHelpTitle}</h4>
                      <p className="text-[11px] text-foreground-muted">{t.needHelpSubtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {t.needHelpDesc}
                  </p>
                  <div className="space-y-2 pt-1">
                    <a
                      href="https://wa.me/6282131411919?text=Halo%20Embun%20CS,%20saya%20butuh%20bantuan%20terkait%20pesanan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-emerald-500 hover:text-emerald-500 bg-surface/50 hover:bg-emerald-50/10 text-xs font-bold text-foreground transition-all cursor-pointer"
                    >
                      <MessageCircle size={14} className="text-emerald-500" />
                      <span>{t.chatWhatsappCs}</span>
                    </a>
                    <a
                      href="mailto:support@embun.app"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-surface/50 hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10 text-xs font-bold text-foreground transition-all cursor-pointer"
                    >
                      <Mail size={14} className="text-brand-blue dark:text-brand-lime" />
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
        <ExploreFooter lang={lang} />
      </div>

      {/* Guest Auth Modal */}
      <GuestAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        lang={lang}
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

      {/* Modal Batal & Refund */}
      {order && (
        <CancelRefundModal
          isOpen={isCancelRefundOpen}
          onClose={() => setIsCancelRefundOpen(false)}
          order={order}
          onSuccess={load}
        />
      )}

      {/* Modal Ubah Jadwal (Reschedule) */}
      {order && (
        <RescheduleModal
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          order={order}
          onSuccess={load}
        />
      )}
    </div>
  );
}
