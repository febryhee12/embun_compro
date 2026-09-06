'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  CreditCard,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  fetchRescheduleQuote,
  submitRescheduleOrder,
  initiatePayment,
  rupiah,
  type RescheduleQuote,
} from '@/lib/api-client';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => Promise<void> | void;
}

function formatDateIndo(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(date);
  }
}

function toIsoDateOnly(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function RescheduleModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: RescheduleModalProps) {
  const booking = order?.bookings?.[0];
  const campsiteName = order?.campsite?.name || 'Campsite';
  const spotName = booking?.block?.name || booking?.spotName || 'Spot';

  // Hitung malam menginap
  const oldCheckIn = booking?.checkIn ? new Date(booking.checkIn) : null;
  const oldCheckOut = booking?.checkOut ? new Date(booking.checkOut) : null;
  const nights =
    oldCheckIn && oldCheckOut
      ? Math.max(
          1,
          Math.round(
            (oldCheckOut.getTime() - oldCheckIn.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 1;

  // Tanggal minimal yang diizinkan untuk reschedule (H-7)
  const minAllowedDate = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d;
  }, []);

  const [checkInStr, setCheckInStr] = useState<string>('');
  const [quote, setQuote] = useState<RescheduleQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Inisialisasi tanggal baru default: H-7 dari hari ini
  useEffect(() => {
    if (isOpen) {
      const defaultIn = toIsoDateOnly(minAllowedDate);
      setCheckInStr(defaultIn);
    }
  }, [isOpen, minAllowedDate]);

  // Hitung check-out baru otomatis sesuai durasi malam
  const checkOutStr = React.useMemo(() => {
    if (!checkInStr) return '';
    try {
      const [y, m, d] = checkInStr.split('-').map(Number);
      const out = new Date(y, m - 1, d + nights);
      return toIsoDateOnly(out);
    } catch {
      return '';
    }
  }, [checkInStr, nights]);

  // Re-fetch quote ketersediaan & selisih harga setiap kali tanggal check-in berubah
  useEffect(() => {
    if (!isOpen || !order?.id || !checkInStr || !checkOutStr) return;

    let isMounted = true;
    setQuoteLoading(true);
    setQuoteError(null);

    fetchRescheduleQuote(order.id, checkInStr, checkOutStr)
      .then((data) => {
        if (isMounted) {
          setQuote(data);
          setQuoteLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setQuote(null);
          setQuoteError(err.message || 'Gagal memeriksa ketersediaan tanggal baru.');
          setQuoteLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, order?.id, checkInStr, checkOutStr]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInStr || !checkOutStr || !quote?.available) return;

    setSubmitting(true);
    setQuoteError(null);

    try {
      const res = await submitRescheduleOrder(order.id, checkInStr, checkOutStr);

      // Skenario A: Perlu bayar selisih tarif via Payment Gateway
      if (res.requiresPayment && res.invoiceUrl) {
        initiatePayment(res.invoiceUrl);
        return;
      }

      // Skenario B: Tanpa biaya tambahan (langsung terapkan)
      await onSuccess();
      onClose();
    } catch (err: any) {
      setQuoteError(err.message || 'Gagal mengubah jadwal pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDateInputStr = toIsoDateOnly(minAllowedDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-surface text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-border/70 flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 dark:bg-brand-lime/15 text-brand-blue dark:text-brand-lime flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                Ubah Jadwal Menginap
              </h3>
              <p className="text-xs text-foreground-muted truncate max-w-[240px] sm:max-w-xs">
                {spotName} · {campsiteName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Jadwal Saat Ini */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-background border border-border/70 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block">
              Jadwal Saat Ini
            </span>
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground">
              <span>{oldCheckIn ? formatDateIndo(oldCheckIn) : '-'}</span>
              <ArrowRight size={14} className="text-foreground-muted" />
              <span>{oldCheckOut ? formatDateIndo(oldCheckOut) : '-'}</span>
            </div>
            <span className="text-[11px] text-foreground-muted block">
              Durasi: {nights} malam menginap
            </span>
          </div>

          {/* Pilih Tanggal Check-in Baru */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-foreground">
              Pilih Tanggal Check-in Baru
            </label>
            <div className="relative">
              <input
                type="date"
                min={minDateInputStr}
                value={checkInStr}
                onChange={(e) => setCheckInStr(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl border border-border bg-white dark:bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <p className="text-[11px] text-foreground-muted leading-relaxed">
              Sesuai kebijakan Embun, ubah jadwal hanya dapat dilakukan minimal 7 hari sebelum tanggal kedatangan (H-7).
            </p>
          </div>

          {/* Preview Jadwal Baru */}
          {checkInStr && checkOutStr && (
            <div className="p-4 rounded-2xl bg-brand-blue/5 dark:bg-brand-lime/10 border border-brand-blue/20 dark:border-brand-lime/20 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-brand-blue dark:text-brand-lime block">
                Jadwal Baru yang Diajukan
              </span>
              <div className="flex items-center justify-between font-bold text-foreground text-xs sm:text-sm">
                <span>{formatDateIndo(new Date(checkInStr))}</span>
                <ArrowRight size={14} className="text-brand-blue dark:text-brand-lime" />
                <span>{formatDateIndo(new Date(checkOutStr))}</span>
              </div>
              <span className="text-[11px] text-foreground-muted block">
                {nights} malam menginap
              </span>
            </div>
          )}

          {/* Loading & Status Quote Ketersediaan */}
          {quoteLoading && (
            <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-center gap-2 text-xs text-foreground-muted">
              <Loader2 size={16} className="animate-spin text-brand-blue dark:text-brand-lime" />
              <span>Memeriksa ketersediaan spot pada tanggal baru...</span>
            </div>
          )}

          {quoteError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{quoteError}</span>
            </div>
          )}

          {quote && !quoteLoading && (
            <>
              {quote.available ? (
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Spot Tersedia untuk Jadwal Baru</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-500/20 text-xs text-foreground-muted">
                    <div className="flex justify-between">
                      <span>Tarif Pesanan Awal</span>
                      <span className="font-semibold text-foreground">
                        {rupiah(quote.oldTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tarif Jadwal Baru</span>
                      <span className="font-semibold text-foreground">
                        {rupiah(quote.newTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Layanan Reschedule</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        Gratis (Rp 0)
                      </span>
                    </div>
                    {quote.adminFee > 0 && (
                      <div className="flex justify-between">
                        <span>Biaya Transaksi Pembayaran</span>
                        <span className="font-semibold text-foreground">
                          {rupiah(quote.adminFee)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-500/20 flex justify-between items-center text-foreground font-bold">
                      <span>
                        {quote.priceDifference > 0
                          ? 'Total Selisih Biaya yang Perlu Dibayar'
                          : 'Selisih Biaya'}
                      </span>
                      <span
                        className={`text-sm ${
                          quote.priceDifference > 0
                            ? 'text-brand-blue dark:text-brand-lime'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {quote.totalPayable > 0
                          ? rupiah(quote.totalPayable)
                          : 'Rp 0 (Tanpa Biaya Tambahan)'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
                    <AlertTriangle size={16} />
                    <span>Spot Tidak Tersedia</span>
                  </div>
                  <p className="text-[11px] text-rose-700/90 dark:text-rose-300/90 leading-relaxed">
                    {quote.conflictReason ||
                      'Spot sudah terisi atau tidak tersedia pada rentang tanggal ini. Silakan pilih tanggal check-in lainnya.'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Footer Aksi */}
          <div className="pt-3 border-t border-border/70 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-full border border-border bg-white dark:bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || quoteLoading || !quote?.available}
              className="px-5 py-2.5 rounded-full bg-brand-blue dark:bg-brand-lime hover:bg-brand-blue-hover dark:hover:bg-brand-lime/90 active:scale-95 text-white dark:text-black font-bold dark:font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : quote?.priceDifference && quote.priceDifference > 0 ? (
                <>
                  <CreditCard size={14} />
                  <span>Bayar Selisih · {rupiah(quote.totalPayable)}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Konfirmasi Ubah Jadwal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
