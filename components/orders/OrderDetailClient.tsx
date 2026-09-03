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
  ShieldCheck,
  XCircle,
  Clock3,
  Mail,
} from 'lucide-react';
import {
  fetchGuestOrder,
  initiateOrderPayment,
  initiateSettlementPayment,
  syncOrderStatus,
  resendTicketEmail,
  initiateXenditPayment,
  getGuestToken,
  clearGuestSession,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';

function getOrderBadge(order: any) {
  if (order.status === 'PAID') {
    const isUnsettled =
      order.isDownPayment && (!order.settledAt || (order.remainingBalance ?? 0) > 0);
    if (isUnsettled) {
      return {
        label: 'DP 50% (Belum Lunas)',
        className: 'bg-amber-50 text-amber-800 border-amber-300',
        isDP: true,
      };
    }
    return {
      label: 'Lunas',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isDP: false,
    };
  }
  if (order.status === 'PENDING') {
    return {
      label: 'Menunggu Pembayaran',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      isDP: false,
    };
  }
  if (order.status === 'COMPLETE') {
    return {
      label: 'Selesai',
      className: 'bg-neutral-100 text-neutral-700 border-neutral-300',
      isDP: false,
    };
  }
  if (order.status === 'CANCELLED') {
    return {
      label: 'Dibatalkan',
      className: 'bg-red-50 text-red-700 border-red-200',
      isDP: false,
    };
  }
  if (order.status === 'EXPIRED') {
    return {
      label: 'Kedaluwarsa',
      className: 'bg-neutral-100 text-neutral-600 border-neutral-300',
      isDP: false,
    };
  }
  if (order.status === 'REFUNDED') {
    return {
      label: 'Direfund',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      isDP: false,
    };
  }
  return {
    label: order.status || 'Draft',
    className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    isDP: false,
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

export function OrderDetailClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Action states
  const [paying, setPaying] = useState(false);
  const [settling, setSettling] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [resendingTicket, setResendingTicket] = useState(false);
  const [ticketSentNotice, setTicketSentNotice] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!orderId) return;
    if (!getGuestToken()) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let data = await fetchGuestOrder(orderId);
      // Bila pesanan masih PENDING (misalnya baru kembali dari redirect Xendit), lakukan auto-sync sekali
      if (data?.status === 'PENDING') {
        const syncRes = await syncOrderStatus(orderId).catch(() => null);
        if (syncRes && (syncRes.status === 'PAID' || syncRes.status === 'COMPLETE')) {
          data = await fetchGuestOrder(orderId).catch(() => data);
        }
      }
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

  const handleResendTicket = async () => {
    if (!orderId) return;
    setResendingTicket(true);
    setTicketSentNotice(null);
    try {
      const res = await resendTicketEmail(orderId);
      if (res?.emailSent) {
        setTicketSentNotice('E-Tiket resmi telah berhasil dikirimkan ke email Anda!');
      } else {
        setTicketSentNotice('Permintaan pengiriman e-tiket telah diproses ke sistem.');
      }
      setTimeout(() => setTicketSentNotice(null), 6000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang e-tiket.');
    } finally {
      setResendingTicket(false);
    }
  };

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
      const res = await initiateSettlementPayment(orderId);
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

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {/* Header Sticky */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} className="stroke-[2.2]" />
            </Link>
            <div>
              <h1 className="font-bold text-base text-foreground tracking-tight">Detail Pesanan</h1>
              <p className="text-[11px] text-foreground-muted font-mono">{shortCode}</p>
            </div>
          </div>
          {badge && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border shrink-0 ${badge.className}`}
            >
              {badge.label}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-foreground-muted">
            <Loader2 size={26} className="animate-spin text-brand-blue" />
            <p className="text-xs font-semibold">Memuat rincian pesanan...</p>
          </div>
        ) : authRequired ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border p-8 space-y-4 shadow-2xs max-w-md mx-auto">
            <h3 className="font-bold text-base text-foreground">Masuk Terlebih Dahulu</h3>
            <p className="text-xs text-foreground-muted">
              Silakan masuk ke akun Anda untuk melihat rincian pemesanan ini.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center w-full py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all"
            >
              Ke Halaman Explore
            </Link>
          </div>
        ) : error && !order ? (
          <div className="p-6 text-center bg-red-50 rounded-3xl border border-red-200 text-red-700 text-sm max-w-md mx-auto">
            {error}
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Error Banner jika ada aksi yang gagal */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                1. KARTU STATUS HERO
                - HANYA TAMPILKAN TIKET RESMI & QR CODE SCAN JIKA ORDER SUDAH LUNAS / TERBAYAR (PAID/COMPLETE)
            ════════════════════════════════════════════════════════════════ */}
            {isPaid ? (
              /* KARTU TIKET RESMI TERKONFIRMASI (HANYA UNTUK YANG SUDAH BAYAR) */
              <div className="bg-white rounded-3xl border border-border p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0">
                      <ShieldCheck size={14} />
                      <span className="text-[10.5px] uppercase font-bold tracking-wider">
                        Tiket Resmi Terkonfirmasi
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

                    {/* Tombol Kirim E-Tiket ke Email */}
                    <div className="pt-3 flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleResendTicket}
                        disabled={resendingTicket}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        title="Kirim E-Tiket HTML resmi ke alamat email akun Anda"
                      >
                        {resendingTicket ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Mail size={14} />
                        )}
                        <span>Kirim E-Tiket ke Email</span>
                      </button>
                      {ticketSentNotice && (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl animate-in fade-in">
                          {ticketSentNotice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QR Code Container Check-in (Perbesar agar mudah discan) */}
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border shadow-xs shrink-0 self-center sm:self-auto">
                    <div className="w-44 h-44 sm:w-48 sm:h-48 bg-surface flex items-center justify-center rounded-2xl p-2.5 border border-border/60">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
                          order.id,
                        )}`}
                        alt="QR Code Check-in"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-foreground-muted flex items-center gap-1.5">
                      <QrCode size={13} className="text-brand-blue" />
                      Scan untuk Check-in
                    </span>
                  </div>
                </div>
              </div>
            ) : isExpired ? (
              /* KARTU STATUS KEDALUWARSA (TIDAK ADA TIKET & TIDAK ADA QR CHECK-IN) */
              <div className="bg-neutral-50 rounded-3xl border border-neutral-300/80 p-6 shadow-2xs space-y-4">
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
              <div className="bg-red-50/70 rounded-3xl border border-red-200 p-6 shadow-2xs space-y-4">
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
              </div>
            ) : isPending ? (
              /* KARTU STATUS MENUNGGU PEMBAYARAN */
              <div className="bg-amber-50/70 rounded-3xl border border-amber-200/90 p-6 shadow-2xs space-y-4">
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
                2. CARD KHUSUS SKEMA DP (HANYA JIKA PESANAN AKTIF / SUDAH DIBAYAR)
            ════════════════════════════════════════════════════════════════ */}
            {isPaid && isDP && (
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Skema Pembayaran: Uang Muka (DP 50%)
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
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
                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-amber-100/60 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                      💡 <strong>Pemberitahuan Pelunasan:</strong> Sisa tagihan wajib dilunasi paling
                      lambat <strong>H-1 sebelum jadwal check-in</strong> melalui aplikasi/web Embun.
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
                3. PROPERTI & JADWAL MENGINAP (AIRBNB CLEAN CARD)
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl border border-border p-6 space-y-5 shadow-2xs">
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
              <div className="flex items-center gap-2.5 flex-wrap">
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
                {order.campsite?.emergencyWhatsapp && (
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
            <div className="bg-white rounded-3xl border border-border p-6 space-y-3 shadow-2xs">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                Data Tamu Pemesan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-surface border border-border/50">
                  <span className="text-foreground-muted block text-[10.5px]">Nama Lengkap</span>
                  <strong className="text-foreground text-sm">
                    {order.guestName || 'Tamu Embun'}
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-border/50">
                  <span className="text-foreground-muted block text-[10.5px]">Nomor WhatsApp</span>
                  <strong className="text-foreground text-sm">
                    {order.guestPhone || '-'}
                  </strong>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                5. RINCIAN BIAYA & INVOICE
            ════════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-3xl border border-border p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt size={14} className="text-brand-blue" />
                  Rincian Pembayaran
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Sewa {booking?.block?.name || 'Unit'} ({nights} malam)</span>
                  <span className="font-semibold text-foreground">
                    {rupiah(booking?.totalAmount || order.totalAmount)}
                  </span>
                </div>

                {order.guestServiceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Biaya Layanan Platform</span>
                    <span className="font-semibold text-foreground">
                      {rupiah(order.guestServiceFee)}
                    </span>
                  </div>
                )}

                {order.guestAdminFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Biaya Admin Payment Gateway</span>
                    <span className="font-semibold text-foreground">
                      {rupiah(order.guestAdminFee)}
                    </span>
                  </div>
                )}

                {order.guestTaxFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Pajak (PPN)</span>
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
                  <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
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
            </div>

            {/* ════════════════════════════════════════════════════════════════
                6. TOMBOL AKSI: BAYAR / SINKRONKAN
            ════════════════════════════════════════════════════════════════ */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="w-full py-3.5 px-6 rounded-full border border-border bg-white hover:bg-surface text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-2xs"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin text-brand-blue' : ''} />
                <span>{syncing ? 'Menyinkronkan...' : 'Sinkronkan Status Pembayaran'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
