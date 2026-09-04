'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Loader2,
  Tent,
  ChevronRight,
  Calendar,
  LogIn,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  ListOrdered,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Mail,
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

function getOrderBadge(order: any) {
  if (order.status === 'PAID') {
    const isUnsettled =
      order.isDownPayment && (!order.settledAt || (order.remainingBalance ?? 0) > 0);
    if (isUnsettled) {
      return {
        label: 'DP 50%',
        sublabel: `Sisa ${rupiah(order.remainingBalance || 0)}`,
        className: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
        sublabelClass: 'text-neutral-600 bg-neutral-50 border-neutral-200/80',
      };
    }
    return {
      label: 'Lunas',
      className: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
    };
  }
  if (order.status === 'PENDING') {
    return {
      label: 'Menunggu Bayar',
      className: 'bg-neutral-100 text-neutral-800 border-neutral-200/80',
    };
  }
  if (order.status === 'COMPLETE') {
    return {
      label: 'Selesai',
      className: 'bg-neutral-100 text-neutral-700 border-neutral-200/80',
    };
  }
  if (order.status === 'CANCELLED') {
    return {
      label: 'Dibatalkan',
      className: 'bg-neutral-100 text-neutral-500 border-neutral-200/80',
    };
  }
  if (order.status === 'EXPIRED') {
    return {
      label: 'Kedaluwarsa',
      className: 'bg-neutral-100 text-neutral-500 border-neutral-200/80',
    };
  }
  if (order.status === 'REFUNDED') {
    return {
      label: 'Direfund',
      className: 'bg-neutral-100 text-neutral-600 border-neutral-200/80',
    };
  }
  return {
    label: order.status || 'Draft',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200/80',
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

function formatDateRange(checkIn?: string, checkOut?: string) {
  if (!checkIn) return null;
  try {
    const inDate = new Date(checkIn);
    const inStr = inDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (!checkOut) return inStr;
    const outDate = new Date(checkOut);
    const outStr = outDate.toLocaleDateString('id-ID', {
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
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);

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
      label: 'Semua Pesanan',
      shortLabel: 'Semua',
      count: orders.length,
      description: 'Semua riwayat pemesanan penginapan Anda',
      icon: ListOrdered,
    },
    {
      id: 'pengajuan' as TabType,
      label: 'Pengajuan',
      shortLabel: 'Pengajuan',
      count: pengajuanOrders.length,
      description: 'Pesanan menunggu pembayaran atau sisa pelunasan DP',
      icon: Clock,
    },
    {
      id: 'menuju_checkin' as TabType,
      label: 'Menuju Check-in',
      shortLabel: 'Check-in',
      count: upcomingOrders.length,
      description: 'Reservasi aktif yang siap untuk keberangkatan',
      icon: Tent,
    },
    {
      id: 'selesai' as TabType,
      label: 'Selesai',
      shortLabel: 'Selesai',
      count: doneOrders.length,
      description: 'Pesanan yang telah selesai, direfund, atau dibatalkan',
      icon: CheckCircle2,
    },
  ], [orders.length, pengajuanOrders.length, upcomingOrders.length, doneOrders.length]);

  const activeTabMeta = tabItems.find((t) => t.id === activeTab) || tabItems[0];

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground flex flex-col justify-between">
      {/* ═══ HEADER ATAS (LOGO RESMI EMBUN EXPLORE & MENU AKUN, TANPA LOKASI) ═══ */}
      <ExploreHeader
        showSearch={false}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-10 flex-1 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue" />
            <p className="text-xs font-semibold">Memuat riwayat pesanan...</p>
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
                Sesi masuk Anda telah berakhir atau belum aktif. Silakan masuk untuk melihat daftar pemesanan dan tiket penginapan Anda.
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
                href="/explore"
                className="text-xs font-semibold text-foreground-muted hover:text-foreground transition-colors"
              >
                Kembali ke Explore
              </Link>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-border text-foreground text-sm max-w-md mx-auto my-12 space-y-4 shadow-2xs">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={22} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">Gagal Memuat Riwayat</h3>
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
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-4 shadow-2xs max-w-md mx-auto my-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-surface flex items-center justify-center p-3.5 border border-border">
              <img
                src="/images/logo/logogram_blue.svg"
                alt="Embun"
                className="w-full h-full object-contain opacity-40 grayscale"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground">Belum Ada Pesanan</h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Temukan tempat camping & glamping terbaik untuk liburan akhir pekan Anda.
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center w-full py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all"
            >
              Cari Penginapan Sekarang
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Judul Halaman */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  Pesanan Saya
                </h1>
                <p className="text-xs sm:text-sm text-foreground-muted mt-0.5">
                  Pantau status pengajuan, jadwal check-in, dan riwayat reservasi Anda.
                </p>
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue-hover transition-colors shrink-0"
              >
                <span>Jelajahi Spot Lain</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Navigasi Tab Horizontal (Mobile & Tablet) */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:-mx-8 sm:px-8">
              {tabItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-brand-blue text-white border-brand-blue shadow-xs'
                        : 'bg-white text-foreground border-border hover:bg-surface'
                    }`}
                  >
                    <span>{item.shortLabel}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-surface text-foreground-muted border border-border/60'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Layout Grid Responsif (Sidebar di Desktop) */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
              {/* Sisi Kiri: Sidebar Menu Status Pesanan (Desktop Sticky / Floating) */}
              <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24 self-start z-20">
                <div className="space-y-5">
                  <div className="bg-white rounded-3xl border border-border p-3.5 shadow-2xs">
                    <div className="px-3 pt-2 pb-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                        Status Pesanan
                      </p>
                    </div>

                    <nav className="space-y-1.5">
                      {tabItems.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-brand-blue text-white shadow-xs'
                                : 'text-foreground hover:bg-surface text-foreground-muted hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                size={16}
                                className={isActive ? 'text-white' : 'text-brand-blue'}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-surface text-foreground-muted border border-border/60'
                              }`}
                            >
                              {item.count}
                            </span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Kartu Bantuan & Kontak Dukungan */}
                  <div className="bg-white rounded-3xl border border-border p-5 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
                        <HelpCircle size={17} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Butuh Bantuan?</h4>
                        <p className="text-[11px] text-foreground-muted">Layanan pelanggan Embun</p>
                      </div>
                    </div>
                    <p className="text-[11.5px] text-foreground-muted leading-relaxed">
                      Punya pertanyaan seputar check-in, pelunasan sisa tagihan, atau kebijakan pembatalan?
                    </p>
                    <div className="space-y-2 pt-1">
                      <a
                        href="https://wa.me/6281234567890?text=Halo%20Embun,%20saya%20butuh%20bantuan%20mengenai%20pesanan%20saya."
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
                </div>
              </aside>

              {/* Sisi Kanan: Daftar Pesanan Sesuai Tab Aktif */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-4">
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
                  <div className="bg-white rounded-3xl border border-border p-10 text-center space-y-3 shadow-2xs">
                    <div className="w-12 h-12 mx-auto rounded-full bg-surface flex items-center justify-center text-foreground-muted">
                      <Tent size={22} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">
                        Tidak ada pesanan di tab {activeTabMeta.label}
                      </h3>
                      <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                        {activeTab === 'pengajuan'
                          ? 'Semua pengajuan atau tagihan Anda telah terselesaikan.'
                          : activeTab === 'menuju_checkin'
                          ? 'Belum ada reservasi aktif yang siap untuk check-in.'
                          : activeTab === 'selesai'
                          ? 'Belum ada riwayat pesanan yang telah selesai.'
                          : 'Belum ada pesanan yang tersimpan.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {displayedOrders.map((order) => {
                      const badge = getOrderBadge(order);
                      const booking = order.bookings?.[0];
                      const spotName = booking?.block?.name || 'Unit Penginapan';
                      const shortCode = getShortCode(order.campsite?.name, order.id);
                      const dateRange = formatDateRange(booking?.checkIn, booking?.checkOut);

                      return (
                        <Link
                          key={order.id}
                          href={`/orders/detail?id=${order.id}`}
                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl border border-border bg-white hover:border-brand-blue/40 hover:shadow-md transition-all active:scale-[0.997]"
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
                                <span className="font-mono text-[11px] font-semibold text-neutral-600 tracking-wide bg-neutral-100/80 px-2.5 py-0.5 rounded-md border border-neutral-200/80">
                                  {shortCode}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium tracking-wide border shrink-0 ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                                {badge.sublabel && (
                                  <span className="text-[10.5px] font-medium text-neutral-600 bg-neutral-50 px-2.5 py-0.5 rounded-md border border-neutral-200/80">
                                    {badge.sublabel}
                                  </span>
                                )}
                              </div>

                              <h3 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-brand-blue transition-colors">
                                {order.campsite?.name || 'Campsite'}
                              </h3>
                              <p className="text-xs text-foreground-muted truncate">
                                {spotName} {booking?.packageName ? `· ${booking.packageName}` : ''}
                              </p>

                              {dateRange && (
                                <p className="text-[11px] text-foreground-muted flex items-center gap-1.5 pt-0.5">
                                  <Calendar size={13} className="text-brand-blue shrink-0" />
                                  <span>{dateRange}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Side: Total Bayar & Action */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] uppercase font-bold text-foreground-muted/80 block">
                                Total Bayar
                              </span>
                              <p className="text-sm sm:text-base font-black text-foreground">
                                {rupiah(order.totalAmount)}
                              </p>
                            </div>
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue mt-1 group-hover:translate-x-1 transition-transform">
                              <span>Detail</span>
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
      <ExploreFooter />

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
    </div>
  );
}
