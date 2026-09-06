'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tent,
  ShieldCheck,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Receipt,
  Info,
  FileText,
  ChevronRight,
} from 'lucide-react';
import {
  createRealOrder,
  initiateOrderPayment,
  initiatePayment,
  syncOrderStatus,
  getGuestToken,
  getGuestUser,
  setGuestSession,
  clearGuestSession,
  updateGuestProfile,
  resolveAssetUrl,
  rupiah,
  ApiError,
  fetchGuestOrders,
  cancelGuestOrder,
} from '@/lib/api-client';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import {
  CancellationPolicyModal,
  CancellationPolicyBannerButton,
} from '@/components/checkout/CancellationPolicyModal';
import { CHECKOUT_I18N } from '@/lib/checkout-i18n';
import { translateItemName } from '@/lib/spot-i18n';

interface CheckoutDraft {
  campsite: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    photoUrl?: string;
    googleMapsUrl?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
  spot: {
    id: string;
    name: string;
    tentType?: string;
  };
  selectedPackage: {
    id: string;
    name: string;
    price: number;
  };
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCount: number;
  paymentScheme: 'DP_50' | 'FULL';
  spotPricePerNight: number;
  selectedAddons: Record<string, number>;
  activeAddonsList: Array<{ id: string; name: string; price: number; qty: number }>;
  addonsTotal: number;
  totalServiceAndTaxFee: number;
  grandTotal: number;
  paymentAmountToPay: number;
  returnUrl?: string;
  extraPersonInfo?: {
    count: number;
    unitPrice: number;
    amount: number;
  } | null;
  serverQuote?: any;
}

function formatDateDisplay(dateStr?: string, lang: 'id' | 'en' = 'id') {
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

export function CheckoutClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [loading, setLoading] = useState(true);

  // Form data pemesan
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [agreed, setAgreed] = useState(true);

  // Skema bayar yang bisa diubah di halaman checkout
  const [paymentScheme, setPaymentScheme] = useState<'DP_50' | 'FULL'>('FULL');
  const [bookingNote, setBookingNote] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [existingPendingOrder, setExistingPendingOrder] = useState<any | null>(null);
  const [cancellingOldOrder, setCancellingOldOrder] = useState(false);
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>('id');

  const t = CHECKOUT_I18N[lang];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/en')) {
      setLang('en');
      return;
    }
    const savedLang = localStorage.getItem('embun_lang');
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'id' ? 'en' : 'id';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('embun_lang', nextLang);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cek auth
    const token = getGuestToken();
    const user = getGuestUser();

    if (user) {
      setCurrentUser(user);
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
    }

    // Cek apakah ada pesanan pending terakhir di sesi ini
    const lastOrderId = sessionStorage.getItem('embun_last_order_id');
    if (lastOrderId && token) {
      void fetchGuestOrders()
        .then((res) => {
          const orders = Array.isArray(res) ? res : res?.rows || [];
          const matched = orders.find((o: any) => o.id === lastOrderId && o.status === 'PENDING');
          if (matched) {
            setExistingPendingOrder(matched);
          }
        })
        .catch(() => {});
    }

    // Ambil data draft dari sessionStorage
    try {
      const stored = sessionStorage.getItem('embun_checkout_draft');
      if (stored) {
        const parsed: CheckoutDraft = JSON.parse(stored);
        setDraft(parsed);
        setPaymentScheme(parsed.paymentScheme || 'FULL');
      }
    } catch (e) {
      console.error('Failed to parse checkout draft:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-background flex flex-col items-center justify-center gap-3 text-foreground-muted">
        <Loader2 size={26} className="animate-spin text-brand-blue dark:text-brand-lime" />
        <p className="text-xs font-semibold">{t.loading}</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-foreground-muted mb-4">
          <Tent size={28} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">{t.notFoundTitle}</h2>
        <p className="text-xs text-foreground-muted max-w-sm mb-6">
          {t.notFoundDesc}
        </p>
        <Link
          href="/explore"
          className="px-6 py-3 rounded-full bg-brand-blue dark:bg-brand-lime text-white dark:text-black text-xs font-bold dark:font-black shadow-md hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 transition-all"
        >
          {t.backToExplore}
        </Link>
      </div>
    );
  }

  // Hitung ulang nominal jika skema bayar diubah di checkout
  const isDP = paymentScheme === 'DP_50';
  const cleanRental = draft.spotPricePerNight * draft.nights + draft.addonsTotal;
  const dpAmount = Math.round(cleanRental * 0.5);
  const remainingBalance = isDP ? cleanRental - dpAmount : 0;
  const currentPayable = isDP
    ? dpAmount + draft.totalServiceAndTaxFee
    : draft.grandTotal;

  const handleConfirmAndPay = async () => {
    setError(null);

    // Validasi form
    if (!fullName.trim()) {
      setError(t.errors.fillName);
      return;
    }
    const rawPhoneDigits = phone.replace(/\D/g, '');
    if (!rawPhoneDigits || rawPhoneDigits.length < 8) {
      setError(t.errors.fillPhone);
      return;
    }
    const cleanPhone = `08${rawPhoneDigits.startsWith('8') ? rawPhoneDigits.slice(1) : rawPhoneDigits}`;
    if (!address.trim()) {
      setError(t.errors.fillAddress);
      return;
    }
    if (!agreed) {
      setError(t.errors.agreeRequired);
      return;
    }

    setSubmitting(true);

    // Cek token autentikasi tamu
    const token = getGuestToken();
    if (!token) {
      setError(t.errors.authRequired);
      setIsAuthOpen(true);
      setSubmitting(false);
      return;
    }

    try {
      // Simpan pembaruan nama, phone & alamat ke session dan profile backend
      const currentUserData = getGuestUser() || {};
      const updatedUser = {
        ...currentUserData,
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim() || currentUserData.email,
        address: address.trim(),
      };
      setGuestSession(token, updatedUser);
      void updateGuestProfile({
        fullName: fullName.trim(),
        phone: cleanPhone,
        address: address.trim(),
      }).catch(() => {});

      const addons = Object.entries(draft.selectedAddons)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, quantity]) => ({ addonId, quantity }));

      const orderPayload = {
        campsiteId: draft.campsite.id,
        paymentMethod: 'TRANSFER' as const,
        isDownPayment: isDP,
        bookingNote: bookingNote.trim() || undefined,
        items: [
          {
            blockId: draft.spot.id,
            pricingPackageId: draft.selectedPackage.id,
            checkIn: draft.checkInDate,
            checkOut: draft.checkOutDate,
            adultCount: draft.guestCount,
            addons,
          },
        ],
      };

      // 1. Buat pesanan riil di backend
      const createdOrder = await createRealOrder(orderPayload);
      if (!createdOrder?.id) {
        throw new Error(t.errors.createFailed);
      }

      // 2. Inisiasi pembayaran dengan redirect langsung kembali ke website
      const returnUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/orders/detail?id=${createdOrder.id}`
          : undefined;
      const paymentInit = await initiateOrderPayment(createdOrder.id, {
        returnUrl,
      });
      const paymentUrl =
        paymentInit?.snapRedirectUrl ||
        paymentInit?.redirectUrl ||
        paymentInit?.invoiceUrl;

      if (!paymentUrl) {
        throw new Error(t.errors.urlFailed);
      }

      // Hapus draft checkout dari session
      sessionStorage.removeItem('embun_checkout_draft');
      sessionStorage.setItem('embun_last_order_id', createdOrder.id);

      // Best effort sync status sebelum navigasi
      void syncOrderStatus(createdOrder.id).catch(() => {});

      // Arahkan browser LANGSUNG ke halaman pembayaran aman
      initiatePayment(paymentUrl);
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setCurrentUser(null);
        setError(t.errors.sessionExpired);
        setIsAuthOpen(true);
      } else {
        const rawMsg = err.message || t.errors.orderFailed;
        const isConflict =
          rawMsg.includes('dibooking') ||
          rawMsg.includes('SpotUnavailable') ||
          rawMsg.includes('DateBlocked') ||
          rawMsg.includes('diblokir') ||
          rawMsg.includes('kavling') ||
          err?.status === 409;

        const friendlyMsg = isConflict
          ? t.errors.spotFull
          : rawMsg;
        setError(friendlyMsg);

        // Jika terjadi conflict karena tanggal/kavling sudah dibooking (biasanya oleh order pending tamu sendiri)
        if (isConflict) {
          void fetchGuestOrders()
            .then((res) => {
              const orders = Array.isArray(res) ? res : res?.rows || [];
              const pending = orders.find(
                (o: any) =>
                  o.status === 'PENDING' &&
                  (o.campsite?.id === draft.campsite.id ||
                    o.campsiteId === draft.campsite.id),
              );
              if (pending) {
                setExistingPendingOrder(pending);
              }
            })
            .catch(() => {});
        }
      }
      setSubmitting(false);
    }
  };

  // Bayar pesanan lama yang masih pending langsung ke payment gateway
  const handlePayExistingOrder = async () => {
    if (!existingPendingOrder?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      const returnUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/orders/detail?id=${existingPendingOrder.id}`
          : undefined;
      const paymentInit = await initiateOrderPayment(existingPendingOrder.id, {
        returnUrl,
      });
      const url =
        paymentInit?.snapRedirectUrl ||
        paymentInit?.redirectUrl ||
        paymentInit?.invoiceUrl;
      if (!url) throw new Error(t.errors.urlFailed);
      sessionStorage.removeItem('embun_checkout_draft');
      initiatePayment(url);
    } catch (e: any) {
      setError(e.message || t.errors.resumeFailed);
      setSubmitting(false);
    }
  };

  // Batalkan pesanan lama untuk melepaskan kuncian kavling, lalu buat baru
  const handleCancelAndRetry = async () => {
    if (!existingPendingOrder?.id) return;
    setCancellingOldOrder(true);
    setError(null);
    try {
      await cancelGuestOrder(
        existingPendingOrder.id,
        lang === 'en'
          ? 'Cancelled to recreate booking'
          : 'Dibatalkan untuk membuat pemesanan ulang',
      );
      setExistingPendingOrder(null);
      setCancellingOldOrder(false);
      // Beri sedikit jeda agar database melepaskan baris ketersediaan sebelum dicoba kembali
      setTimeout(() => {
        void handleConfirmAndPay();
      }, 700);
    } catch (e: any) {
      setError(e.message || t.errors.cancelOldFailed);
      setCancellingOldOrder(false);
    }
  };

  const handleBack = () => {
    if (draft?.returnUrl) {
      router.push(draft.returnUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background text-foreground flex flex-col justify-between">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA SEARCH) ═══ */}
      <ExploreHeader
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        showSearch={false}
        showUserMenu={true}
        lang={lang}
        onToggleLanguage={toggleLanguage}
      />

      <main className="max-w-[2520px] mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 lg:py-10 flex-1">
        {/* Title Bar & Back Button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer"
              aria-label={t.back}
            >
              <ArrowLeft size={22} className="stroke-[2.2]" />
            </button>
            <h1 className="font-extrabold text-xl sm:text-2xl text-foreground tracking-tight">
              {t.pageTitle}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ════════════════════════════════════════════════════════════════
              KOLOM KIRI: FORM & DATA PEMESANAN (AIRBNB STYLE)
              Di mobile: Tampil di bawah Ringkasan (order-2 lg:order-1), diakhiri tombol Konfirmasi & Bayar di paling bawah.
              Di desktop: Tampil di kolom kiri (lg:col-span-7).
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            {/* 1. Perjalanan Anda (Khusus desktop; di mobile sudah tercakup rapi di kartu ringkasan unit di atas) */}
            <div className="hidden lg:block bg-white dark:bg-surface rounded-3xl border border-border p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-foreground">{t.tripSection.title}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-surface/70 dark:bg-background/50 border border-border/60 space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                    <Calendar size={13} className="text-brand-blue dark:text-brand-lime" /> {t.tripSection.dates}
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {formatDateDisplay(draft.checkInDate, lang)} – {formatDateDisplay(draft.checkOutDate, lang)}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    {lang === 'en' ? 'Duration: ' : 'Durasi: '}<strong>{t.tripSection.duration(draft.nights)}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface/70 dark:bg-background/50 border border-border/60 space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                    <Users size={13} className="text-brand-blue dark:text-brand-lime" /> {t.tripSection.guests}
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {t.tripSection.guestsCount(draft.guestCount)}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    {draft.spot.name} · {draft.selectedPackage.name}
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <CancellationPolicyBannerButton
                  checkInDate={draft.checkInDate}
                  onClick={() => setShowCancellationModal(true)}
                  lang={lang}
                />
              </div>
            </div>

            {/* 2. Data Pemesan */}
            <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-foreground">{t.contactSection.title}</h2>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1 text-[11px]">
                    {t.contactSection.fullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.contactSection.fullNamePlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue dark:focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-blue/20 dark:focus:ring-brand-lime/20 text-sm bg-surface/40 dark:bg-background/60 text-foreground transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1 text-[11px]">
                      {t.contactSection.phoneLabel}
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1 text-xs font-bold text-foreground pointer-events-none select-none border-r border-border pr-2.5 py-1">
                        <span>🇮🇩</span>
                        <span>+62</span>
                      </div>
                      <input
                        type="tel"
                        value={phone ? phone.replace(/^(\+62|62|0)/, '') : ''}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.startsWith('62')) val = val.slice(2);
                          while (val.startsWith('0')) val = val.slice(1);
                          setPhone(val ? `08${val.startsWith('8') ? val.slice(1) : val}` : '');
                        }}
                        placeholder={t.contactSection.phonePlaceholder}
                        className="w-full pl-20 pr-4 py-3 rounded-2xl border border-border focus:border-brand-blue dark:focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-blue/20 dark:focus:ring-brand-lime/20 text-sm bg-surface/40 dark:bg-background/60 text-foreground transition-colors font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1 text-[11px]">
                      {t.contactSection.emailLabel}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.contactSection.emailPlaceholder}
                      className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue dark:focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-blue/20 dark:focus:ring-brand-lime/20 text-sm bg-surface/40 dark:bg-background/60 text-foreground transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1 text-[11px]">
                    {t.contactSection.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.contactSection.addressPlaceholder}
                    className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue dark:focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-blue/20 dark:focus:ring-brand-lime/20 text-sm bg-surface/40 dark:bg-background/60 text-foreground transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Skema Pembayaran */}
            <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">{t.paymentSchemeSection.title}</h2>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isDP
                    ? 'text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80'
                    : 'text-brand-blue dark:text-brand-lime bg-brand-blue/8 dark:bg-brand-lime/10 border border-brand-blue/20 dark:border-brand-lime/30'
                }`}>
                  {isDP ? t.paymentSchemeSection.badgeDp : t.paymentSchemeSection.badgeFull}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-surface/50 dark:bg-background/50 border border-border/70 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {isDP ? t.paymentSchemeSection.dpTitle : t.paymentSchemeSection.fullTitle}
                  </span>
                  <span className="text-[11px] text-foreground-muted">
                    {isDP
                      ? t.paymentSchemeSection.dpSub(rupiah(remainingBalance))
                      : t.paymentSchemeSection.fullSub}
                  </span>
                </div>
                <span className="text-base font-black text-brand-blue dark:text-brand-lime">
                  {rupiah(currentPayable)}
                </span>
              </div>

              {isDP && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs leading-relaxed flex items-start gap-2">
                  <Info size={15} className="shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                  <span>
                    {t.paymentSchemeSection.dpNotice(rupiah(currentPayable), rupiah(remainingBalance))}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Catatan untuk Campsite (Opsional) */}
            <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-brand-blue dark:text-brand-lime" />
                  <h2 className="text-base font-extrabold text-foreground">{t.notesSection.title}</h2>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted bg-surface dark:bg-background px-2.5 py-0.5 rounded-full border border-border">
                  {t.notesSection.optionalBadge}
                </span>
              </div>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {t.notesSection.desc}
              </p>
              <textarea
                rows={3}
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                placeholder={t.notesSection.placeholder}
                maxLength={500}
                className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue dark:focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-blue/20 dark:focus:ring-brand-lime/20 text-sm bg-surface/40 dark:bg-background/60 text-foreground transition-colors resize-none placeholder:text-foreground-muted/60"
              />
              <div className="flex justify-end text-[11px] text-foreground-muted">
                <span>{bookingNote.length}/500</span>
              </div>
            </div>

            {/* 5. Aturan & Kebijakan Campsite */}
            <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 shadow-2xs space-y-3.5">
              <h2 className="text-base font-extrabold text-foreground">{t.policySection.title}</h2>

              <ul className="space-y-2 text-xs text-foreground-muted leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-lime shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-foreground">{t.policySection.checkInOutLabel}</strong>
                    {t.policySection.checkInOutDesc(
                      draft.campsite.checkInTime || '14:00',
                      draft.campsite.checkOutTime || '12:00',
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-lime shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-foreground">{t.policySection.rescheduleLabel}</strong>
                    {t.policySection.rescheduleDesc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-lime shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-foreground">{t.policySection.cancellationLabel}</strong>
                    {t.policySection.cancellationDesc}
                    <button
                      type="button"
                      onClick={() => setShowCancellationModal(true)}
                      className="text-brand-blue dark:text-brand-lime font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{t.policySection.cancellationLink}</span>
                      <ChevronRight size={13} />
                    </button>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-lime shrink-0 mt-1.5" />
                  <span>
                    <strong className="text-foreground">{t.policySection.paymentLabel}</strong>
                    {t.policySection.paymentDesc}
                  </span>
                </li>
              </ul>

              <div className="pt-2 border-t border-border/70">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue dark:text-brand-lime border-border focus:ring-brand-blue dark:focus:ring-brand-lime dark:bg-background"
                  />
                  <span>
                    {t.policySection.agreementPrefix}
                    <Link
                      href={`/${lang}/kebijakan-refund/`}
                      target="_blank"
                      className="text-brand-blue dark:text-brand-lime underline hover:text-brand-blue-hover dark:hover:text-brand-lime/90"
                    >
                      {t.policySection.refundPolicyLink}
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            {/* Tombol Konfirmasi Final */}
            <div className="pt-2 space-y-3">
              {existingPendingOrder && (
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-amber-900 dark:text-amber-200">
                        {t.pendingBanner.title(existingPendingOrder.id.slice(0, 8).toUpperCase())}
                      </p>
                      <p className="text-amber-800/90 dark:text-amber-300/80 text-[11px] leading-relaxed">
                        {t.pendingBanner.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                    <button
                      type="button"
                      onClick={handlePayExistingOrder}
                      disabled={submitting}
                      className="px-4 py-2 rounded-xl bg-brand-blue dark:bg-brand-lime text-white dark:text-black font-bold dark:font-black text-xs shadow-xs hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                      <span>{t.pendingBanner.continueBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAndRetry}
                      disabled={cancellingOldOrder}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-surface border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-semibold text-xs hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {cancellingOldOrder && <Loader2 size={14} className="animate-spin" />}
                      <span>{t.pendingBanner.cancelBtn}</span>
                    </button>
                    <Link
                      href={`/orders/detail?id=${existingPendingOrder.id}`}
                      className="px-3 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 font-semibold text-xs hover:underline"
                    >
                      {t.pendingBanner.viewDetail}
                    </Link>
                  </div>
                </div>
              )}

              {error && !existingPendingOrder && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={submitting || !agreed}
                className="w-full py-4 px-6 rounded-full bg-brand-blue dark:bg-brand-lime hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 text-white dark:text-black font-bold dark:font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                <span>
                  {submitting
                    ? t.buttons.processing
                    : t.buttons.confirmAndPay(rupiah(currentPayable))}
                </span>
              </button>
              <p className="text-[11px] text-center text-foreground-muted mt-2">
                {t.buttons.secureHint}
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              KOLOM KANAN: STICKY ORDER SUMMARY (AIRBNB STYLE)
              Di mobile: Tampil pertama di atas (order-1 lg:order-2) agar tamu melihat rincian unit & harga terlebih dahulu.
              Di desktop: Berada di kolom kanan yang sticky (lg:col-span-5).
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 order-1 lg:order-2">
            <div className="bg-white dark:bg-surface rounded-3xl border border-border p-6 shadow-2xs space-y-5">
              {/* Unit Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-border/70">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface dark:bg-background border border-border shrink-0">
                  {draft.campsite.photoUrl ? (
                    <img
                      src={resolveAssetUrl(draft.campsite.photoUrl)}
                      alt={draft.campsite.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                      <Tent size={24} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue dark:text-brand-lime bg-brand-blue/8 dark:bg-brand-lime/10 px-2 py-0.5 rounded-full">
                    {draft.campsite.name}
                  </span>
                  <h3 className="font-extrabold text-base text-foreground truncate">
                    {draft.spot.name}
                  </h3>
                  <p className="text-xs text-foreground-muted truncate">
                    {draft.selectedPackage.name} · {draft.campsite.city || draft.campsite.address}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    {formatDateDisplay(draft.checkInDate, lang)} – {formatDateDisplay(draft.checkOutDate, lang)} · {t.summary.unitMeta(draft.nights, draft.guestCount)}
                  </p>
                </div>
              </div>

              {/* Cancellation Policy Banner (Matches Image 3) */}
              <CancellationPolicyBannerButton
                checkInDate={draft.checkInDate}
                onClick={() => setShowCancellationModal(true)}
                lang={lang}
              />

              {/* Rincian Harga */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  {t.summary.priceDetailsTitle}
                </h4>

                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 pr-2">
                    <span className="text-foreground-muted block leading-snug">
                      {draft.selectedPackage.name}
                    </span>
                    <span className="text-[11px] text-foreground-muted/70 block mt-0.5">
                      {t.summary.spotPriceFormula(rupiah(draft.spotPricePerNight), draft.nights)}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground shrink-0 whitespace-nowrap text-right pt-0.5">
                    {rupiah(draft.spotPricePerNight * draft.nights)}
                  </span>
                </div>

                {draft.extraPersonInfo && draft.extraPersonInfo.amount > 0 && (
                  <div className="flex justify-between items-start gap-4 pt-1 border-t border-border/50">
                    <div className="min-w-0 pr-2">
                      <span className="text-foreground-muted block leading-snug">
                        {t.summary.extraGuestsTitle}
                      </span>
                      <span className="text-[11px] text-foreground-muted/70 block mt-0.5">
                        {t.summary.extraGuestsFormula(
                          draft.extraPersonInfo.count,
                          rupiah(draft.extraPersonInfo.unitPrice),
                          draft.nights,
                        )}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground shrink-0 whitespace-nowrap text-right pt-0.5">
                      +{rupiah(draft.extraPersonInfo.amount)}
                    </span>
                  </div>
                )}

                {draft.activeAddonsList.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-border/50">
                    <span className="text-[11px] font-semibold text-foreground-muted block">
                      {t.summary.additionalAddonsTitle}
                    </span>
                    {draft.activeAddonsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center gap-3 text-[11.5px] pl-2">
                        <span className="text-foreground-muted truncate">
                          {translateItemName(addon.name, lang)} × {addon.qty}
                        </span>
                        <span className="font-medium text-foreground shrink-0 whitespace-nowrap text-right">
                          {rupiah(addon.price * addon.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center gap-4 pt-1 border-t border-border/50">
                  <span className="text-foreground-muted">{t.summary.serviceAndTaxFee}</span>
                  <span className="font-semibold text-foreground shrink-0 whitespace-nowrap text-right">
                    +{rupiah(draft.totalServiceAndTaxFee)}
                  </span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
                  <span className="font-extrabold text-foreground">{t.summary.totalBill}</span>
                  <span className="text-lg font-black text-brand-blue dark:text-brand-lime">
                    {rupiah(draft.grandTotal)}
                  </span>
                </div>

                {/* Sisa jika DP */}
                {isDP && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-amber-900 dark:text-amber-200 font-bold">
                      <span>{t.summary.dpPaidNow}</span>
                      <span>{rupiah(currentPayable)}</span>
                    </div>
                    <div className="flex justify-between text-amber-800/80 dark:text-amber-300/80 text-[11px]">
                      <span>{t.summary.dpRemaining}</span>
                      <span>{rupiah(remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure guarantee */}
              <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-foreground-muted">
                <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t.summary.secureTransaction}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Explore */}
      <ExploreFooter lang={lang} onToggleLanguage={toggleLanguage} />

      {/* Guest Authentication Modal */}
      {isAuthOpen && (
        <GuestAuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          currentUser={currentUser}
          fromCheckout={true}
          lang={lang}
          onSuccess={(user) => {
            setCurrentUser(user);
            if (user) {
              setFullName((prev) => prev || user.fullName || '');
              setPhone((prev) => prev || user.phone || '');
              setEmail((prev) => prev || user.email || '');
              setAddress((prev) => prev || user.address || '');
            }
            setIsAuthOpen(false);
            setError(null);
          }}
          onLogout={() => {
            setCurrentUser(null);
            clearGuestSession();
          }}
        />
      )}

      {/* Modal Kebijakan Pembatalan (Airbnb / Embun App Style) */}
      <CancellationPolicyModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        checkInDate={draft?.checkInDate}
        lang={lang}
      />
    </div>
  );
}
