'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Tent,
  Calendar,
  Users,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import {
  getGuestToken,
  clearGuestSession,
  fetchGuestOrder,
  initiateOrderPayment,
  syncOrderStatus,
  initiateXenditPayment,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Menunggu Pembayaran',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  PAID: {
    label: 'Terbayar',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  COMPLETE: {
    label: 'Selesai',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  EXPIRED: {
    label: 'Kedaluwarsa',
    className: 'bg-surface text-foreground-muted border-border',
  },
  REFUNDED: {
    label: 'Direfund',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

function statusBadge(status: string) {
  return (
    STATUS_LABEL[status] || {
      label: status,
      className: 'bg-surface text-foreground-muted border-border',
    }
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function OrderDetailClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) {
      setError('ID pesanan tidak ditemukan.');
      setLoading(false);
      return;
    }
    if (!getGuestToken()) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchGuestOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setAuthRequired(true);
      } else {
        setError(err.message || 'Gagal memuat detail pesanan.');
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePayNow = async () => {
    if (!orderId) return;
    setError(null);
    setPaying(true);
    try {
      const paymentInit = await initiateOrderPayment(orderId);
      if (!paymentInit?.snapRedirectUrl) {
        throw new Error('Gagal mendapatkan URL pembayaran Xendit.');
      }
      // Buka Xendit invoice di tab baru
      initiateXenditPayment(paymentInit.snapRedirectUrl);
      // Best-effort sync; webhook Xendit yang bersifat autoritatif
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

  const handleSync = async () => {
    if (!orderId) return;
    setSyncing(true);
    setError(null);
    try {
      await syncOrderStatus(orderId);
      await load();
    } catch (err: any) {
      setError(err.message || 'Gagal menyinkronkan status.');
    } finally {
      setSyncing(false);
    }
  };

  const badge = order ? statusBadge(order.status) : null;
  const booking = order?.bookings?.[0];

  return (
    <div className="min-h-screen bg-white text-foreground">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="stroke-[2.2]" />
          </Link>
          <h1 className="font-bold text-sm text-foreground">Detail Pesanan</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-foreground-muted">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-xs font-semibold">Memuat pesanan...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border p-6 space-y-4">
            <p className="text-sm text-foreground-muted">
              Anda harus masuk terlebih dahulu untuk melihat pesanan ini.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
            >
              Ke Halaman Explore
            </Link>
          </div>
        ) : error && !order ? (
          <div className="p-6 text-center bg-red-50 rounded-3xl border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : order ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface border border-border shrink-0">
                {order.campsite?.coverPhotoUrl ? (
                  <img
                    src={resolveAssetUrl(order.campsite.coverPhotoUrl)}
                    alt={order.campsite?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                    <Tent size={22} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-foreground truncate">
                  {order.campsite?.name || 'Campsite'}
                </p>
                <p className="text-xs text-foreground-muted truncate">
                  {booking?.block?.name || 'Unit'}
                </p>
              </div>
              {badge && (
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0 ${badge.className}`}
                >
                  {badge.label}
                </span>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="p-5 rounded-3xl border border-border space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Calendar size={15} /> Check-in
                </span>
                <span className="font-semibold text-foreground">
                  {formatDate(booking?.checkIn)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-foreground-muted">
                  <Calendar size={15} /> Check-out
                </span>
                <span className="font-semibold text-foreground">
                  {formatDate(booking?.checkOut)}
                </span>
              </div>
              {order.adultCount != null && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground-muted">
                    <Users size={15} /> Jumlah Tamu
                  </span>
                  <span className="font-semibold text-foreground">
                    {order.adultCount} Orang
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-black text-brand-blue">
                  {rupiah(order.totalAmount)}
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted font-mono break-all">
                No. Pesanan: {order.id}
              </p>
            </div>

            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={handlePayNow}
                disabled={paying}
                className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {paying ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CreditCard size={16} />
                )}
                <span>
                  {paying ? 'Membuka Pembayaran...' : 'Bayar Sekarang'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="w-full py-3 px-6 rounded-full border border-border bg-white hover:bg-surface text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
              <span>Sinkronkan Status Pembayaran</span>
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
