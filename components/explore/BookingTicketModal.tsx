import React, { useRef } from "react";
import {
  X,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Printer,
  Share2,
  Download,
  Smartphone,
  ExternalLink,
  QrCode,
  Sparkles,
  Receipt,
  Tent,
  Copy,
  Check,
} from "lucide-react";
import { resolveAssetUrl, rupiah } from "@/lib/api-client";

interface BookingTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    campsite: {
      name: string;
      address?: string;
      city?: string;
      photoUrl?: string;
      googleMapsUrl?: string;
      checkInTime?: string;
      checkOutTime?: string;
    };
    spot: {
      name: string;
      tentType?: string;
      packageName?: string;
    };
    guest: {
      fullName: string;
      phone: string;
      email?: string;
    };
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    guestCount: number;
    paymentScheme: "DP_50" | "FULL";
    spotPrice: number;
    addons: Array<{ name: string; price: number; qty: number }>;
    serviceFee: number;
    grandTotal: number;
    paidAmount: number;
    remainingBalance: number;
  } | null;
}

export function BookingTicketModal({
  isOpen,
  onClose,
  orderData,
}: BookingTicketModalProps) {
  const [copied, setCopied] = React.useState(false);
  const printableRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen || !orderData) return null;

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

function DummyQrPlaceholder({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Top-Left Finder */}
      <rect x="6" y="6" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="14" y="14" width="12" height="12" rx="2" fill="currentColor" />

      {/* Top-Right Finder */}
      <rect x="66" y="6" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="74" y="14" width="12" height="12" rx="2" fill="currentColor" />

      {/* Bottom-Left Finder */}
      <rect x="6" y="66" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="14" y="74" width="12" height="12" rx="2" fill="currentColor" />

      {/* Alignment Pattern */}
      <rect x="68" y="68" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="73" y="73" width="6" height="6" rx="1" fill="currentColor" />

      {/* Dummy timing / module squares */}
      <rect x="38" y="8" width="5" height="5" rx="1" />
      <rect x="48" y="8" width="5" height="5" rx="1" />
      <rect x="56" y="8" width="5" height="5" rx="1" />
      <rect x="42" y="16" width="5" height="5" rx="1" />
      <rect x="52" y="16" width="5" height="5" rx="1" />
      <rect x="38" y="24" width="5" height="5" rx="1" />
      <rect x="48" y="24" width="5" height="5" rx="1" />
      <rect x="58" y="24" width="5" height="5" rx="1" />

      <rect x="8" y="38" width="5" height="5" rx="1" />
      <rect x="8" y="48" width="5" height="5" rx="1" />
      <rect x="8" y="56" width="5" height="5" rx="1" />
      <rect x="16" y="42" width="5" height="5" rx="1" />
      <rect x="16" y="52" width="5" height="5" rx="1" />
      <rect x="24" y="38" width="5" height="5" rx="1" />
      <rect x="24" y="48" width="5" height="5" rx="1" />
      <rect x="24" y="58" width="5" height="5" rx="1" />

      {/* Center cluster */}
      <rect x="38" y="38" width="6" height="6" rx="1" />
      <rect x="48" y="38" width="6" height="6" rx="1" />
      <rect x="56" y="38" width="6" height="6" rx="1" />
      <rect x="38" y="48" width="6" height="6" rx="1" />
      <rect x="46" y="46" width="8" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="58" y="48" width="6" height="6" rx="1" />
      <rect x="38" y="58" width="6" height="6" rx="1" />
      <rect x="48" y="58" width="6" height="6" rx="1" />
      <rect x="58" y="58" width="6" height="6" rx="1" />

      {/* Right / Bottom clusters */}
      <rect x="70" y="38" width="5" height="5" rx="1" />
      <rect x="80" y="40" width="5" height="5" rx="1" />
      <rect x="88" y="38" width="5" height="5" rx="1" />
      <rect x="74" y="48" width="5" height="5" rx="1" />
      <rect x="84" y="52" width="5" height="5" rx="1" />

      <rect x="38" y="70" width="5" height="5" rx="1" />
      <rect x="44" y="80" width="5" height="5" rx="1" />
      <rect x="38" y="88" width="5" height="5" rx="1" />
      <rect x="50" y="74" width="5" height="5" rx="1" />
      <rect x="54" y="84" width="5" height="5" rx="1" />
    </svg>
  );
}

  const shortCode = orderData.orderId.slice(-8).toUpperCase();
  const isDP = orderData.paymentScheme === "DP_50";
  const isUnsettledDP = isDP && Number(orderData.remainingBalance ?? 0) > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white text-foreground rounded-3xl shadow-2xl border border-border w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header Modal Bar */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-sm text-foreground">
              E-Tiket & Bukti Reservasi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-full border border-border hover:bg-surface text-foreground transition-colors cursor-pointer"
              title="Cetak E-Tiket"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs" ref={printableRef}>
          {/* Success Banner */}
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={24} />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="font-extrabold text-base text-emerald-900">
                Pemesanan Anda Berhasil!
              </h3>
              <p className="text-emerald-800 leading-relaxed text-xs">
                E-tiket resmi dan rincian invoice telah terbit. Tunjukkan kode booking atau QR code ini kepada petugas saat check-in di lokasi.
              </p>
            </div>
          </div>

          {/* QR Code & Booking Code Card */}
          <div className="p-5 rounded-3xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1.5 flex-1">
              <span className="text-[10.5px] uppercase font-bold tracking-wider text-foreground-muted">
                Kode Booking Resmi
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl font-black text-brand-blue tracking-wider font-mono">
                  {shortCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-xl border border-border bg-white hover:bg-surface text-foreground-muted hover:text-foreground cursor-pointer transition-colors"
                  title="Salin Kode"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-[11px] text-foreground-muted">
                No. Pesanan: <span className="font-mono text-foreground">{orderData.orderId}</span>
              </p>
            </div>

            {/* Simulated QR Code Box */}
            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-border shadow-xs shrink-0 self-center sm:self-auto">
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-surface-variant flex items-center justify-center rounded-xl p-2.5 border border-border/50 relative overflow-hidden">
                {isUnsettledDP ? (
                  <>
                    <DummyQrPlaceholder className="w-full h-full object-contain filter blur-md opacity-25 select-none pointer-events-none scale-105 text-neutral-800" />
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <span className="px-3 py-1 rounded-full bg-white/95 border border-neutral-200/90 text-neutral-600 text-[11px] font-semibold shadow-2xs backdrop-blur-xs tracking-wide select-none">
                        Belum Aktif
                      </span>
                    </div>
                  </>
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(orderData.orderId)}`}
                    alt="QR Code Check-in"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              {isUnsettledDP ? (
                <span className="text-[10px] font-medium text-foreground-muted text-center select-none">
                  Aktif setelah pelunasan
                </span>
              ) : (
                <span className="text-[10px] font-bold text-foreground-muted flex items-center gap-1.5">
                  <QrCode size={12} className="text-brand-blue" />
                  Scan Check-In
                </span>
              )}
            </div>
          </div>

          {/* Property & Stay Details */}
          <div className="p-5 rounded-3xl border border-border space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
              <div className="space-y-1 flex-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue">
                  {orderData.campsite.name}
                </span>
                <h4 className="font-extrabold text-base text-foreground mt-1">
                  {orderData.spot.name}
                </h4>
                <p className="text-foreground-muted text-xs">
                  {orderData.spot.packageName || "Paket Penginapan"} · {orderData.campsite.address || orderData.campsite.city}
                </p>
              </div>
              {orderData.campsite.photoUrl && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border shrink-0">
                  <img
                    src={resolveAssetUrl(orderData.campsite.photoUrl)}
                    alt="Campsite"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Check-in & Check-out Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 p-3 rounded-2xl bg-surface">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                  <Calendar size={12} className="text-brand-blue" />
                  Check-In
                </span>
                <p className="font-bold text-foreground">
                  {formatDateDisplay(orderData.checkInDate)}
                </p>
                <p className="text-[10.5px] text-foreground-muted">
                  Mulai {orderData.campsite.checkInTime || "14:00"} WIB
                </p>
              </div>

              <div className="space-y-1 p-3 rounded-2xl bg-surface">
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                  <Calendar size={12} className="text-brand-blue" />
                  Check-Out
                </span>
                <p className="font-bold text-foreground">
                  {formatDateDisplay(orderData.checkOutDate)}
                </p>
                <p className="text-[10.5px] text-foreground-muted">
                  Maksimal {orderData.campsite.checkOutTime || "12:00"} WIB
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-foreground-muted flex items-center gap-1.5">
                <Users size={13} className="text-brand-blue" />
                Jumlah Tamu: <strong className="text-foreground">{orderData.guestCount} Orang</strong>
              </span>
              <span className="text-foreground-muted flex items-center gap-1.5">
                <Clock size={13} className="text-brand-blue" />
                Durasi: <strong className="text-brand-blue">{orderData.nights} Malam</strong>
              </span>
            </div>
          </div>

          {/* Guest Information */}
          <div className="p-4 rounded-2xl bg-surface border border-border space-y-1.5">
            <h5 className="font-bold text-xs text-foreground uppercase tracking-wider">
              Data Tamu Pemesan
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-muted">Nama: </span>
                <strong className="text-foreground">{orderData.guest.fullName}</strong>
              </div>
              <div>
                <span className="text-foreground-muted">WhatsApp / HP: </span>
                <strong className="text-foreground">{orderData.guest.phone}</strong>
              </div>
              {orderData.guest.email && (
                <div className="sm:col-span-2">
                  <span className="text-foreground-muted">Email E-Tiket: </span>
                  <strong className="text-foreground">{orderData.guest.email}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Invoice & Payment Breakdown */}
          <div className="p-5 rounded-3xl border border-border space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h5 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-brand-blue" />
                <span>Rincian Pembayaran (Invoice)</span>
              </h5>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isDP ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}>
                {isDP ? "DP 50% Terbayar" : "Lunas Terverifikasi"}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-foreground-muted">
                <span>
                  Sewa Unit ({rupiah(orderData.spotPrice)} x {orderData.nights} malam)
                </span>
                <span className="font-semibold text-foreground">
                  {rupiah(orderData.spotPrice * orderData.nights)}
                </span>
              </div>

              {orderData.addons.map((add, idx) => (
                <div key={idx} className="flex justify-between text-foreground-muted">
                  <span>
                    {add.name} ({rupiah(add.price)} x {add.qty})
                  </span>
                  <span className="font-semibold text-foreground">
                    +{rupiah(add.price * add.qty)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between text-foreground-muted">
                <span>Biaya Layanan & Pajak</span>
                <span className="font-semibold text-foreground">
                  +{rupiah(orderData.serviceFee)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-border font-bold text-sm text-foreground">
                <span>Total Tagihan Keseluruhan</span>
                <span className="text-base text-brand-blue font-extrabold">
                  {rupiah(orderData.grandTotal)}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1 text-xs">
                <span className="font-semibold text-emerald-600">Jumlah Terbayar Online</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  {rupiah(orderData.paidAmount)}
                </span>
              </div>

              {isDP && orderData.remainingBalance > 0 && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex justify-between items-center text-xs mt-2">
                  <span>Sisa Pelunasan di Lokasi:</span>
                  <strong className="text-sm font-extrabold text-amber-950">
                    {rupiah(orderData.remainingBalance)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://apps.apple.com/app/embun"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white text-xs font-bold shadow-md cursor-pointer transition-all"
          >
            <Smartphone size={14} />
            <span>Kelola di Aplikasi Embun</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-border bg-white hover:bg-surface text-foreground text-xs font-bold transition-all cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
