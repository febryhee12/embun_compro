'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { rupiah } from '@/lib/api-client';
import { type Language } from '@/lib/account-i18n';

export interface AddonLine {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  perNight?: boolean;
}

export interface InvoiceDocumentProps {
  order: any;
  booking: any;
  addonLines: AddonLine[];
  nights: number;
  shortCode: string;
  lang?: Language;
}

export interface InvoiceModalProps extends InvoiceDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

const INVOICE_I18N = {
  id: {
    invoiceTitle: 'INVOICE',
    invoiceNumber: (no: string) => `No. ${no}`,
    createdOn: (date: string) => `Dibuat: ${date}`,
    billedTo: 'Ditagihkan Kepada',
    location: 'Lokasi',
    payment: 'Pembayaran',
    paymentStatus: 'Status Pembayaran',
    cashOnSite: 'Tunai di lokasi',
    dpPaidOn: (date: string) => `DP 50% Dibayar: ${date}`,
    paidOn: (date: string) => `Lunas: ${date}`,
    awaitingPayment: 'Menunggu Pembayaran',
    thSpot: 'Spot / Kavling',
    thPackage: 'Paket',
    thQty: 'Qty',
    thCheckIn: 'Check-in',
    thCheckOut: 'Check-out',
    thGuests: 'Tamu',
    thSubtotal: 'Subtotal',
    defaultSpot: 'Spot',
    defaultPackage: 'Paket Standar',
    defaultAddon: 'Layanan Tambahan',
    nightUnit: (n: number) => `${n} malam`,
    guestUnit: (n: number) => `${n} Tamu`,
    subtotalRental: 'Subtotal (Harga Sewa)',
    adminFee: 'Biaya Admin',
    serviceFee: 'Biaya Layanan',
    vat: 'PPN',
    promoDiscount: (code: string) => `Diskon Promo (${code})`,
    remainingRentalBalance: 'Sisa Pokok Sewa (Dibayar di H-1)',
    totalPaymentDP: 'Total Pembayaran (DP 50%)',
    totalPayment: 'Total Pembayaran',
    footerThanks: 'Terima kasih telah memesan melalui embun.',
    footerLegal: 'Invoice ini diterbitkan secara otomatis dan sah tanpa tanda tangan.',
    modalTitle: 'Invoice Resmi Embun',
    printBtn: 'Cetak / Unduh PDF',
    close: 'Tutup',
  },
  en: {
    invoiceTitle: 'INVOICE',
    invoiceNumber: (no: string) => `No. ${no}`,
    createdOn: (date: string) => `Created: ${date}`,
    billedTo: 'Billed To',
    location: 'Location',
    payment: 'Payment',
    paymentStatus: 'Payment Status',
    cashOnSite: 'Cash on site',
    dpPaidOn: (date: string) => `50% DP Paid: ${date}`,
    paidOn: (date: string) => `Paid in Full: ${date}`,
    awaitingPayment: 'Awaiting Payment',
    thSpot: 'Spot / Unit',
    thPackage: 'Package',
    thQty: 'Qty',
    thCheckIn: 'Check-in',
    thCheckOut: 'Check-out',
    thGuests: 'Guests',
    thSubtotal: 'Subtotal',
    defaultSpot: 'Spot',
    defaultPackage: 'Standard Package',
    defaultAddon: 'Additional Service',
    nightUnit: (n: number) => `${n} nights`,
    guestUnit: (n: number) => `${n} Guests`,
    subtotalRental: 'Subtotal (Rental Price)',
    adminFee: 'Admin Fee',
    serviceFee: 'Service Fee',
    vat: 'VAT',
    promoDiscount: (code: string) => `Promo Discount (${code})`,
    remainingRentalBalance: 'Remaining Rental Balance (Due on D-1)',
    totalPaymentDP: 'Total Payment (50% Down Payment)',
    totalPayment: 'Total Payment',
    footerThanks: 'Thank you for booking through Embun.',
    footerLegal: 'This invoice is computer generated and valid without signature.',
    modalTitle: 'Official Embun Invoice',
    printBtn: 'Print / Download PDF',
    close: 'Close',
  },
};

function formatChannel(code?: string, method?: string, lang: Language = 'id'): string {
  if (method === 'CASH') return lang === 'en' ? 'Cash on site' : 'Tunai di lokasi';
  if (!code || !code.trim()) return 'Virtual Account';
  const lower = code.toLowerCase().trim();
  if (lower.startsWith('bank_transfer:')) {
    const bank = lower.substring('bank_transfer:'.length).toUpperCase();
    return `Virtual Account ${bank}`;
  }
  const knownBanks = ['bca', 'bni', 'bri', 'mandiri', 'permata', 'bss', 'cimb', 'danamon', 'bsi'];
  if (knownBanks.includes(lower)) {
    return `Virtual Account ${lower.toUpperCase()}`;
  }
  switch (lower) {
    case 'bank_transfer':
    case 'transfer':
    case 'va':
      return 'Virtual Account';
    case 'qris':
      return 'QRIS';
    case 'gopay':
      return 'GoPay';
    case 'shopeepay':
      return 'ShopeePay';
    case 'echannel':
      return 'Mandiri Bill Payment';
    default:
      return code.toUpperCase();
  }
}

function formatLongDate(dateStr?: string | Date | null, lang: Language = 'id'): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

function formatShortDate(dateStr?: string | Date | null, lang: Language = 'id'): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

/**
 * Komponen Dokumen Invoice Resmi Embun
 * 100% Mengikuti spesifikasi dan tata letak InvoicePdfService pada aplikasi Flutter Embun
 */
export function InvoiceDocument({
  order,
  booking,
  addonLines,
  nights,
  shortCode,
  lang = 'id',
}: InvoiceDocumentProps) {
  if (!order) return null;

  const t = INVOICE_I18N[lang] || INVOICE_I18N.id;
  const campsite = order.campsite;
  const isDP = Boolean(order.isDownPayment);
  const remainingBalance = Number(order.remainingBalance) || 0;
  const isUnsettledDp = isDP && (!order.settledAt || remainingBalance > 0);

  const channelStr = formatChannel(order.paymentChannel, order.paymentMethod, lang);
  const paymentStr =
    order.paymentMethod === 'CASH'
      ? t.cashOnSite
      : channelStr.length > 0
      ? channelStr
      : 'Virtual Account';

  // Hitung total sewa akomodasi pokok (sesuai invoice_pdf_service.dart di flutter)
  const serviceFees =
    (Number(order.guestAdminFee) || 0) +
    (Number(order.guestServiceFee) || 0) +
    (Number(order.guestTaxFee) || 0);

  const promoDiscount =
    (Number(order.promoRentalDiscount) || 0) + (Number(order.promoFeeDiscount) || 0);

  // Total harga sewa (akomodasi + add-on berbayar) sebelum biaya layanan/admin
  const fullRental = isUnsettledDp
    ? (Number(order.downPaymentAmount) || 0) + remainingBalance
    : Math.max(0, (Number(order.totalAmount) || 0) - serviceFees + promoDiscount);

  // Hanya add-on berbayar (amount > 0) yang merupakan tagihan terpisah di invoice.
  const paidAddonLines = addonLines.filter((a) => (Number(a.amount) || 0) > 0);
  const totalPaidAddons = paidAddonLines.reduce(
    (s, a) => s + (Number(a.amount) || 0),
    0,
  );

  // Subtotal sewa spot/unit akomodasi
  const baseRental = Math.max(0, fullRental - totalPaidAddons);

  return (
    <div className="bg-white mx-auto p-8 sm:p-10 rounded-2xl border border-neutral-200/80 shadow-md max-w-[780px] text-neutral-900 text-xs font-sans print:shadow-none print:border-none print:p-0 print:max-w-none print:m-0">
      {/* 1. HEADER (Logo + PT di kiri, INVOICE + No di kanan) */}
      <div className="flex items-start justify-between gap-6 pb-6">
        <div className="space-y-1.5">
          <img
            src="/images/logo/primary_blue.svg"
            alt="Embun"
            className="h-8 w-auto object-contain"
          />
          <p className="text-[11px] font-bold text-neutral-900 pt-1">
            PT Alam Kelana Digital
          </p>
          <p className="text-[9.5px] text-neutral-500">support@embun.app</p>
        </div>

        <div className="text-right space-y-1">
          <h1 className="text-2xl font-black tracking-widest text-[#0841B5]">
            {t.invoiceTitle}
          </h1>
          <p className="text-[11px] font-bold text-neutral-900">
            {t.invoiceNumber(shortCode)}
          </p>
          <p className="text-[10px] text-neutral-500">
            {t.createdOn(formatLongDate(order.createdAt, lang))}
          </p>
        </div>
      </div>

      {/* 2. PARTIES ROW (3 Kolom: Ditagihkan Kepada, Lokasi, Pembayaran) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-b border-[#E5E7EB] my-4 text-[11px]">
        {/* Kolom 1: Ditagihkan kepada */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-bold tracking-wider text-neutral-400 uppercase block">
            {t.billedTo}
          </span>
          <p className="font-bold text-neutral-900 text-xs">
            {order.guestName || (lang === 'en' ? 'Embun Guest' : 'Tamu Embun')}
          </p>
          {order.guestPhone && (
            <p className="text-[10px] text-neutral-600">{order.guestPhone}</p>
          )}
        </div>

        {/* Kolom 2: Lokasi */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-bold tracking-wider text-neutral-400 uppercase block">
            {t.location}
          </span>
          <p className="font-bold text-neutral-900 text-xs">
            {campsite?.name || '-'}
          </p>
          <p className="text-[10px] text-neutral-600 leading-snug">
            {campsite?.address || campsite?.city || campsite?.locationLabel || '-'}
          </p>
        </div>

        {/* Kolom 3: Pembayaran */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-bold tracking-wider text-neutral-400 uppercase block">
            {t.payment}
          </span>
          <p className="font-bold text-neutral-900 text-xs">{paymentStr}</p>
          {order.paidAt ? (
            <p className="text-[10px] text-neutral-600">
              {isDP && isUnsettledDp
                ? t.dpPaidOn(formatLongDate(order.paidAt, lang))
                : t.paidOn(formatLongDate(order.paidAt, lang))}
            </p>
          ) : (
            <p className="text-[10px] text-amber-700 font-medium">
              {t.awaitingPayment}
            </p>
          )}
        </div>
      </div>

      {/* 3. BOOKINGS TABLE (Spot / Kavling, Paket, Qty, Check-in, Check-out, Tamu, Subtotal) */}
      <div className="mt-5 border border-[#E5E7EB] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-[#F3F4F6] text-neutral-800 border-b border-[#E5E7EB]">
              <th className="py-2.5 px-3 font-bold">{t.thSpot}</th>
              <th className="py-2.5 px-3 font-bold">{t.thPackage}</th>
              <th className="py-2.5 px-2 font-bold text-center">{t.thQty}</th>
              <th className="py-2.5 px-3 font-bold">{t.thCheckIn}</th>
              <th className="py-2.5 px-3 font-bold">{t.thCheckOut}</th>
              <th className="py-2.5 px-2 font-bold text-center">{t.thGuests}</th>
              <th className="py-2.5 px-3 font-bold text-right">{t.thSubtotal}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {/* Baris Unit Akomodasi Utama */}
            <tr>
              <td className="py-3 px-3 font-medium text-neutral-900">
                {booking?.block?.name || t.defaultSpot}
              </td>
              <td className="py-3 px-3 text-neutral-700">
                {booking?.packageName || t.defaultPackage}
              </td>
              <td className="py-3 px-2 text-center text-neutral-700">1</td>
              <td className="py-3 px-3 text-neutral-700">
                {formatShortDate(booking?.checkIn, lang)}
              </td>
              <td className="py-3 px-3 text-neutral-700">
                {formatShortDate(booking?.checkOut, lang)}
              </td>
              <td className="py-3 px-2 text-center text-neutral-700">
                {(booking?.adultCount || 2) + (booking?.childCount || 0)}
              </td>
              <td className="py-3 px-3 text-right font-bold text-neutral-900 font-mono">
                {rupiah(baseRental)}
              </td>
            </tr>

            {/* Baris Item Layanan Tambahan (Hanya yang berbayar ekstra) */}
            {paidAddonLines.map((addon, idx) => (
              <tr key={idx} className="bg-neutral-50/50">
                <td className="py-2.5 px-3 font-medium text-neutral-900">
                  {addon.name}
                </td>
                <td className="py-2.5 px-3 text-neutral-500 italic">
                  {t.defaultAddon}
                </td>
                <td className="py-2.5 px-2 text-center text-neutral-700">
                  {addon.quantity}
                  {addon.perNight ? ` × ${t.nightUnit(nights)}` : ''}
                </td>
                <td className="py-2.5 px-3 text-neutral-400 text-center">-</td>
                <td className="py-2.5 px-3 text-neutral-400 text-center">-</td>
                <td className="py-2.5 px-2 text-neutral-400 text-center">-</td>
                <td className="py-2.5 px-3 text-right font-semibold text-neutral-900 font-mono">
                  {rupiah(addon.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. TOTALS (Rincian Sisi Kanan Bawah) */}
      <div className="flex justify-end mt-5">
        <div className="w-full sm:w-72 space-y-1.5 text-[10.5px]">
          {/* Subtotal (Harga Sewa) */}
          <div className="flex justify-between text-neutral-700">
            <span>{t.subtotalRental}</span>
            <span className="font-semibold text-neutral-900 font-mono">
              {rupiah(fullRental)}
            </span>
          </div>

          {/* Biaya Admin */}
          {order.guestAdminFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>{t.adminFee}</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {rupiah(order.guestAdminFee)}
              </span>
            </div>
          )}

          {/* Biaya Layanan */}
          {order.guestServiceFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>{t.serviceFee}</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {rupiah(order.guestServiceFee)}
              </span>
            </div>
          )}

          {/* PPN */}
          {order.guestTaxFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>{t.vat}</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {rupiah(order.guestTaxFee)}
              </span>
            </div>
          )}

          {/* Diskon Promo */}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>{t.promoDiscount(order.promoCode || 'Voucher')}</span>
              <span className="font-semibold font-mono">
                - {rupiah(promoDiscount)}
              </span>
            </div>
          )}

          {/* Sisa Pokok Sewa (Khusus DP Belum Dilunasi) */}
          {isUnsettledDp && (
            <div className="flex justify-between text-[#B45309] font-medium">
              <span>{t.remainingRentalBalance}</span>
              <span className="font-bold font-mono">
                - {rupiah(remainingBalance)}
              </span>
            </div>
          )}

          {/* Kotak Total Pembayaran Abu-abu (#F3F4F6) */}
          <div className="bg-[#F3F4F6] p-2.5 rounded-lg mt-2.5 flex justify-between items-center border border-[#E5E7EB]">
            <span className="font-bold text-xs text-neutral-900">
              {isUnsettledDp ? t.totalPaymentDP : t.totalPayment}
            </span>
            <span className="text-sm font-extrabold text-[#0841B5] font-mono">
              {rupiah(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. FOOTER (Divider + Disclaimer Resmi Sah Tanpa Tanda Tangan) */}
      <div className="border-t border-[#E5E7EB] mt-10 pt-4 space-y-0.5 text-[9.5px] text-neutral-500">
        <p>{t.footerThanks}</p>
        <p>{t.footerLegal}</p>
      </div>
    </div>
  );
}

/**
 * Modal Pop-up untuk Menampilkan Preview Invoice Resmi
 */
export function InvoiceModal({
  isOpen,
  onClose,
  order,
  booking,
  addonLines,
  nights,
  shortCode,
  lang = 'id',
}: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const t = INVOICE_I18N[lang] || INVOICE_I18N.id;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
      {/* Container Dialog */}
      <div className="bg-white dark:bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar */}
        <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-surface/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-sm text-foreground">
              {t.modalTitle}
            </span>
            <span className="text-[11px] font-mono text-foreground-muted bg-surface border border-border px-2 py-0.5 rounded-md font-bold">
              {shortCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blue-hover dark:bg-brand-lime dark:text-black dark:hover:bg-brand-lime/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>{t.printBtn}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              title={t.close}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Kertas A4 Invoice (Tetap light paper untuk print fidelity) */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-neutral-100/80 dark:bg-black/40 flex-1">
          <InvoiceDocument
            order={order}
            booking={booking}
            addonLines={addonLines}
            nights={nights}
            shortCode={shortCode}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
