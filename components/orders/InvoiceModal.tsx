'use client';

import React from 'react';
import { X, Printer } from 'lucide-react';
import { rupiah } from '@/lib/api-client';

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
}

export interface InvoiceModalProps extends InvoiceDocumentProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatChannel(code?: string, method?: string): string {
  if (method === 'CASH') return 'Tunai di lokasi';
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

function formatLongDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return String(dateStr);
  }
}

function formatShortDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
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
}: InvoiceDocumentProps) {
  if (!order) return null;

  const campsite = order.campsite;
  const isDP = Boolean(order.isDownPayment);
  const remainingBalance = Number(order.remainingBalance) || 0;
  const isUnsettledDp = isDP && (!order.settledAt || remainingBalance > 0);

  const channelStr = formatChannel(order.paymentChannel, order.paymentMethod);
  const paymentStr =
    order.paymentMethod === 'CASH'
      ? 'Tunai di lokasi'
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
  // Add-on bawaan paket (amount = 0) sudah termasuk dalam harga paket/kavling di atas.
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
            INVOICE
          </h1>
          <p className="text-[11px] font-bold text-neutral-900">
            No. {shortCode}
          </p>
          <p className="text-[10px] text-neutral-500">
            Dibuat: {formatLongDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* 2. PARTIES ROW (3 Kolom: Ditagihkan Kepada, Lokasi, Pembayaran) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-b border-[#E5E7EB] my-4 text-[11px]">
        {/* Kolom 1: Ditagihkan kepada */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-bold tracking-wider text-neutral-400 uppercase block">
            Ditagihkan Kepada
          </span>
          <p className="font-bold text-neutral-900 text-xs">
            {order.guestName || 'Tamu Embun'}
          </p>
          {order.guestPhone && (
            <p className="text-[10px] text-neutral-600">{order.guestPhone}</p>
          )}
        </div>

        {/* Kolom 2: Lokasi */}
        <div className="space-y-1">
          <span className="text-[8.5px] font-bold tracking-wider text-neutral-400 uppercase block">
            Lokasi
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
            Pembayaran
          </span>
          <p className="font-bold text-neutral-900 text-xs">{paymentStr}</p>
          {order.paidAt ? (
            <p className="text-[10px] text-neutral-600">
              {isDP && isUnsettledDp
                ? `DP 50% Dibayar: ${formatLongDate(order.paidAt)}`
                : `Lunas: ${formatLongDate(order.paidAt)}`}
            </p>
          ) : (
            <p className="text-[10px] text-amber-700 font-medium">
              Menunggu Pembayaran
            </p>
          )}
        </div>
      </div>

      {/* 3. BOOKINGS TABLE (Spot / Kavling, Paket, Qty, Check-in, Check-out, Tamu, Subtotal) */}
      <div className="mt-5 border border-[#E5E7EB] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-[10.5px]">
          <thead>
            <tr className="bg-[#F3F4F6] text-neutral-800 border-b border-[#E5E7EB]">
              <th className="py-2.5 px-3 font-bold">Spot / Kavling</th>
              <th className="py-2.5 px-3 font-bold">Paket</th>
              <th className="py-2.5 px-2 font-bold text-center">Qty</th>
              <th className="py-2.5 px-3 font-bold">Check-in</th>
              <th className="py-2.5 px-3 font-bold">Check-out</th>
              <th className="py-2.5 px-2 font-bold text-center">Tamu</th>
              <th className="py-2.5 px-3 font-bold text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {/* Baris Unit Akomodasi Utama */}
            <tr>
              <td className="py-3 px-3 font-medium text-neutral-900">
                {booking?.block?.name || 'Spot'}
              </td>
              <td className="py-3 px-3 text-neutral-700">
                {booking?.packageName || 'Paket Standar'}
              </td>
              <td className="py-3 px-2 text-center text-neutral-700">1</td>
              <td className="py-3 px-3 text-neutral-700">
                {formatShortDate(booking?.checkIn)}
              </td>
              <td className="py-3 px-3 text-neutral-700">
                {formatShortDate(booking?.checkOut)}
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
                  Layanan Tambahan
                </td>
                <td className="py-2.5 px-2 text-center text-neutral-700">
                  {addon.quantity}
                  {addon.perNight ? ` × ${nights} malam` : ''}
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
            <span>Subtotal (Harga Sewa)</span>
            <span className="font-semibold text-neutral-900 font-mono">
              {rupiah(fullRental)}
            </span>
          </div>

          {/* Biaya Admin */}
          {order.guestAdminFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>Biaya Admin</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {rupiah(order.guestAdminFee)}
              </span>
            </div>
          )}

          {/* Biaya Layanan */}
          {order.guestServiceFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>Biaya Layanan</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {rupiah(order.guestServiceFee)}
              </span>
            </div>
          )}

          {/* PPN */}
          {order.guestTaxFee > 0 && (
            <div className="flex justify-between text-neutral-700">
              <span>PPN</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {rupiah(order.guestTaxFee)}
              </span>
            </div>
          )}

          {/* Diskon Promo */}
          {promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Diskon Promo ({order.promoCode || 'Voucher'})</span>
              <span className="font-semibold font-mono">
                - {rupiah(promoDiscount)}
              </span>
            </div>
          )}

          {/* Sisa Pokok Sewa (Khusus DP Belum Dilunasi) */}
          {isUnsettledDp && (
            <div className="flex justify-between text-[#B45309] font-medium">
              <span>Sisa Pokok Sewa (Dibayar di H-1)</span>
              <span className="font-bold font-mono">
                - {rupiah(remainingBalance)}
              </span>
            </div>
          )}

          {/* Kotak Total Pembayaran Abu-abu (#F3F4F6) */}
          <div className="bg-[#F3F4F6] p-2.5 rounded-lg mt-2.5 flex justify-between items-center border border-[#E5E7EB]">
            <span className="font-bold text-xs text-neutral-900">
              {isUnsettledDp
                ? 'Total Pembayaran (DP 50%)'
                : 'Total Pembayaran'}
            </span>
            <span className="text-sm font-extrabold text-[#0841B5] font-mono">
              {rupiah(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. FOOTER (Divider + Disclaimer Resmi Sah Tanpa Tanda Tangan) */}
      <div className="border-t border-[#E5E7EB] mt-10 pt-4 space-y-0.5 text-[9.5px] text-neutral-500">
        <p>Terima kasih telah memesan melalui embun.</p>
        <p>
          Invoice ini diterbitkan secara otomatis dan sah tanpa tanda tangan.
        </p>
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
}: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
      {/* Container Dialog */}
      <div className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Toolbar */}
        <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-surface/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-sm text-foreground">
              Invoice Resmi Embun
            </span>
            <span className="text-[11px] font-mono text-neutral-600 bg-white border border-border px-2 py-0.5 rounded-md font-bold">
              {shortCode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak / Unduh PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-200/80 text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
              title="Tutup"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body: Kertas A4 Invoice */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-neutral-100/60 flex-1">
          <InvoiceDocument
            order={order}
            booking={booking}
            addonLines={addonLines}
            nights={nights}
            shortCode={shortCode}
          />
        </div>
      </div>
    </div>
  );
}
