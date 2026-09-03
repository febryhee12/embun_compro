'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tent,
  ShieldCheck,
  CreditCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Receipt,
  Info,
} from 'lucide-react';
import {
  createRealOrder,
  initiateOrderPayment,
  initiateXenditPayment,
  syncOrderStatus,
  getGuestToken,
  getGuestUser,
  setGuestSession,
  clearGuestSession,
  updateGuestProfile,
  resolveAssetUrl,
  rupiah,
  ApiError,
} from '@/lib/api-client';

interface CheckoutDraft {
  campsite: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    photoUrl?: string;
    googleMapsUrl?: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
  spot: {
    id: string;
    name: string;
    tentType?: string;
  };
  selectedPackage: {
    id: string;
    name: string;
    price: number;
  };
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCount: number;
  paymentScheme: 'DP_50' | 'FULL';
  spotPricePerNight: number;
  selectedAddons: Record<string, number>;
  activeAddonsList: Array<{ id: string; name: string; price: number; qty: number }>;
  addonsTotal: number;
  totalServiceAndTaxFee: number;
  grandTotal: number;
  paymentAmountToPay: number;
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

export function CheckoutClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraft | null>(null);
  const [loading, setLoading] = useState(true);

  // Form data pemesan
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [agreed, setAgreed] = useState(true);

  // Skema bayar yang bisa diubah di halaman checkout
  const [paymentScheme, setPaymentScheme] = useState<'DP_50' | 'FULL'>('FULL');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cek auth
    const token = getGuestToken();
    const user = getGuestUser();

    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
    }

    // Ambil data draft dari sessionStorage
    try {
      const stored = sessionStorage.getItem('embun_checkout_draft');
      if (stored) {
        const parsed: CheckoutDraft = JSON.parse(stored);
        setDraft(parsed);
        setPaymentScheme(parsed.paymentScheme || 'FULL');
      }
    } catch (e) {
      console.error('Failed to parse checkout draft:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center gap-3 text-foreground-muted">
        <Loader2 size={26} className="animate-spin text-brand-blue" />
        <p className="text-xs font-semibold">Memuat halaman pemesanan...</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center text-foreground-muted mb-4">
          <Tent size={28} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Pemesanan Tidak Ditemukan</h2>
        <p className="text-xs text-foreground-muted max-w-sm mb-6">
          Sesi pemilihan unit Anda telah berakhir atau belum dimulai. Silakan pilih unit camping kembali.
        </p>
        <Link
          href="/explore"
          className="px-6 py-3 rounded-full bg-brand-blue text-white text-xs font-bold shadow-md hover:bg-brand-blue-hover transition-all"
        >
          Kembali ke Explore
        </Link>
      </div>
    );
  }

  // Hitung ulang nominal jika skema bayar diubah di checkout
  const isDP = paymentScheme === 'DP_50';
  const cleanRental = draft.spotPricePerNight * draft.nights + draft.addonsTotal;
  const dpAmount = Math.round(cleanRental * 0.5);
  const remainingBalance = isDP ? cleanRental - dpAmount : 0;
  const currentPayable = isDP
    ? dpAmount + draft.totalServiceAndTaxFee
    : draft.grandTotal;

  const handleConfirmAndPay = async () => {
    setError(null);

    // Validasi form
    if (!fullName.trim()) {
      setError('Mohon lengkapi nama lengkap pemesan sesuai identitas.');
      return;
    }
    if (!phone.trim() || phone.length < 8) {
      setError('Mohon lengkapi nomor WhatsApp yang aktif untuk konfirmasi & tiket.');
      return;
    }
    if (!address.trim()) {
      setError('Mohon lengkapi alamat atau kota asal pemesan.');
      return;
    }
    if (!agreed) {
      setError('Mohon setujui kebijakan & syarat penginapan sebelum melanjutkan.');
      return;
    }

    setSubmitting(true);

    try {
      // Simpan pembaruan nama, phone & alamat ke session dan profile backend
      const currentUser = getGuestUser() || {};
      const updatedUser = {
        ...currentUser,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || currentUser.email,
        address: address.trim(),
      };
      const token = getGuestToken();
      if (token) {
        setGuestSession(token, updatedUser);
        void updateGuestProfile({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }).catch(() => {});
      }

      const addons = Object.entries(draft.selectedAddons)
        .filter(([, qty]) => qty > 0)
        .map(([addonId, quantity]) => ({ addonId, quantity }));

      const orderPayload = {
        campsiteId: draft.campsite.id,
        paymentMethod: 'TRANSFER' as const,
        isDownPayment: isDP,
        items: [
          {
            blockId: draft.spot.id,
            pricingPackageId: draft.selectedPackage.id,
            checkIn: draft.checkInDate,
            checkOut: draft.checkOutDate,
            adultCount: draft.guestCount,
            addons,
          },
        ],
      };

      // 1. Buat pesanan riil di backend
      const createdOrder = await createRealOrder(orderPayload);
      if (!createdOrder?.id) {
        throw new Error('Gagal membuat pesanan di server.');
      }

      // 2. Inisiasi pembayaran Xendit
      const paymentInit = await initiateOrderPayment(createdOrder.id);
      const xenditPaymentUrl =
        paymentInit?.snapRedirectUrl ||
        paymentInit?.redirectUrl ||
        paymentInit?.invoiceUrl;

      if (!xenditPaymentUrl) {
        throw new Error('Gagal mendapatkan URL invoice pembayaran Xendit.');
      }

      // Hapus draft checkout dari session
      sessionStorage.removeItem('embun_checkout_draft');

      // Buka Xendit di tab baru
      initiateXenditPayment(xenditPaymentUrl);

      // Best effort sync & redirect ke halaman detail pesanan
      await syncOrderStatus(createdOrder.id).catch(() => {});
      router.push(`/orders/detail?id=${createdOrder.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      if (err instanceof ApiError && err.status === 401) {
        clearGuestSession();
        setError('Sesi login telah berakhir. Silakan masuk kembali.');
      } else {
        setError(err.message || 'Gagal memproses pesanan.');
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-foreground">
      {/* Header Sticky */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer"
              aria-label="Kembali"
            >
              <ArrowLeft size={20} className="stroke-[2.2]" />
            </button>
            <h1 className="font-bold text-base text-foreground tracking-tight">
              Tinjau & Konfirmasi Pemesanan
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full font-semibold">
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">Pemesanan Terlindungi</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ════════════════════════════════════════════════════════════════
              KOLOM KIRI: FORM & DATA PEMESANAN (AIRBNB STYLE)
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Perjalanan Anda */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-foreground">Perjalanan Anda</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-surface/70 border border-border/60 space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                    <Calendar size={13} className="text-brand-blue" /> Tanggal
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {formatDateDisplay(draft.checkInDate)} – {formatDateDisplay(draft.checkOutDate)}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    Durasi: <strong>{draft.nights} Malam</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-surface/70 border border-border/60 space-y-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-foreground-muted flex items-center gap-1">
                    <Users size={13} className="text-brand-blue" /> Tamu
                  </span>
                  <p className="font-bold text-foreground text-sm">
                    {draft.guestCount} Orang
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    {draft.spot.name} · {draft.selectedPackage.name}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Data Pemesan */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-foreground">Data Kontak Tamu</h2>
                <span className="text-[11px] text-foreground-muted">E-tiket dikirim ke sini</span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1 text-[11px]">
                    Nama Lengkap Pemesan *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama sesuai KTP"
                    className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue focus:outline-hidden text-sm bg-surface/40 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-foreground mb-1 text-[11px]">
                      Nomor WhatsApp / HP *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue focus:outline-hidden text-sm bg-surface/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-foreground mb-1 text-[11px]">
                      Email (Opsional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue focus:outline-hidden text-sm bg-surface/40 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1 text-[11px]">
                    Alamat / Kota Asal Pemesan *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Contoh: Jl. Dago No. 12, Bandung"
                    className="w-full px-4 py-3 rounded-2xl border border-border focus:border-brand-blue focus:outline-hidden text-sm bg-surface/40 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pilihan Skema Pembayaran */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-extrabold text-foreground">Pilihan Pembayaran</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Bayar Penuh */}
                <button
                  type="button"
                  onClick={() => setPaymentScheme('FULL')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    !isDP
                      ? 'border-brand-blue bg-brand-blue/5 shadow-2xs ring-1 ring-brand-blue'
                      : 'border-border bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">Bayar Lunas</span>
                    {!isDP && <CheckCircle2 size={16} className="text-brand-blue" />}
                  </div>
                  <div>
                    <p className="text-base font-black text-brand-blue">
                      {rupiah(draft.grandTotal)}
                    </p>
                  </div>
                </button>

                {/* DP 50% */}
                <button
                  type="button"
                  onClick={() => setPaymentScheme('DP_50')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isDP
                      ? 'border-amber-500 bg-amber-50/70 shadow-2xs ring-1 ring-amber-500'
                      : 'border-border bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900">Uang Muka (DP 50%)</span>
                    {isDP && <CheckCircle2 size={16} className="text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-base font-black text-amber-800">
                      {rupiah(dpAmount + draft.totalServiceAndTaxFee)}
                    </p>
                    <span className="text-[10.5px] text-amber-800/80">
                      Sisa {rupiah(remainingBalance)} dilunasi H-1
                    </span>
                  </div>
                </button>
              </div>

              {isDP && (
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
                  <Info size={15} className="shrink-0 mt-0.5 text-amber-700" />
                  <span>
                    Anda hanya membayar <strong>{rupiah(currentPayable)}</strong> saat ini. Sisa tagihan
                    sebesar <strong>{rupiah(remainingBalance)}</strong> wajib dilunasi melalui aplikasi
                    Embun paling lambat H-1 sebelum tanggal check-in.
                  </span>
                </div>
              )}
            </div>

            {/* 4. Aturan & Kebijakan Campsite */}
            <div className="bg-white rounded-3xl border border-border p-6 shadow-2xs space-y-3.5">
              <h2 className="text-base font-extrabold text-foreground">Kebijakan Penginapan</h2>

              <ul className="space-y-2 text-xs text-foreground-muted leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                  <span>
                    <strong>Waktu Check-In & Check-Out:</strong> Check-in mulai pukul{' '}
                    {draft.campsite.checkInTime || '14:00'} WIB, check-out maksimal pukul{' '}
                    {draft.campsite.checkOutTime || '12:00'} WIB.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                  <span>
                    <strong>Kebijakan Ubah Jadwal:</strong> Reschedule dapat diajukan minimal H-7
                    sebelum tanggal check-in untuk pesanan yang telah lunas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0 mt-1.5" />
                  <span>
                    <strong>Pembayaran Resmi:</strong> Seluruh pembayaran hanya dilakukan melalui
                    sistem resmi Embun (Xendit). Tidak ada pembayaran di luar aplikasi.
                  </span>
                </li>
              </ul>

              <div className="pt-2 border-t border-border/70">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-blue border-border focus:ring-brand-blue"
                  />
                  <span>Saya telah membaca dan menyetujui seluruh aturan di atas</span>
                </label>
              </div>
            </div>

            {/* Tombol Konfirmasi Final */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={submitting || !agreed}
                className="w-full py-4 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                <span>
                  {submitting
                    ? 'Menghubungkan ke Xendit...'
                    : `Konfirmasi & Bayar via Xendit · ${rupiah(currentPayable)}`}
                </span>
              </button>
              <p className="text-[11px] text-center text-foreground-muted mt-2">
                Halaman pembayaran aman Xendit akan terbuka otomatis setelah konfirmasi.
              </p>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              KOLOM KANAN: STICKY ORDER SUMMARY (AIRBNB STYLE)
          ════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl border border-border p-6 shadow-2xs space-y-5">
              {/* Unit Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-border/70">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface border border-border shrink-0">
                  {draft.campsite.photoUrl ? (
                    <img
                      src={resolveAssetUrl(draft.campsite.photoUrl)}
                      alt={draft.campsite.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                      <Tent size={24} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-brand-blue/8 px-2 py-0.5 rounded-full">
                    {draft.campsite.name}
                  </span>
                  <h3 className="font-extrabold text-base text-foreground truncate">
                    {draft.spot.name}
                  </h3>
                  <p className="text-xs text-foreground-muted truncate">
                    {draft.selectedPackage.name} · {draft.campsite.city || draft.campsite.address}
                  </p>
                </div>
              </div>

              {/* Rincian Harga */}
              <div className="space-y-3 text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
                  Rincian Harga
                </h4>

                <div className="flex justify-between">
                  <span className="text-foreground-muted">
                    {draft.selectedPackage.name} ({rupiah(draft.spotPricePerNight)} × {draft.nights} malam)
                  </span>
                  <span className="font-semibold text-foreground">
                    {rupiah(draft.spotPricePerNight * draft.nights)}
                  </span>
                </div>

                {draft.activeAddonsList.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-border/50">
                    <span className="text-[11px] font-semibold text-foreground-muted block">
                      Perlengkapan Tambahan:
                    </span>
                    {draft.activeAddonsList.map((addon) => (
                      <div key={addon.id} className="flex justify-between text-[11.5px] pl-2">
                        <span className="text-foreground-muted">
                          {addon.name} × {addon.qty}
                        </span>
                        <span className="font-medium text-foreground">
                          {rupiah(addon.price * addon.qty)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="text-foreground-muted">Biaya Layanan & Pajak</span>
                  <span className="font-semibold text-foreground">
                    {rupiah(draft.totalServiceAndTaxFee)}
                  </span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-sm">
                  <span className="font-extrabold text-foreground">Total Tagihan</span>
                  <span className="text-lg font-black text-brand-blue">
                    {rupiah(draft.grandTotal)}
                  </span>
                </div>

                {/* Sisa jika DP */}
                {isDP && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-amber-900 font-bold">
                      <span>Dibayar Sekarang (DP 50% + Fee)</span>
                      <span>{rupiah(currentPayable)}</span>
                    </div>
                    <div className="flex justify-between text-amber-800/80 text-[11px]">
                      <span>Sisa Pelunasan di H-1</span>
                      <span>{rupiah(remainingBalance)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure guarantee */}
              <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-foreground-muted">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Transaksi dienkripsi dan diproses resmi oleh Xendit</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
