'use client';

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Building2,
  CreditCard,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  cancelGuestOrder,
  submitRefundBankDetails,
  rupiah,
} from '@/lib/api-client';

interface CancelRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => Promise<void> | void;
}

const CANCEL_REASONS = [
  'Perubahan rencana liburan',
  'Keperluan mendadak / darurat',
  'Salah memilih tanggal atau spot',
  'Kendala cuaca atau transportasi',
  'Menemukan opsi penginapan lain',
  'Lainnya',
];

const POPULAR_BANKS = [
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'BSI (Bank Syariah Indonesia)',
  'CIMB Niaga',
  'Permata Bank',
  'BCA Digital (blu)',
  'Bank Jago',
  'Seabank',
];

export function CancelRefundModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: CancelRefundModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rekening Bank state (bila refund eligible & pembayaran butuh manual transfer)
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  if (!isOpen || !order) return null;

  const isPending = order.status === 'PENDING';
  const isPaid = order.status === 'PAID' || order.status === 'COMPLETE';
  const refundInfo = order.refund;
  const isActuallyRefundEligible = isPaid && refundInfo?.refundEligible;
  const campsiteName = order.campsite?.name || 'Campsite';

  const refundAmount = refundInfo?.refundAmountEstimate ?? 0;
  const refundPct = Math.round((refundInfo?.refundPercentage ?? 0) * 100);
  const deduction = Math.max(0, (order.totalAmount ?? 0) - refundAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const finalReason =
        selectedReason === 'Lainnya' && customReason.trim()
          ? customReason.trim()
          : selectedReason;

      // 1. Eksekusi pembatalan order
      await cancelGuestOrder(order.id, finalReason);

      // 2. Jika ada data rekening bank yang diinputkan untuk refund, kirimkan
      if (
        isActuallyRefundEligible &&
        accountNumber.trim() &&
        accountHolder.trim() &&
        bankName.trim()
      ) {
        await submitRefundBankDetails(order.id, {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
        }).catch((err) => {
          console.warn('Gagal menyimpan detail rekening:', err);
        });
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memproses pembatalan pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-surface text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-border/70 flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isActuallyRefundEligible
                  ? 'bg-brand-blue/10 text-brand-blue dark:bg-brand-lime/10 dark:text-brand-lime'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isActuallyRefundEligible ? (
                <RotateCcw size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                {isActuallyRefundEligible
                  ? 'Ajukan Pembatalan & Refund'
                  : isPending
                  ? 'Batalkan Pesanan'
                  : 'Batalkan Pesanan (Tanpa Refund)'}
              </h3>
              <p className="text-xs text-foreground-muted truncate max-w-[240px] sm:max-w-xs">
                {campsiteName}
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

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Breakdown Finansial Refund */}
          {isActuallyRefundEligible ? (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-background border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span>Total Pembayaran</span>
                <span className="font-semibold text-foreground">
                  {rupiah(order.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-foreground-muted">
                <span>Potongan Pembatalan</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  - {rupiah(deduction)}
                </span>
              </div>
              <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    Estimasi Pengembalian ({refundPct}%)
                  </span>
                  <span className="text-[10px] text-foreground-muted">
                    Sesuai kebijakan refund campsite
                  </span>
                </div>
                <span className="font-black text-sm sm:text-base text-brand-blue dark:text-brand-lime">
                  {rupiah(refundAmount)}
                </span>
              </div>
            </div>
          ) : isPaid ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle size={15} />
                <span>Pesanan Non-Refundable / Melewati Batas Waktu</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                Pesanan ini sudah melewati batas waktu pengajuan refund atau berstatus non-refundable. Jika dibatalkan, slot akan dilepas untuk tamu lain dan dana tidak dapat dikembalikan.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-brand-blue dark:text-brand-lime">
                <Info size={15} />
                <span>Pembatalan Tagihan Belum Dibayar</span>
              </div>
              <p className="text-[11px] text-blue-900/80 dark:text-blue-200/90 leading-relaxed">
                Pesanan Anda belum dibayar. Pembatalan ini akan langsung membatalkan invoice dan melepaskan slot tanggal booking secara instan.
              </p>
            </div>
          )}

          {/* Pemilihan Alasan Pembatalan */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-foreground">
              Pilih Alasan Pembatalan
            </label>
            <div className="space-y-2">
              {CANCEL_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-brand-blue bg-brand-blue/5 dark:border-brand-lime dark:bg-brand-lime/10 text-foreground font-semibold shadow-2xs'
                      : 'border-border bg-white dark:bg-background hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-foreground-muted hover:text-foreground'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-brand-blue dark:accent-brand-lime w-4 h-4 cursor-pointer"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Lainnya' && (
              <div className="pt-2">
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Tuliskan alasan pembatalan Anda..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime resize-none"
                />
              </div>
            )}
          </div>

          {/* Form Rekening Bank (Bila refund eligible) */}
          {isActuallyRefundEligible && (
            <div className="pt-2 border-t border-border/60 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CreditCard size={14} className="text-brand-blue dark:text-brand-lime" />
                  <span>Rekening Tujuan Pengembalian Dana</span>
                </h4>
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  Masukkan rekening bank Anda untuk proses transfer pengembalian dana
                </p>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    list="popular-banks"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Contoh: BCA / Mandiri / BRI"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime"
                  />
                  <datalist id="popular-banks">
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="1234567890"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Sesuai buku tabungan"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime"
                    />
                  </div>
                </div>
              </div>
            </div>
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
              disabled={submitting}
              className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>
                {submitting
                  ? 'Memproses...'
                  : isActuallyRefundEligible
                  ? 'Ajukan Refund'
                  : 'Batalkan Pesanan'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
