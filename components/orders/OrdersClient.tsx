'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Tent,
  ChevronRight,
  Calendar,
  LogIn,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  getGuestToken,
  clearGuestSession,
  fetchGuestOrders,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';
import { GuestAuthModal } from '@/components/explore/GuestAuthModal';

function getOrderBadge(order: any) {
  if (order.status === 'PAID') {
    const isUnsettled =
      order.isDownPayment && (!order.settledAt || (order.remainingBalance ?? 0) > 0);
    if (isUnsettled) {
      return {
        label: 'DP 50%',
        sublabel: `Sisa ${rupiah(order.remainingBalance || 0)}`,
        className: 'bg-amber-50 text-amber-800 border-amber-300',
      };
    }
    return {
      label: 'Lunas',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (order.status === 'PENDING') {
    return {
      label: 'Menunggu Bayar',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  if (order.status === 'COMPLETE') {
    return {
      label: 'Selesai',
      className: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    };
  }
  if (order.status === 'CANCELLED') {
    return {
      label: 'Dibatalkan',
      className: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (order.status === 'EXPIRED') {
    return {
      label: 'Kedaluwarsa',
      className: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    };
  }
  if (order.status === 'REFUNDED') {
    return {
      label: 'Direfund',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  return {
    label: order.status || 'Draft',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
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

export function OrdersClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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

  const handleLoginSuccess = () => {
    setIsAuthOpen(false);
    setAuthRequired(false);
    void load();
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {/* Header Sticky */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} className="stroke-[2.2]" />
            </Link>
            <h1 className="font-bold text-base text-foreground tracking-tight">Pesanan Saya</h1>
          </div>
          <Link
            href="/explore"
            className="text-xs font-semibold text-brand-blue hover:text-brand-blue-hover transition-colors"
          >
            Jelajahi Spot
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue" />
            <p className="text-xs font-semibold">Memuat riwayat pesanan...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-5 shadow-2xs max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
              <Tent size={26} />
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
          <div className="p-8 text-center bg-white rounded-3xl border border-border text-foreground text-sm max-w-md mx-auto space-y-4 shadow-2xs">
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
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-4 shadow-2xs max-w-md mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-surface flex items-center justify-center text-foreground-muted">
              <Tent size={26} />
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
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                Semua Reservasi ({orders.length})
              </p>
            </div>

            <div className="grid gap-3.5">
              {orders.map((order) => {
                const badge = getOrderBadge(order);
                const booking = order.bookings?.[0];
                const spotName = booking?.block?.name || 'Unit Penginapan';
                const shortCode = getShortCode(order.campsite?.name, order.id);
                const dateRange = formatDateRange(booking?.checkIn, booking?.checkOut);

                return (
                  <Link
                    key={order.id}
                    href={`/orders/detail?id=${order.id}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-border bg-white hover:border-brand-blue/30 hover:shadow-md transition-all active:scale-[0.995]"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-surface border border-border/80 shrink-0 group-hover:shadow-xs transition-shadow">
                        {order.campsite?.coverPhotoUrl ? (
                          <img
                            src={resolveAssetUrl(order.campsite.coverPhotoUrl)}
                            alt={order.campsite?.name || 'Campsite'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                            <Tent size={24} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-brand-blue tracking-wide bg-brand-blue/8 px-2 py-0.5 rounded-md">
                            {shortCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold tracking-wide border shrink-0 ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          {badge.sublabel && (
                            <span className="text-[11px] font-semibold text-amber-700">
                              · {badge.sublabel}
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
                          <p className="text-[11px] text-foreground-muted/90 flex items-center gap-1.5 pt-0.5">
                            <Calendar size={12} className="text-brand-blue/70" />
                            <span>{dateRange}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-foreground-muted/70 block">
                          Total Bayar
                        </span>
                        <p className="text-sm sm:text-base font-black text-foreground">
                          {rupiah(order.totalAmount)}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-brand-blue mt-1 group-hover:translate-x-1 transition-transform">
                        <span>Detail</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Guest Auth Modal langsung di Pesanan Saya */}
      <GuestAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
