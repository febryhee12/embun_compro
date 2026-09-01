'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  IdCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-client';

type FormState = {
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  ktpNumber: string;
  ownerAddress: string;
  campsiteName: string;
  campsiteType: string;
  campsitePhone: string;
  campsiteEmail: string;
  instagramUrl: string;
  tiktokUrl: string;
  websiteUrl: string;
  province: string;
  city: string;
  district: string;
  campsiteAddress: string;
  googleMapsUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
};

const initialForm: FormState = {
  ownerName: '',
  email: '',
  phone: '',
  password: '',
  ktpNumber: '',
  ownerAddress: '',
  campsiteName: '',
  campsiteType: '',
  campsitePhone: '',
  campsiteEmail: '',
  instagramUrl: '',
  tiktokUrl: '',
  websiteUrl: '',
  province: '',
  city: '',
  district: '',
  campsiteAddress: '',
  googleMapsUrl: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountHolder: '',
};

const steps = [
  { id: 0, title: 'Akun Pemilik', short: 'Akun' },
  { id: 1, title: 'Identitas & KTP', short: 'Identitas' },
  { id: 2, title: 'Tempat Camp', short: 'Campsite' },
  { id: 3, title: 'Lokasi & Peta', short: 'Lokasi' },
  { id: 4, title: 'Rekening Payout', short: 'Rekening' },
] as const;

const statusBadgeConfig: Record<string, { label: string; bg: string; text: string; border: string; desc: string }> = {
  PENDING_REVIEW: {
    label: 'Menunggu Verifikasi Tim',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    desc: 'Pengajuan Anda sedang ditinjau oleh tim kurasi Embun. Estimasi proses 1-2 hari kerja.',
  },
  NEEDS_REVISION: {
    label: 'Perlu Dilengkapi / Revisi',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    desc: 'Ada beberapa data yang perlu diperjelas atau dilengkapi sebelum kemitraan disetujui.',
  },
  APPROVED: {
    label: 'Pendaftaran Disetujui',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    desc: 'Selamat! Akun Anda telah disetujui. Tim operasional Embun akan menghubungi Anda untuk akses backoffice.',
  },
  REJECTED: {
    label: 'Pengajuan Belum Sesuai',
    bg: 'bg-neutral-100',
    text: 'text-neutral-700',
    border: 'border-neutral-200',
    desc: 'Mohon maaf, saat ini lokasi atau data properti belum memenuhi kriteria kemitraan Embun.',
  },
};

type PartnerApplicationResult = Pick<
  FormState,
  'email' | 'ownerName' | 'campsiteName' | 'province' | 'city'
> & {
  id: string;
  status: string;
  reviewNote?: string | null;
  createdAt?: string;
};

export default function MitraRegisterPage() {
  const [mode, setMode] = useState<'register' | 'status'>('register');
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [ktpPhoto, setKtpPhoto] = useState<File | null>(null);
  const [ktpPreviewUrl, setKtpPreviewUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PartnerApplicationResult | null>(null);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleKtpChange = (file: File | null) => {
    setKtpPhoto(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setKtpPreviewUrl(url);
    } else {
      setKtpPreviewUrl(null);
    }
  };

  // Validasi ketat per step
  const isStepValid = useMemo(() => {
    switch (step) {
      case 0:
        return (
          form.ownerName.trim().length >= 3 &&
          form.email.trim().includes('@') &&
          form.phone.trim().length >= 9 &&
          form.password.length >= 8
        );
      case 1:
        return (
          form.ktpNumber.trim().length >= 16 &&
          form.ownerAddress.trim().length >= 5 &&
          ktpPhoto !== null
        );
      case 2:
        return form.campsiteName.trim().length >= 3;
      case 3:
        return (
          form.province.trim().length >= 2 &&
          form.city.trim().length >= 2 &&
          form.campsiteAddress.trim().length >= 8
        );
      case 4:
        return (
          form.bankName.trim().length >= 2 &&
          form.bankAccountNumber.trim().length >= 4 &&
          form.bankAccountHolder.trim().length >= 3
        );
      default:
        return false;
    }
  }, [step, form, ktpPhoto]);

  const handleNextStep = () => {
    if (!isStepValid) return;
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
    setStep((s) => Math.min(steps.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep = (targetIndex: number) => {
    // Hanya izinkan navigasi mundur atau ke step yang sudah pernah diselesaikan
    if (targetIndex <= step || completedSteps.includes(targetIndex - 1)) {
      setStep(targetIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = async () => {
    if (!isStepValid) return;
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (ktpPhoto) data.append('ktpPhoto', ktpPhoto);
      const res = await fetch(`${API_BASE_URL}/partner-applications`, {
        method: 'POST',
        body: data,
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'Pendaftaran gagal dikirim. Periksa kembali kelengkapan data.');
      }
      setResult(body);
      setMode('status');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err?.message || 'Terjadi gangguan jaringan saat mengirim pendaftaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    if (!login.email || !login.password) {
      setError('Masukkan email dan password pendaftaran Anda.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/partner-applications/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.message || 'Email atau password tidak terdaftar.');
      }
      setResult(body);
    } catch (err: any) {
      setError(err?.message || 'Email atau password tidak sesuai.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#191919] font-sans antialiased selection:bg-[#CEFB0A] selection:text-[#191919]">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[460px_1fr] xl:grid-cols-[500px_1fr]">
        
        {/* ── LEFT HERO BRANDING PANEL ──────────────────────────────────────── */}
        <aside className="relative flex flex-col justify-between bg-[#18181B] text-white p-8 sm:p-12 lg:p-14 overflow-hidden border-r border-neutral-800">
          {/* Top Logo */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/images/logo/model1_white.svg"
                alt="Embun"
                width={138}
                height={31}
                unoptimized
                priority
              />
            </Link>

            {/* Main Hero Header */}
            <div className="mt-12 space-y-3">
              <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-bold leading-snug tracking-tight text-white">
                Kelola dan pasarkan campsite Anda bersama Embun.
              </h1>

              <p className="text-sm leading-relaxed text-neutral-400">
                Daftarkan properti camping atau glamping Anda untuk menjangkau wisatawan, mengatur jadwal ketersediaan spot, dan memantau transaksi dalam satu tempat.
              </p>
            </div>

            {/* Value Highlights */}
            <div className="mt-10 space-y-5 border-t border-neutral-800/80 pt-8">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">01. Reservasi Online</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Terima dan kelola pemesanan langsung dari calon pengunjung melalui aplikasi.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">02. Manajemen Ketersediaan</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Atur kalender booking, ketersediaan kavling, dan jadwal operasional spot.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">03. Pembayaran & Payout</div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Laporan transaksi tercatat otomatis dan dana dapat dicairkan langsung ke rekening bank.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge & Legal Entity */}
          <div className="relative z-10 mt-10 pt-6 border-t border-neutral-800/80 text-xs text-neutral-400 space-y-2">
            <p>Pendaftaran tidak dipungut biaya. Tim Embun akan meninjau kelengkapan data dalam 1–2 hari kerja.</p>
            <p className="text-[11px] text-neutral-400">
              © {new Date().getFullYear()} Embun | PT Alam Kelana Digital. Seluruh hak cipta dilindungi.
            </p>
          </div>
        </aside>

        {/* ── RIGHT MAIN FORM CONTAINER ────────────────────────────────────── */}
        <main className="flex flex-col justify-start p-6 sm:p-10 lg:p-14 xl:p-16 max-w-4xl w-full mx-auto">
          
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#E5E7EB]">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#191919]">
                {mode === 'register' ? 'Formulir Pendaftaran Mitra' : 'Pantau Status Pengajuan'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {mode === 'register'
                  ? 'Lengkapi data awal properti Anda untuk proses verifikasi kurasi.'
                  : 'Cek perkembangan status review berkas pendaftaran yang telah dikirim.'}
              </p>
            </div>

            <div className="inline-flex p-1 rounded-xl bg-[#E5E7EB]/60 border border-[#E5E7EB] self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-[#0841B5] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Daftar Baru
              </button>
              <button
                type="button"
                onClick={() => setMode('status')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'status'
                    ? 'bg-white text-[#0841B5] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Cek Status
              </button>
            </div>
          </div>

          {/* ── MODE: CHECK STATUS ────────────────────────────────────────── */}
          {mode === 'status' ? (
            <div className="mt-8 space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E5E7EB] shadow-xs space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#191919]">Masuk untuk Cek Status</h3>
                  <p className="text-xs text-neutral-500">
                    Gunakan email dan password yang Anda buat saat pertama kali mengisi form pendaftaran.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type="email"
                        value={login.email}
                        onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))}
                        placeholder="owner@domain.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={login.password}
                        onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={checkStatus}
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>Periksa Status Pengajuan</span>
                </button>
              </div>

              {/* Status Display Card */}
              {result && (
                <div className="bg-white rounded-3xl p-7 sm:p-9 border border-[#E5E7EB] shadow-xs space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Properti</span>
                      <h4 className="text-xl font-black text-[#191919]">{result.campsiteName}</h4>
                      <p className="text-xs text-neutral-500 mt-0.5">{result.city}, {result.province} • a.n. {result.ownerName}</p>
                    </div>

                    <div className="self-start sm:self-auto">
                      {(() => {
                        const conf = statusBadgeConfig[result.status] || {
                          label: result.status,
                          bg: 'bg-neutral-100',
                          text: 'text-neutral-700',
                          border: 'border-neutral-200',
                          desc: '',
                        };
                        return (
                          <div className={`px-4 py-2 rounded-xl border font-bold text-xs ${conf.bg} ${conf.text} ${conf.border}`}>
                            {conf.label}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F4F7F6] border border-[#E5E7EB] text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {statusBadgeConfig[result.status]?.desc || 'Status pengajuan Anda tercatat pada sistem Embun.'}
                  </div>

                  {result.reviewNote && (
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                        Catatan dari Tim Reviewer Embun:
                      </span>
                      <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                        {result.reviewNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ── MODE: REGISTER STEPPER FORM ──────────────────────────────── */
            <div className="mt-8 space-y-8 animate-in fade-in duration-200">
              
              {/* Stepper Progress Bar (Clean, non-skippable forward) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
                <div className="grid grid-cols-5 gap-2 sm:gap-4">
                  {steps.map((item, index) => {
                    const isCurrent = index === step;
                    const isDone = completedSteps.includes(index);
                    const canNavigate = index <= step || completedSteps.includes(index - 1);
                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => handleGoToStep(index)}
                        disabled={!canNavigate}
                        className={`group relative flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-[#0841B5]/5 text-[#0841B5]'
                            : isDone
                            ? 'text-[#0841B5] hover:bg-neutral-50 cursor-pointer'
                            : 'text-neutral-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {/* Step Number / Status Indicator */}
                        <div
                          className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                            isCurrent
                              ? 'bg-[#0841B5] text-white shadow-xs'
                              : isDone
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-[#F4F7F6] text-neutral-500 border border-[#E5E7EB]'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span>{index + 1}</span>}
                        </div>

                        {/* Step Title Label */}
                        <span className="hidden sm:block text-[11px] font-bold truncate max-w-full">
                          {item.title}
                        </span>
                        <span className="sm:hidden text-[10px] font-bold truncate max-w-full">
                          {item.short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step Card Container */}
              <div className="bg-white rounded-3xl p-7 sm:p-10 border border-[#E5E7EB] shadow-xs space-y-8">
                
                {/* ── STEP 0: AKUN PEMILIK ─────────────────────────────────── */}
                {step === 0 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 1 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Informasi Akun Pemilik</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Data penanggung jawab utama untuk komunikasi, login, dan pemantauan reservasi.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nama Lengkap Pemilik / PIC <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={form.ownerName}
                            onChange={(e) => update('ownerName', e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Alamat Email Aktif <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="email"
                              required
                              value={form.email}
                              onChange={(e) => update('email', e.target.value)}
                              placeholder="nama@email.com"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">Dipakai untuk menerima notifikasi status pengajuan.</p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Nomor WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="tel"
                              required
                              value={form.phone}
                              onChange={(e) => update('phone', e.target.value)}
                              placeholder="081234567890"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-neutral-400 mt-1">Untuk koordinasi verifikasi dan survei lokasi.</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Kata Sandi / Password Akun <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={form.password}
                            onChange={(e) => update('password', e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="w-full pl-10 pr-11 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">Disimpan terenkripsi aman untuk akses login Anda.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 1: IDENTITAS & KTP ──────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 2 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Verifikasi Identitas Owner</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Data legalitas diperlukan untuk menjamin keamanan transaksi dan perjanjian kemitraan resmi.
                      </p>
                    </div>

                    <div className="space-y-5 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nomor Induk Kependudukan (NIK) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            maxLength={16}
                            value={form.ktpNumber}
                            onChange={(e) => update('ktpNumber', e.target.value.replace(/\D/g, ''))}
                            placeholder="16 digit nomor KTP"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Custom Modern File Upload Box */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Unggah Foto KTP Asli <span className="text-red-500">*</span>
                        </label>

                        {!ktpPreviewUrl ? (
                          <label className="group relative flex flex-col items-center justify-center p-7 sm:p-9 border-2 border-dashed border-[#E5E7EB] hover:border-[#0841B5] rounded-2xl bg-[#F4F7F6]/60 hover:bg-[#0841B5]/5 transition-all cursor-pointer text-center">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="sr-only"
                              onChange={(e) => handleKtpChange(e.target.files?.[0] || null)}
                            />
                            <div className="h-12 w-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-center text-[#0841B5] group-hover:scale-110 transition-all mb-3">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <span className="text-sm font-bold text-[#191919] group-hover:text-[#0841B5] transition-colors">
                              Klik untuk pilih foto KTP
                            </span>
                            <span className="text-xs text-neutral-400 mt-1">
                              Format JPG, PNG, atau WebP (Maksimal 10MB). Pastikan teks & foto terbaca jelas.
                            </span>
                          </label>
                        ) : (
                          <div className="relative p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="h-14 w-20 rounded-xl overflow-hidden bg-neutral-100 border border-emerald-200 shrink-0">
                                <img src={ktpPreviewUrl} alt="Preview KTP" className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Foto KTP Terlampir
                                </div>
                                <p className="text-xs text-neutral-500 truncate max-w-xs mt-0.5">
                                  {ktpPhoto?.name || 'ktp_file.jpg'}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleKtpChange(null)}
                              className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-white border border-transparent hover:border-red-200 transition-all cursor-pointer"
                              title="Hapus / Ganti Foto"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Alamat Lengkap Sesuai KTP <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={form.ownerAddress}
                          onChange={(e) => update('ownerAddress', e.target.value)}
                          placeholder="Alamat domisili lengkap pemilik / PIC"
                          className="w-full p-3.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all resize-y"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: INFORMASI CAMPSITE ───────────────────────────── */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 3 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Profil Tempat Camp</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Nama dan identitas publik properti yang akan dilihat oleh calon wisatawan.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nama Campsite / Glamping <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={form.campsiteName}
                            onChange={(e) => update('campsiteName', e.target.value)}
                            placeholder="Contoh: Embun Riverside Camp & Glamping"
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Tipe Properti (Opsional)
                        </label>
                        <input
                          type="text"
                          value={form.campsiteType}
                          onChange={(e) => update('campsiteType', e.target.value)}
                          placeholder="Misal: Riverside Camp, Luxury Glamping, Campervan Park, Cabin"
                          className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Telepon Operasional Camp (Opsional)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="tel"
                              value={form.campsitePhone}
                              onChange={(e) => update('campsitePhone', e.target.value)}
                              placeholder="Nomor kontak resepsionis"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Email Bisnis Camp (Opsional)
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="email"
                              value={form.campsiteEmail}
                              onChange={(e) => update('campsiteEmail', e.target.value)}
                              placeholder="info@campsite.com"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                        <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                          Tautan Media Sosial (Membantu Tim Verifikasi Lokasi)
                        </span>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                            </svg>
                            <input
                              type="text"
                              value={form.instagramUrl}
                              onChange={(e) => update('instagramUrl', e.target.value)}
                              placeholder="Instagram (@username)"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-xs focus:bg-white focus:border-[#0841B5] outline-none transition-all"
                            />
                          </div>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">TT</span>
                            <input
                              type="text"
                              value={form.tiktokUrl}
                              onChange={(e) => update('tiktokUrl', e.target.value)}
                              placeholder="TikTok (@username)"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-xs focus:bg-white focus:border-[#0841B5] outline-none transition-all"
                            />
                          </div>

                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              value={form.websiteUrl}
                              onChange={(e) => update('websiteUrl', e.target.value)}
                              placeholder="Website (https://...)"
                              className="w-full pl-9 pr-3 py-2.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-xs focus:bg-white focus:border-[#0841B5] outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: LOKASI CAMPSITE ──────────────────────────────── */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 4 dari 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Lokasi & Titik Peta</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Alamat spesifik agar mempermudah pemetaan lokasi dan panduan rute bagi calon tamu.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Provinsi <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={form.province}
                            onChange={(e) => update('province', e.target.value)}
                            placeholder="Contoh: Jawa Barat"
                            className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Kota / Kabupaten <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={form.city}
                            onChange={(e) => update('city', e.target.value)}
                            placeholder="Contoh: Bogor / Megamendung"
                            className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Kecamatan / Area (Opsional)
                        </label>
                        <input
                          type="text"
                          value={form.district}
                          onChange={(e) => update('district', e.target.value)}
                          placeholder="Contoh: Babakan Madang"
                          className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Alamat Lengkap Campsite <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={form.campsiteAddress}
                          onChange={(e) => update('campsiteAddress', e.target.value)}
                          placeholder="Nama jalan, nomor/patokan jalan, desa, dan area sekitar"
                          className="w-full p-3.5 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Link Google Maps (Opsional)
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            type="url"
                            value={form.googleMapsUrl}
                            onChange={(e) => update('googleMapsUrl', e.target.value)}
                            placeholder="https://maps.app.goo.gl/..."
                            className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: REKENING PENCAIRAN DANA ──────────────────────── */}
                {step === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0841B5] uppercase tracking-wider">
                        <span>Langkah 5 dari 5 (Terakhir)</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#191919]">Rekening Pencairan Dana (Payout)</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Hasil reservasi tamu akan ditransfer secara otomatis dan aman ke rekening bank terdaftar ini.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Nama Bank <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.bankName}
                          onChange={(e) => update('bankName', e.target.value)}
                          placeholder="BCA / Mandiri / BNI / BRI / CIMB Niaga"
                          className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Nomor Rekening <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              required
                              value={form.bankAccountNumber}
                              onChange={(e) => update('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                              placeholder="Contoh: 1234567890"
                              className="w-full pl-10 pr-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Nama Pemilik Rekening <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={form.bankAccountHolder}
                            onChange={(e) => update('bankAccountHolder', e.target.value)}
                            placeholder="Sesuai buku tabungan"
                            className="w-full px-4 py-3 bg-[#F4F7F6] border border-[#E5E7EB] rounded-xl text-sm focus:bg-white focus:border-[#0841B5] focus:ring-2 focus:ring-[#0841B5]/20 outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 leading-relaxed mt-2 flex items-start gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-[#0841B5] shrink-0 mt-0.5" />
                        <span>
                          Pastikan nama pemilik rekening sesuai dengan identitas pengelola/badan usaha untuk mempercepat proses persetujuan verifikasi keuangan.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold">
                    {error}
                  </div>
                )}

                {/* Stepper Footer Controls */}
                <div className="flex items-center justify-between gap-4 pt-6 border-t border-[#E5E7EB]">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-6 py-3 rounded-xl border border-[#E5E7EB] text-xs sm:text-sm font-bold text-neutral-600 hover:bg-[#F4F7F6] hover:text-neutral-900 transition-all cursor-pointer"
                    >
                      Kembali
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      disabled={!isStepValid}
                      onClick={handleNextStep}
                      className="px-7 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Lanjut ke {steps[step + 1].title}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!isStepValid || submitting}
                      onClick={submit}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#0841B5] hover:bg-[#0841B5]/90 text-white text-xs sm:text-sm font-bold shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>Kirim Pendaftaran Mitra</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer with Logo & PT Alam Kelana Digital */}
          <footer className="mt-14 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <div className="flex items-center gap-2.5">
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="/images/logo/model1_blue.svg"
                  alt="Embun"
                  width={96}
                  height={22}
                  unoptimized
                />
              </Link>
              <span className="text-neutral-300">|</span>
              <span className="font-medium text-neutral-600">PT Alam Kelana Digital</span>
            </div>
            <p className="text-neutral-400">
              © {new Date().getFullYear()} Embun. Seluruh hak cipta dilindungi.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
