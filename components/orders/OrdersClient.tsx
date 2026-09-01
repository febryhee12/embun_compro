'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Tent, ChevronRight } from 'lucide-react';
import {
  getGuestToken,
  clearGuestSession,
  fetchGuestOrders,
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

export function OrdersClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getGuestToken()) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await fetchGuestOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          clearGuestSession();
          setAuthRequired(true);
        } else {
          setError(err.message || 'Gagal memuat pesanan.');
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="stroke-[2.2]" />
          </Link>
          <h1 className="font-bold text-sm text-foreground">Pesanan Saya</h1>
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
              Anda harus masuk terlebih dahulu untuk melihat pesanan.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
            >
              Ke Halaman Explore
            </Link>
          </div>
        ) : error ? (
          <div className="p-6 text-center bg-red-50 rounded-3xl border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-surface/50 rounded-3xl border border-border p-6 space-y-4">
            <Tent size={28} className="mx-auto text-foreground-muted" />
            <p className="text-sm text-foreground-muted">Belum ada pesanan.</p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue/90 transition-all"
            >
              Jelajahi Spot
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const badge = statusBadge(order.status);
              const spotName = order.bookings?.[0]?.block?.name || 'Unit';
              return (
                <Link
                  key={order.id}
                  href={`/orders/detail?id=${order.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-brand-blue/40 hover:shadow-md transition-all bg-white"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface border border-border shrink-0">
                    {order.campsite?.coverPhotoUrl ? (
                      <img
                        src={resolveAssetUrl(order.campsite.coverPhotoUrl)}
                        alt={order.campsite?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                        <Tent size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {order.campsite?.name || 'Campsite'}
                    </p>
                    <p className="text-xs text-foreground-muted truncate">
                      {spotName}
                    </p>
                    <span
                      className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">
                      {rupiah(order.totalAmount)}
                    </p>
                    <ChevronRight
                      size={16}
                      className="text-foreground-muted ml-auto mt-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
