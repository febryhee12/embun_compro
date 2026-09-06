'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Tent,
  ChevronRight,
  Calendar,
  LogIn,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import {
  getGuestToken,
  clearGuestSession,
  getStoredGuestProfile,
  fetchGuestOrders,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';
import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreFooter } from '@/components/explore/ExploreFooter';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';
import { CompleteProfileModal } from '@/components/explore/CompleteProfileModal';
import {
  AccountSidebar,
  AccountMobileNav,
  AccountLogoutDialog,
} from '@/components/account/AccountNav';
import { ACCOUNT_I18N, type Language } from '@/lib/account-i18n';

function getOrderBadge(order: any, lang: Language = 'id') {
  const t = ACCOUNT_I18N[lang].orders.badges;
  if (order.status === 'PAID') {
    const isUnsettled =
      order.isDownPayment && (!order.settledAt || (order.remainingBalance ?? 0) > 0);
    if (isUnsettled) {
      return {
        label: t.dp50,
        sublabel: t.remainingBalance(rupiah(order.remainingBalance || 0)),
        className: 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-white/10',
        sublabelClass: 'text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-white/5 border-neutral-200/80 dark:border-white/10',
      };
    }
    return {
      label: t.paid,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-white/10',
    };
  }
  if (order.status === 'PENDING') {
    return {
      label: t.pending,
      className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/20',
    };
  }
  if (order.status === 'COMPLETE' || order.status === 'COMPLETED') {
    return {
      label: t.complete,
      className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/20',
    };
  }
  if (order.status === 'CANCELLED') {
    return {
      label: t.cancelled,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10',
    };
  }
  if (order.status === 'EXPIRED') {
    return {
      label: t.expired,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 border-neutral-200/80 dark:border-white/10',
    };
  }
  if (order.status === 'REFUNDED') {
    return {
      label: t.refunded,
      className: 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10',
    };
  }
  return {
    label: order.status || 'Draft',
    className: 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-white/10',
  };
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

function formatDateRange(checkIn?: string, checkOut?: string, lang: Language = 'id') {
  if (!checkIn) return null;
  try {
    const locale = lang === 'en' ? 'en-US' : 'id-ID';
    const inDate = new Date(checkIn);
    const inStr = inDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    if (!checkOut) return inStr;
    const outDate = new Date(checkOut);
    const outStr = outDate.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${inStr} – ${outStr}`;
  } catch {
    return null;
  }
}

type TabType = 'all' | 'pengajuan' | 'menuju_checkin' | 'selesai';

export function OrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const t = ACCOUNT_I18N[lang].orders;

  const handleLogout = () => {
    clearGuestSession();
    window.location.href = '/explore';
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/explore');
    }
  };

  useEffect(() => {
    setCurrentUser(getStoredGuestProfile());
  }, []);

  const load = useCallback(async () => {
    const token = getGuestToken();
    if (!token) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGuestOrders();
      setOrders(Array.isArray(data) ? data : []);
      setAuthRequired(false);
    } catch (err: any) {
      const status = err?.status || (err instanceof ApiError ? err.status : 0);
      const msg = String(err?.message || '');
      if (
        status === 401 ||
        msg.includes('401') ||
        msg.toLowerCase().includes('unauthorized') ||
        msg.toLowerCase().includes('jwt')
      ) {
        clearGuestSession();
        setAuthRequired(true);
      } else {
        setError(err?.message || 'Gagal memuat riwayat pesanan.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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

  // Filter kelompok pesanan sesuai status booking-lifecycle
  const pengajuanOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'CANCELLED' || o.status === 'EXPIRED' || o.status === 'REFUNDED') {
        return false;
      }
      if (o.status === 'PENDING') return true;
      const isUnsettledDP =
        o.isDownPayment && (!o.settledAt || (o.remainingBalance ?? 0) > 0);
      return isUnsettledDP;
    });
  }, [orders]);

  const upcomingOrders = useMemo(() => {
    return orders.filter((o) => {
      const isUnsettledDP =
        o.isDownPayment && (!o.settledAt || (o.remainingBalance ?? 0) > 0);
      return o.status === 'PAID' && !isUnsettledDP;
    });
  }, [orders]);

  const doneOrders = useMemo(() => {
    return orders.filter((o) => {
      return (
        o.status === 'COMPLETE' ||
        o.status === 'COMPLETED' ||
        o.status === 'REFUNDED' ||
        o.status === 'CANCELLED' ||
        o.status === 'EXPIRED'
      );
    });
  }, [orders]);

  const displayedOrders = useMemo(() => {
    switch (activeTab) {
      case 'pengajuan':
        return pengajuanOrders;
      case 'menuju_checkin':
        return upcomingOrders;
      case 'selesai':
        return doneOrders;
      case 'all':
      default:
        return orders;
    }
  }, [activeTab, orders, pengajuanOrders, upcomingOrders, doneOrders]);

  const tabItems = useMemo(() => [
    {
      id: 'all' as TabType,
      label: t.tabs.all,
      shortLabel: t.tabs.allShort,
      count: orders.length,
      description: t.tabs.allDesc,
    },
    {
      id: 'pengajuan' as TabType,
      label: t.tabs.pengajuan,
      shortLabel: t.tabs.pengajuanShort,
      count: pengajuanOrders.length,
      description: t.tabs.pengajuanDesc,
    },
    {
      id: 'menuju_checkin' as TabType,
      label: t.tabs.menujuCheckin,
      shortLabel: t.tabs.menujuCheckinShort,
      count: upcomingOrders.length,
      description: t.tabs.menujuCheckinDesc,
    },
    {
      id: 'selesai' as TabType,
      label: t.tabs.selesai,
      shortLabel: t.tabs.selesaiShort,
      count: doneOrders.length,
      description: t.tabs.selesaiDesc,
    },
  ], [orders.length, pengajuanOrders.length, upcomingOrders.length, doneOrders.length, t]);

  const activeTabMeta = tabItems.find((t) => t.id === activeTab) || tabItems[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA LOKASI) ═══ */}
      <ExploreHeader
        showSearch={false}
        showUserMenu={true}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        lang={lang}
        onToggleLanguage={handleToggleLanguage}
      />

      <main className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue dark:text-brand-lime" />
            <p className="text-xs font-semibold">{t.loading}</p>
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
                href="/explore"
                className="text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                {t.backToExplore}
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white dark:bg-surface rounded-3xl border border-border text-foreground text-sm max-w-md mx-auto my-12 space-y-4 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">{t.errorTitle}</h3>
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
        ) : (
          <div className="space-y-6">
            {/* Header Judul Halaman */}
            <div className="border-b border-border/70 pb-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer shrink-0"
                  aria-label="Kembali"
                >
                  <ArrowLeft size={22} className="stroke-[2.2]" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {t.title}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-foreground-muted mt-1 ml-9 sm:ml-10">
                {t.subtitle}
              </p>
            </div>

            {/* Navigasi Tab Horizontal (Mobile & Tablet) */}
            <AccountMobileNav
              activeTab="orders"
              onLogout={() => setShowLogoutConfirm(true)}
              lang={lang}
            />

            {/* Layout Grid Responsif (Sidebar di Desktop) */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
              {/* Sisi Kiri: Sidebar Menu Akun & Bantuan */}
              <AccountSidebar
                activeTab="orders"
                onLogout={() => setShowLogoutConfirm(true)}
                lang={lang}
              />

              {/* Sisi Kanan: Daftar Pesanan Sesuai Tab Aktif */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                {/* Menu Status Pesanan: Tab saja dan tidak perlu pakai icon */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                  {tabItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? 'bg-brand-blue dark:bg-brand-lime text-white dark:text-black border-brand-blue dark:border-brand-lime shadow-xs font-bold dark:font-black'
                            : 'bg-white dark:bg-surface text-foreground-muted border-border hover:bg-surface hover:text-foreground'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isActive
                              ? 'bg-white/20 text-white dark:bg-black/15 dark:text-black'
                              : 'bg-surface text-foreground-muted border border-border/60'
                          }`}
                        >
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Header Keterangan Tab Aktif */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">
                      {activeTabMeta.label} ({displayedOrders.length})
                    </h2>
                    <p className="text-xs text-foreground-muted">
                      {activeTabMeta.description}
                    </p>
                  </div>
                </div>

                {displayedOrders.length === 0 ? (
                  <div className="bg-white dark:bg-surface rounded-3xl border border-border p-10 text-center space-y-3 shadow-2xs">
                    <div className="w-12 h-12 mx-auto rounded-full bg-surface flex items-center justify-center text-foreground-muted">
                      <Tent size={22} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">
                        {lang === 'en' ? `No orders in ${activeTabMeta.label}` : `Tidak ada pesanan di tab ${activeTabMeta.label}`}
                      </h3>
                      <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                        {activeTab === 'pengajuan'
                          ? t.emptyTabs.pengajuan
                          : activeTab === 'menuju_checkin'
                          ? t.emptyTabs.menujuCheckin
                          : activeTab === 'selesai'
                          ? t.emptyTabs.selesai
                          : t.emptyTabs.all}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {displayedOrders.map((order) => {
                      const badge = getOrderBadge(order, lang);
                      const booking = order.bookings?.[0];
                      const spotName = booking?.block?.name || 'Unit Penginapan';
                      const shortCode = getShortCode(order.campsite?.name, order.id);
                      const dateRange = formatDateRange(booking?.checkIn, booking?.checkOut, lang);

                      return (
                        <Link
                          key={order.id}
                          href={`/orders/detail?id=${order.id}`}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-border bg-white dark:bg-surface hover:border-brand-blue/40 dark:hover:border-brand-lime/40 hover:shadow-md transition-all active:scale-[0.997]"
                        >
                          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
                            {/* Campsite Cover Image */}
                            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-surface border border-border/80 shrink-0 group-hover:shadow-xs transition-shadow">
                              {order.campsite?.coverPhotoUrl ? (
                                <img
                                  src={resolveAssetUrl(order.campsite.coverPhotoUrl)}
                                  alt={order.campsite?.name || 'Campsite'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                                  <Tent size={26} />
                                </div>
                              )}
                            </div>

                            {/* Order Info */}
                            <div className="min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 tracking-wide bg-neutral-100/80 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-neutral-200/80 dark:border-white/10">
                                  {shortCode}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium tracking-wide border shrink-0 ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                                {badge.sublabel && (
                                  <span className="text-[10.5px] font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-neutral-200/80 dark:border-white/10">
                                    {badge.sublabel}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-brand-blue dark:group-hover:text-brand-lime transition-colors">
                                {order.campsite?.name || 'Campsite'}
                              </h3>
                              <p className="text-xs text-foreground-muted truncate">
                                {spotName} {booking?.packageName ? `· ${booking.packageName}` : ''}
                              </p>

                              {dateRange && (
                                <p className="text-[11px] text-foreground-muted flex items-center gap-1.5 pt-0.5">
                                  <Calendar size={13} className="text-brand-blue dark:text-brand-lime shrink-0" />
                                  <span>{dateRange}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Side: Total Bayar & Action */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-foreground-muted/80 block">
                                {t.totalPayment}
                              </span>
                              <p className="text-sm sm:text-base font-black text-foreground">
                                {rupiah(order.totalAmount)}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue dark:text-brand-lime mt-1 group-hover:translate-x-1 transition-transform">
                              <span>{t.detail}</span>
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ FOOTER RESMI RESMI EXPLORE ═══ */}
      <ExploreFooter lang={lang} />

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

      {/* Logout Confirmation Dialog */}
      <AccountLogoutDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        lang={lang}
      />
    </div>
  );
}
