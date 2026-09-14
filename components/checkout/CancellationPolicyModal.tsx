'use client';

import React from 'react';
import { Info, X, Calendar, ChevronRight, ShieldAlert } from 'lucide-react';

export interface RefundTier {
  label: string;
  percent: string;
  percentNum: number;
  cutoffDate?: Date;
  isAvailable: boolean;
}

export interface RefundPolicyInfo {
  refundable: boolean;
  summaryLabel: string;
  headerTitle: string;
  headerSubtitle: string;
  freeCancelUntilDate: string | null;
  tiers: RefundTier[];
}

export function computeRefundPolicy(
  checkInDateStr?: string,
  nonRefundable = false,
  lang: 'id' | 'en' = 'id',
  isDownPayment = false,
): RefundPolicyInfo {
  if (isDownPayment) {
    return {
      refundable: false,
      summaryLabel:
        lang === 'en'
          ? 'DP 50% Non-Refundable (Reschedule D-7)'
          : 'DP 50% Non-Refundable (Bisa Reschedule H-7)',
      headerTitle:
        lang === 'en'
          ? 'Down Payment (DP 50%) — Non-Refundable'
          : 'Skema DP 50% — Non-Refundable',
      headerSubtitle:
        lang === 'en'
          ? 'Down payment is non-refundable upon cancellation. Reschedule option is available up to 7 days before check-in.'
          : 'Uang muka (DP) bersifat hangus dan tidak dapat dikembalikan jika Anda membatalkan pesanan. Tersedia opsi Ubah Jadwal paling lambat H-7 sebelum check-in.',
      freeCancelUntilDate: null,
      tiers: [],
    };
  }

  if (nonRefundable) {
    return {
      refundable: false,
      summaryLabel:
        lang === 'en'
          ? 'Non-Refundable'
          : 'Tidak Dapat Direfund (Non-Refundable)',
      headerTitle:
        lang === 'en'
          ? 'Non-Refundable'
          : 'Tidak Dapat Dibatalkan (Non-Refundable)',
      headerSubtitle:
        lang === 'en'
          ? 'This reservation cannot be cancelled or refunded once payment is completed.'
          : 'Pesanan ini tidak dapat dibatalkan atau dikembalikan dananya setelah pembayaran berhasil.',
      freeCancelUntilDate: null,
      tiers: [],
    };
  }

  if (!checkInDateStr) {
    return {
      refundable: true,
      summaryLabel:
        lang === 'en'
          ? 'Cancellation & Refund Policy'
          : 'Kebijakan Refund & Pembatalan',
      headerTitle:
        lang === 'en'
          ? 'Cancellation & Refund Policy'
          : 'Kebijakan Refund & Pembatalan',
      headerSubtitle:
        lang === 'en'
          ? 'Cancellation requests are subject to the following refund schedule.'
          : 'Pengajuan pembatalan pemesanan tunduk pada jadwal ketentuan pengembalian dana berikut.',
      freeCancelUntilDate: null,
      tiers: [
        {
          label:
            lang === 'en'
              ? 'More than 7 days before check-in'
              : 'Lebih dari 7 hari sebelum check-in',
          percent: '100%',
          percentNum: 100,
          isAvailable: true,
        },
        {
          label:
            lang === 'en'
              ? '3 – 7 days before check-in'
              : '3 – 7 hari sebelum check-in',
          percent: '50%',
          percentNum: 50,
          isAvailable: true,
        },
        {
          label:
            lang === 'en'
              ? 'Less than 3 days before check-in'
              : 'Kurang dari 3 hari sebelum check-in',
          percent: '0%',
          percentNum: 0,
          isAvailable: true,
        },
      ],
    };
  }

  const parts = checkInDateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) {
    return {
      refundable: false,
      summaryLabel:
        lang === 'en' ? 'Cancellation Policy' : 'Kebijakan Pembatalan',
      headerTitle:
        lang === 'en'
          ? 'Standard Cancellation Policy'
          : 'Kebijakan Pembatalan Standar',
      headerSubtitle:
        lang === 'en'
          ? 'Cancellations are subject to campsite manager terms and conditions.'
          : 'Pengajuan pembatalan tunduk pada syarat dan ketentuan pengelola campsite.',
      freeCancelUntilDate: null,
      tiers: [],
    };
  }

  const checkIn = new Date(parts[0], parts[1] - 1, parts[2]);

  const tier100Date = new Date(checkIn);
  tier100Date.setDate(tier100Date.getDate() - 7);

  const tier50Date = new Date(checkIn);
  tier50Date.setDate(tier50Date.getDate() - 3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isTier100Available = tier100Date >= today;
  const isTier50Available = tier50Date >= today;

  const formatDateLocale = (d: Date) => {
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const tier100DateStr = formatDateLocale(tier100Date);
  const tier50DateStr = formatDateLocale(tier50Date);

  const tiers: RefundTier[] = [
    {
      label: lang === 'en' ? `Until ${tier100DateStr}` : `Sampai ${tier100DateStr}`,
      percent: '100%',
      percentNum: 100,
      cutoffDate: tier100Date,
      isAvailable: isTier100Available,
    },
    {
      label: lang === 'en' ? `Until ${tier50DateStr}` : `Sampai ${tier50DateStr}`,
      percent: '50%',
      percentNum: 50,
      cutoffDate: tier50Date,
      isAvailable: isTier50Available,
    },
    {
      label: lang === 'en' ? 'Afterwards' : 'Setelahnya',
      percent: '0%',
      percentNum: 0,
      isAvailable: true,
    },
  ];

  let summaryLabel =
    lang === 'en' ? 'Cancellation Policy' : 'Kebijakan Pembatalan';
  let headerTitle =
    lang === 'en' ? 'Cancellation Policy' : 'Kebijakan Pembatalan';
  let headerSubtitle =
    lang === 'en'
      ? 'Cancel before this date for a 100% rental refund. Admin & service fees are non-refundable.'
      : 'Batalkan sebelum tanggal ini untuk refund 100% harga sewa. Biaya admin & layanan tidak dikembalikan.';

  if (isTier100Available) {
    summaryLabel =
      lang === 'en'
        ? `100% refund until ${tier100DateStr}`
        : `Refund 100% sampai ${tier100DateStr}`;
    headerTitle =
      lang === 'en'
        ? `100% refund until ${tier100DateStr}`
        : `Refund 100% sampai ${tier100DateStr}`;
    headerSubtitle =
      lang === 'en'
        ? 'Cancel before this date for a 100% rental refund. Admin & service fees are non-refundable.'
        : 'Batalkan sebelum tanggal ini untuk refund 100% harga sewa. Biaya admin & layanan tidak dikembalikan.';
  } else if (isTier50Available) {
    summaryLabel =
      lang === 'en'
        ? `50% refund until ${tier50DateStr}`
        : `Refund 50% sampai ${tier50DateStr}`;
    headerTitle =
      lang === 'en'
        ? `50% refund until ${tier50DateStr}`
        : `Refund 50% sampai ${tier50DateStr}`;
    headerSubtitle =
      lang === 'en'
        ? 'Cancel before this date for a 50% rental refund. Admin & service fees are non-refundable.'
        : 'Batalkan sebelum tanggal ini untuk refund 50% harga sewa. Biaya admin & layanan tidak dikembalikan.';
  } else {
    summaryLabel =
      lang === 'en'
        ? 'Non-Refundable (past refund deadline)'
        : 'Non-Refundable (lewat batas refund)';
    headerTitle =
      lang === 'en'
        ? 'Refund Deadline Has Passed'
        : 'Batas Waktu Pengembalian Dana Telah Lewat';
    headerSubtitle =
      lang === 'en'
        ? 'Reservations made close to check-in date are non-refundable.'
        : 'Pemesanan yang dilakukan mendekati hari-H tidak dapat dikembalikan dananya.';
  }

  return {
    refundable: isTier100Available || isTier50Available,
    summaryLabel,
    headerTitle,
    headerSubtitle,
    freeCancelUntilDate: isTier100Available ? tier100DateStr : null,
    tiers,
  };
}

interface CancellationPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkInDate?: string;
  nonRefundable?: boolean;
  isDownPayment?: boolean;
  lang?: 'id' | 'en';
}

export function CancellationPolicyModal({
  isOpen,
  onClose,
  checkInDate,
  nonRefundable = false,
  isDownPayment = false,
  lang = 'id',
}: CancellationPolicyModalProps) {
  if (!isOpen) return null;

  const policy = computeRefundPolicy(checkInDate, nonRefundable, lang, isDownPayment);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-surface text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Mobile drag handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
        </div>

        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info size={20} className="text-foreground shrink-0" />
            <h3 className="font-bold text-base sm:text-lg text-foreground">
              {isDownPayment
                ? (lang === 'en' ? 'Down Payment Policy' : 'Ketentuan Down Payment (DP)')
                : (lang === 'en' ? 'Cancellation Policy' : 'Kebijakan Pembatalan')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-background/80 text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label={lang === 'en' ? 'Close' : 'Tutup'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          <div className="space-y-1.5">
            <h4 className="font-bold text-base sm:text-lg text-foreground">
              {policy.headerTitle}
            </h4>
            <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed">
              {policy.headerSubtitle}
            </p>
          </div>

          {isDownPayment ? (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
                <Info size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    {lang === 'en'
                      ? 'DP 50% Scheme: Non-Refundable'
                      : 'Skema DP 50%: Non-Refundable (Uang Muka Hangus)'}
                  </p>
                  <p className="leading-relaxed text-[11.5px] text-foreground-muted">
                    {lang === 'en'
                      ? 'The down payment is non-refundable if you cancel this reservation or fail to settle the remaining balance before the deadline.'
                      : 'Uang muka (DP) yang telah dibayarkan bersifat hangus dan tidak dapat dikembalikan jika Anda membatalkan pesanan atau gagal melunasi sisa tagihan tepat waktu.'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface/70 border border-border space-y-3 text-xs">
                <h5 className="font-bold text-foreground">
                  {lang === 'en' ? 'Key Down Payment Rules' : 'Ketentuan Khusus Down Payment (DP)'}
                </h5>
                <ul className="space-y-2.5 text-[11.5px] text-foreground-muted">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-foreground">{lang === 'en' ? 'Reschedule Option (D-7):' : 'Opsi Ubah Jadwal (H-7):'} </strong>
                      {lang === 'en'
                        ? 'Reschedule can be requested at most 1 time, at least 7 calendar days before check-in date.'
                        : 'Pengajuan ubah jadwal (reschedule) hanya dapat dilakukan maksimal 1 kali, paling lambat H-7 sebelum tanggal check-in.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-foreground">{lang === 'en' ? 'Online Settlement (D-1):' : 'Pelunasan Online (H-1):'} </strong>
                      {lang === 'en'
                        ? 'Remaining balance (50%) must be settled online via the Embun App/Web no later than 24 hours before check-in (D-1 23:59 WIB). No onsite payments.'
                        : 'Pelunasan sisa tagihan (50%) wajib 100% dilakukan secara online melalui aplikasi/web Embun paling lambat H-1 (24 jam sebelum check-in). Tidak menerima pelunasan tunai di lokasi.'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>
                      <strong className="text-foreground">{lang === 'en' ? 'Campsite Cancellation / Force Majeure:' : 'Pembatalan Pihak Campsite / Force Majeure:'} </strong>
                      {lang === 'en'
                        ? 'If the campsite unilaterally cancels or in force majeure events, the DP amount is 100% fully refunded including platform fees.'
                        : 'Jika pengelola campsite membatalkan pesanan secara sepihak atau terjadi force majeure, uang muka DP dikembalikan 100% penuh termasuk biaya platform.'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          ) : !policy.refundable ? (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  {lang === 'en'
                    ? 'Unit / Spot Non-Refundable'
                    : 'Unit / Spot Tidak Dapat Direfund'}
                </p>
                <p className="leading-relaxed text-[11.5px] text-foreground-muted">
                  {lang === 'en'
                    ? 'This unit has been designated as non-refundable by the host. Once confirmed and paid, cancellations are not eligible for a refund.'
                    : 'Spot ini telah ditetapkan oleh pengelola sebagai non-refundable. Setelah pemesanan dibayar, pengajuan pembatalan tidak berhak atas pengembalian dana.'}
                </p>
              </div>
            </div>
          ) : null}

          {/* Table (only when tiers available and not DP) */}
          {!isDownPayment && policy.tiers.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground-muted pb-2 border-b border-border/70">
                <span>{lang === 'en' ? 'Cancellation Window' : 'Batas Waktu Pembatalan'}</span>
                <span>{lang === 'en' ? 'Refund' : 'Refund'}</span>
              </div>
              <div className="divide-y divide-border/50">
                {policy.tiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span className="text-foreground font-medium">
                      {tier.label}
                    </span>
                    <span
                      className={`font-bold ${
                        tier.percentNum >= 100
                          ? 'text-[#2E7D32] dark:text-emerald-400'
                          : 'text-foreground'
                      }`}
                    >
                      {tier.percent}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-border/70">
            <a
              href={`/${lang}/kebijakan-refund/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand-blue dark:text-brand-lime font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>
                {lang === 'en'
                  ? 'Learn more about our Refund & Cancellation Policy'
                  : 'Pelajari Kebijakan Refund & Pembatalan Selengkapnya'}
              </span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CancellationPolicyBannerButtonProps {
  checkInDate?: string;
  nonRefundable?: boolean;
  isDownPayment?: boolean;
  onClick: () => void;
  className?: string;
  lang?: 'id' | 'en';
}

export function CancellationPolicyBannerButton({
  checkInDate,
  nonRefundable = false,
  isDownPayment = false,
  onClick,
  className = '',
  lang = 'id',
}: CancellationPolicyBannerButtonProps) {
  const policy = computeRefundPolicy(checkInDate, nonRefundable, lang, isDownPayment);
  const isAlert = nonRefundable || isDownPayment;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-2xl ${
        isAlert
          ? 'bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/30 text-left'
          : 'bg-surface/60 hover:bg-surface dark:bg-surface/80 dark:hover:bg-surface border-border/80 text-left'
      } border transition-all cursor-pointer group shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2.5 text-xs">
        {isDownPayment ? (
          <Calendar size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
        ) : nonRefundable ? (
          <ShieldAlert size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <Calendar size={15} className="text-neutral-700 dark:text-brand-lime shrink-0" />
        )}
        <span
          className={`font-semibold transition-colors ${
            isAlert
              ? 'text-amber-800 dark:text-amber-300 font-bold'
              : 'text-foreground group-hover:text-brand-blue dark:group-hover:text-brand-lime'
          }`}
        >
          {policy.summaryLabel}
        </span>
      </div>
      <ChevronRight
        size={16}
        className="text-foreground-muted group-hover:translate-x-0.5 transition-transform shrink-0"
      />
    </button>
  );
}
