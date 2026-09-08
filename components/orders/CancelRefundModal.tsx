'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  cancelGuestOrder,
  submitRefundBankDetails,
  rupiah,
} from '@/lib/api-client';

export type Language = 'id' | 'en';

interface CancelRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSuccess: () => Promise<void> | void;
  lang?: Language;
}

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

const I18N = {
  id: {
    modalTitleRefund: 'Ajukan Pembatalan & Refund',
    modalTitlePending: 'Batalkan Pesanan',
    modalTitleNoRefund: 'Batalkan Pesanan (Tanpa Refund)',
    modalTitleConfirm: 'Konfirmasi Rekening Refund',
    modalSubtitleConfirm: 'Periksa kembali data rekening pengembalian dana Anda sebelum mengajukan.',
    close: 'Tutup',
    totalPayment: 'Total Pembayaran',
    cancellationFee: 'Potongan Pembatalan',
    refundEstimate: (pct: number) => `Estimasi Pengembalian (${pct}%)`,
    refundPolicyNotice: 'Sesuai kebijakan pembatalan & refund campsite',
    nonRefundableTitle: 'Pesanan Non-Refundable / Melewati Batas Waktu',
    nonRefundableDesc:
      'Pesanan ini sudah melewati batas waktu pengajuan refund atau berstatus non-refundable. Jika dibatalkan, slot akan dilepas untuk tamu lain dan dana tidak dapat dikembalikan.',
    unpaidTitle: 'Pembatalan Tagihan Belum Dibayar',
    unpaidDesc:
      'Pesanan Anda belum dibayar. Pembatalan ini akan langsung membatalkan invoice dan melepaskan slot tanggal booking secara instan.',
    selectReasonTitle: 'Pilih Alasan Pembatalan',
    customReasonPlaceholder: 'Tuliskan alasan pembatalan Anda...',
    reasons: [
      'Perubahan rencana liburan',
      'Keperluan mendadak / darurat',
      'Salah memilih tanggal atau spot',
      'Kendala cuaca atau transportasi',
      'Menemukan opsi penginapan lain',
      'Lainnya',
    ],
    bankSectionTitle: 'Rekening Tujuan Pengembalian Dana',
    bankSectionDesc:
      'Masukkan rekening bank aktif Anda untuk proses transfer dana refund',
    bankNameLabel: 'Nama Bank',
    bankNamePlaceholder: 'Pilih atau ketik nama bank (contoh: BCA)',
    accountNumberLabel: 'Nomor Rekening',
    accountNumberPlaceholder: 'Contoh: 1234567890',
    accountHolderLabel: 'Nama Pemilik Rekening',
    accountHolderPlaceholder: 'Sesuai buku tabungan / m-banking',
    summaryTitle: 'Ringkasan Data Rekening Penerima',
    bankLabel: 'Bank Tujuan',
    accNoLabel: 'Nomor Rekening',
    accHolderLabel: 'Atas Nama',
    refundAmountLabel: 'Nominal Dana yang Dikembalikan',
    warningTitle: 'PENTING: Pastikan Data Rekening Sudah Benar',
    warningDesc:
      'Pastikan nama bank, nomor rekening, dan nama pemilik rekening sama persis dengan yang terdaftar di bank Anda. Kesalahan data rekening dapat menyebabkan transfer refund gagal atau tertahan di bank pengirim, dan proses verifikasi ulang memerlukan waktu lebih lama.',
    agreementCheckbox:
      'Saya telah memeriksa dan menyatakan bahwa data rekening di atas sudah benar, aktif, dan milik saya pribadi.',
    btnCancel: 'Batal',
    btnBack: 'Kembali & Ubah Data',
    btnContinue: 'Lanjut ke Konfirmasi',
    btnSubmitRefund: 'Ya, Ajukan Refund Sekarang',
    btnSubmitCancel: 'Batalkan Pesanan',
    btnProcessing: 'Memproses...',
    errMissingBankDetails:
      'Mohon lengkapi Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening.',
    errInvalidAccountNumber:
      'Nomor rekening harus berupa angka minimal 5 digit.',
    errAgreementRequired:
      'Mohon centang persetujuan bahwa data rekening Anda sudah dipastikan benar.',
    errGeneralFail: 'Gagal memproses pembatalan pesanan.',
  },
  en: {
    modalTitleRefund: 'Request Cancellation & Refund',
    modalTitlePending: 'Cancel Booking',
    modalTitleNoRefund: 'Cancel Booking (No Refund)',
    modalTitleConfirm: 'Confirm Refund Bank Account',
    modalSubtitleConfirm:
      'Please verify your refund bank account details carefully before submitting.',
    close: 'Close',
    totalPayment: 'Total Payment',
    cancellationFee: 'Cancellation Fee',
    refundEstimate: (pct: number) => `Estimated Refund (${pct}%)`,
    refundPolicyNotice: 'According to campsite cancellation & refund policy',
    nonRefundableTitle: 'Non-Refundable / Past Deadline',
    nonRefundableDesc:
      'This booking has passed the refund deadline or is non-refundable. If cancelled, your spot will be released and no refund will be issued.',
    unpaidTitle: 'Cancel Unpaid Booking',
    unpaidDesc:
      'Your order has not been paid. Cancelling will immediately invalidate the invoice and release the reserved dates.',
    selectReasonTitle: 'Select Cancellation Reason',
    customReasonPlaceholder: 'Please describe your reason for cancellation...',
    reasons: [
      'Change of holiday plans',
      'Urgent personal matters / emergency',
      'Mistake in selecting date or spot',
      'Weather or transportation issues',
      'Found another accommodation option',
      'Other',
    ],
    bankSectionTitle: 'Destination Bank Account for Refund',
    bankSectionDesc:
      'Enter your active bank account for refund bank transfer',
    bankNameLabel: 'Bank Name',
    bankNamePlaceholder: 'Select or type bank name (e.g. BCA)',
    accountNumberLabel: 'Account Number',
    accountNumberPlaceholder: 'e.g. 1234567890',
    accountHolderLabel: 'Account Holder Name',
    accountHolderPlaceholder: 'As stated on bank passbook / m-banking',
    summaryTitle: 'Recipient Bank Account Summary',
    bankLabel: 'Destination Bank',
    accNoLabel: 'Account Number',
    accHolderLabel: 'Account Holder',
    refundAmountLabel: 'Refund Amount to Receive',
    warningTitle: 'IMPORTANT: Double Check Your Bank Details',
    warningDesc:
      'Please ensure the bank name, account number, and recipient name match exactly with your bank records. Incorrect details may result in transfer failure or stuck funds, and correcting them will require longer manual verification.',
    agreementCheckbox:
      'I have reviewed and confirm that the bank account details above are accurate, active, and belong to me.',
    btnCancel: 'Cancel',
    btnBack: 'Back & Edit Details',
    btnContinue: 'Continue to Confirmation',
    btnSubmitRefund: 'Yes, Submit Refund Now',
    btnSubmitCancel: 'Cancel Booking',
    btnProcessing: 'Processing...',
    errMissingBankDetails:
      'Please fill in Bank Name, Account Number, and Account Holder Name.',
    errInvalidAccountNumber:
      'Account number must be numeric and at least 5 digits.',
    errAgreementRequired:
      'Please check the confirmation box to verify your bank details are correct.',
    errGeneralFail: 'Failed to process order cancellation.',
  },
};

export function CancelRefundModal({
  isOpen,
  onClose,
  order,
  onSuccess,
  lang = 'id',
}: CancelRefundModalProps) {
  const t = I18N[lang] || I18N.id;

  const [step, setStep] = useState<'form' | 'confirm'>('form');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rekening Bank state
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSelectedReason(t.reasons[0]);
      setCustomReason('');
      setError(null);
      setIsAgreementChecked(false);
    }
  }, [isOpen, lang]);

  if (!isOpen || !order) return null;

  const isPending = order.status === 'PENDING';
  const isPaid = order.status === 'PAID' || order.status === 'COMPLETE';
  const refundInfo = order.refund;
  const isActuallyRefundEligible = isPaid && refundInfo?.refundEligible;
  const campsiteName = order.campsite?.name || 'Campsite';

  const refundAmount = refundInfo?.refundAmountEstimate ?? 0;
  const refundPct = Math.round((refundInfo?.refundPercentage ?? 0) * 100);
  const deduction = Math.max(0, (order.totalAmount ?? 0) - refundAmount);

  // Validasi step 1 sebelum lanjut ke konfirmasi
  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isActuallyRefundEligible) {
      if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
        setError(t.errMissingBankDetails);
        return;
      }
      const cleanAcc = accountNumber.replace(/\s+/g, '');
      if (!/^\d{5,30}$/.test(cleanAcc)) {
        setError(t.errInvalidAccountNumber);
        return;
      }
      setStep('confirm');
    } else {
      // Jika pesanan non-refundable / pending, langsung eksekusi pembatalan
      void executeCancellation();
    }
  };

  // Eksekusi final pembatalan dan simpan rekening
  const executeCancellation = async () => {
    if (isActuallyRefundEligible && !isAgreementChecked) {
      setError(t.errAgreementRequired);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const isCustom = selectedReason === t.reasons[t.reasons.length - 1];
      const finalReason =
        isCustom && customReason.trim() ? customReason.trim() : selectedReason;

      // 1. Eksekusi pembatalan order di backend
      await cancelGuestOrder(order.id, finalReason);

      // 2. Kirim data rekening refund jika eligible
      if (
        isActuallyRefundEligible &&
        accountNumber.trim() &&
        accountHolder.trim() &&
        bankName.trim()
      ) {
        const cleanAcc = accountNumber.replace(/\s+/g, '');
        await submitRefundBankDetails(order.id, {
          bankName: bankName.trim(),
          accountNumber: cleanAcc,
          accountHolder: accountHolder.trim().toUpperCase(),
        }).catch((err) => {
          console.warn('Gagal menyimpan detail rekening:', err);
        });
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t.errGeneralFail);
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
                step === 'confirm'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                  : isActuallyRefundEligible
                  ? 'bg-brand-blue/10 text-brand-blue dark:bg-brand-lime/10 dark:text-brand-lime'
                  : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {step === 'confirm' ? (
                <ShieldCheck size={22} />
              ) : isActuallyRefundEligible ? (
                <RotateCcw size={20} />
              ) : (
                <AlertTriangle size={20} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-foreground leading-tight">
                {step === 'confirm'
                  ? t.modalTitleConfirm
                  : isActuallyRefundEligible
                  ? t.modalTitleRefund
                  : isPending
                  ? t.modalTitlePending
                  : t.modalTitleNoRefund}
              </h3>
              <p className="text-xs text-foreground-muted truncate max-w-[240px] sm:max-w-xs mt-0.5">
                {step === 'confirm' ? t.modalSubtitleConfirm : campsiteName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground-muted hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            aria-label={t.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 2: FINAL CONFIRMATION (RINGKASAN DATA + WARNING)
             ═══════════════════════════════════════════════════════════ */}
          {step === 'confirm' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-200">
              
              {/* Card Ringkasan Rekening */}
              <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-background border border-border/80 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-xs font-bold text-foreground">
                  <CreditCard size={15} className="text-brand-blue dark:text-brand-lime" />
                  <span>{t.summaryTitle}</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <Building2 size={13} className="text-foreground-muted" />
                      {t.bankLabel}
                    </span>
                    <span className="font-bold text-foreground bg-surface dark:bg-surface/80 px-2.5 py-1 rounded-lg border border-border/60">
                      {bankName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <CreditCard size={13} className="text-foreground-muted" />
                      {t.accNoLabel}
                    </span>
                    <span className="font-mono font-black text-sm sm:text-base tracking-wider text-brand-blue dark:text-brand-lime bg-brand-blue/5 dark:bg-brand-lime/10 px-2.5 py-0.5 rounded-lg border border-brand-blue/20 dark:border-brand-lime/20">
                      {accountNumber.replace(/\s+/g, '')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted flex items-center gap-1.5">
                      <User size={13} className="text-foreground-muted" />
                      {t.accHolderLabel}
                    </span>
                    <span className="font-bold text-foreground uppercase">
                      {accountHolder.trim()}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                    <span className="font-medium text-foreground-muted">
                      {t.refundAmountLabel}
                    </span>
                    <span className="font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                      {rupiah(refundAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* WARNING BOX — JANGAN SAMPAI SALAH DATA */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 space-y-2 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>{t.warningTitle}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                  {t.warningDesc}
                </p>
              </div>

              {/* Checkbox Persetujuan Kebenaran Data */}
              <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-border/80 bg-white dark:bg-surface hover:bg-neutral-50 dark:hover:bg-background/60 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAgreementChecked}
                  onChange={(e) => setIsAgreementChecked(e.target.checked)}
                  className="accent-brand-blue dark:accent-brand-lime w-4 h-4 rounded mt-0.5 shrink-0 cursor-pointer"
                />
                <span className="text-xs font-semibold text-foreground leading-snug">
                  {t.agreementCheckbox}
                </span>
              </label>

            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════
                STEP 1: FORM PEMILIHAN ALASAN & INPUT DATA REKENING
               ═══════════════════════════════════════════════════════════ */
            <form onSubmit={handleProceedToConfirm} id="refund-form" className="space-y-5 animate-in fade-in duration-150">
              
              {/* Breakdown Finansial Refund */}
              {isActuallyRefundEligible ? (
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-background border border-border/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span>{t.totalPayment}</span>
                    <span className="font-semibold text-foreground">
                      {rupiah(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <span>{t.cancellationFee}</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      - {rupiah(deduction)}
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        {t.refundEstimate(refundPct)}
                      </span>
                      <span className="text-[10px] text-foreground-muted">
                        {t.refundPolicyNotice}
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
                    <span>{t.nonRefundableTitle}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-200/90">
                    {t.nonRefundableDesc}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-brand-blue dark:text-brand-lime">
                    <Info size={15} />
                    <span>{t.unpaidTitle}</span>
                  </div>
                  <p className="text-[11px] text-blue-900/80 dark:text-blue-200/90 leading-relaxed">
                    {t.unpaidDesc}
                  </p>
                </div>
              )}

              {/* Pemilihan Alasan Pembatalan */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-foreground">
                  {t.selectReasonTitle}
                </label>
                <div className="space-y-2">
                  {t.reasons.map((reason) => (
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

                {selectedReason === t.reasons[t.reasons.length - 1] && (
                  <div className="pt-2">
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder={t.customReasonPlaceholder}
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime resize-none"
                    />
                  </div>
                )}
              </div>

              {/* Form Input Rekening Bank (Khusus jika eligible refund) */}
              {isActuallyRefundEligible && (
                <div className="pt-2 border-t border-border/60 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CreditCard size={14} className="text-brand-blue dark:text-brand-lime" />
                      <span>{t.bankSectionTitle}</span>
                    </h4>
                    <p className="text-[11px] text-foreground-muted mt-0.5">
                      {t.bankSectionDesc}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">
                        {t.bankNameLabel} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        list="popular-banks"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder={t.bankNamePlaceholder}
                        required
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime"
                      />
                      <datalist id="popular-banks">
                        {POPULAR_BANKS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          {t.accountNumberLabel} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder={t.accountNumberPlaceholder}
                          required
                          className="w-full text-xs font-mono font-medium px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground mb-1">
                          {t.accountHolderLabel} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          placeholder={t.accountHolderPlaceholder}
                          required
                          className="w-full text-xs uppercase px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 dark:focus:ring-brand-lime/30 focus:border-brand-blue dark:focus:border-brand-lime"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="p-4 sm:p-5 border-t border-border/70 flex items-center justify-between gap-2.5 bg-surface/30">
          {step === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                disabled={submitting}
                className="px-4 py-2.5 rounded-full border border-border bg-white dark:bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>{t.btnBack}</span>
              </button>
              <button
                type="button"
                onClick={executeCancellation}
                disabled={submitting || !isAgreementChecked}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>{submitting ? t.btnProcessing : t.btnSubmitRefund}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-full border border-border bg-white dark:bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {t.btnCancel}
              </button>
              <button
                type="submit"
                form="refund-form"
                disabled={submitting}
                className={`px-5 py-2.5 rounded-full font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 ${
                  isActuallyRefundEligible
                    ? 'bg-brand-blue hover:bg-brand-blue-hover dark:bg-brand-lime dark:hover:bg-brand-lime/90 text-white dark:text-black'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                <span>
                  {submitting
                    ? t.btnProcessing
                    : isActuallyRefundEligible
                    ? t.btnContinue
                    : t.btnSubmitCancel}
                </span>
                {isActuallyRefundEligible && !submitting && <ArrowRight size={14} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

