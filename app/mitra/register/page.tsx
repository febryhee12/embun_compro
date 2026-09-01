'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FileImage,
  Loader2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  UserRound,
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
  { title: 'Akun', icon: UserRound },
  { title: 'Identitas', icon: FileImage },
  { title: 'Campsite', icon: Building2 },
  { title: 'Lokasi', icon: MapPin },
  { title: 'Rekening', icon: BadgeCheck },
] as const;

const statusLabel: Record<string, string> = {
  PENDING_REVIEW: 'Menunggu review Embun',
  NEEDS_REVISION: 'Perlu dilengkapi',
  APPROVED: 'Disetujui',
  REJECTED: 'Belum dapat dilanjutkan',
};

type PartnerApplicationResult = Pick<
  FormState,
  'email' | 'ownerName' | 'campsiteName' | 'province' | 'city'
> & {
  id: string;
  status: string;
  reviewNote?: string | null;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function MitraRegisterPage() {
  const [mode, setMode] = useState<'register' | 'status'>('register');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [ktpPhoto, setKtpPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PartnerApplicationResult | null>(null);
  const [error, setError] = useState('');
  const [login, setLogin] = useState({ email: '', password: '' });

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requiredForStep = useMemo(() => {
    if (step === 0) return ['ownerName', 'email', 'phone', 'password'] as const;
    if (step === 1) return ['ktpNumber', 'ownerAddress'] as const;
    if (step === 2) return ['campsiteName'] as const;
    if (step === 3) return ['province', 'city', 'campsiteAddress'] as const;
    return ['bankName', 'bankAccountNumber', 'bankAccountHolder'] as const;
  }, [step]);

  const canContinue =
    requiredForStep.every((key) => form[key].trim()) &&
    (step !== 1 || ktpPhoto);

  const submit = async () => {
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
      if (!res.ok)
        throw new Error(body.message || 'Pendaftaran gagal dikirim.');
      setResult(body);
      setMode('status');
    } catch (err) {
      setError(errorMessage(err, 'Pendaftaran gagal dikirim.'));
    } finally {
      setSubmitting(false);
    }
  };

  const checkStatus = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/partner-applications/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Login gagal.');
      setResult(body);
    } catch (err) {
      setError(errorMessage(err, 'Email atau password tidak sesuai.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8f4] text-brand-black">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="flex flex-col justify-between bg-brand-black p-8 text-white lg:p-12">
          <div>
            <Link
              href="/id"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Embun
            </Link>
            <div className="mt-14 max-w-xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-lime">
                Onboarding Mitra
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                Daftarkan campsite untuk direview Embun.
              </h1>
              <p className="mt-5 text-base leading-7 text-white/70">
                Form ini hanya untuk data awal. Tim Embun tetap akan menghubungi
                dan melakukan pengecekan lokasi sebelum akses app.embun.app
                diberikan.
              </p>
            </div>
          </div>
          <div className="mt-12 grid gap-3 text-sm text-white/72">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-brand-lime" /> Data masuk ke
              panel review Super Admin.
            </div>
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-brand-lime" /> Foto KTP
              disimpan di storage Embun.
            </div>
          </div>
        </aside>

        <section className="p-5 sm:p-8 lg:p-12">
          <div className="mb-5 inline-flex rounded-md border border-border bg-white p-1">
            <button
              className={`rounded px-4 py-2 text-sm font-bold ${mode === 'register' ? 'bg-brand-blue text-white' : 'text-foreground-muted'}`}
              onClick={() => setMode('register')}
            >
              Daftar Baru
            </button>
            <button
              className={`rounded px-4 py-2 text-sm font-bold ${mode === 'status' ? 'bg-brand-blue text-white' : 'text-foreground-muted'}`}
              onClick={() => setMode('status')}
            >
              Cek Status
            </button>
          </div>

          {mode === 'status' ? (
            <StatusPanel
              login={login}
              setLogin={setLogin}
              result={result}
              error={error}
              submitting={submitting}
              checkStatus={checkStatus}
            />
          ) : (
            <div className="rounded-md border border-border bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex flex-wrap gap-2">
                {steps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      onClick={() => setStep(index)}
                      className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold ${index === step ? 'border-brand-blue bg-brand-blue text-white' : 'border-border bg-white text-foreground-muted'}`}
                    >
                      <Icon className="h-4 w-4" /> {index + 1}. {item.title}
                    </button>
                  );
                })}
              </div>

              {step === 0 && (
                <Step title="Akun Mitra">
                  <Field
                    label="Nama lengkap"
                    value={form.ownerName}
                    onChange={(v) => update('ownerName', v)}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => update('email', v)}
                  />
                  <Field
                    label="Nomor WhatsApp"
                    value={form.phone}
                    onChange={(v) => update('phone', v)}
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(v) => update('password', v)}
                    helper="Minimal 8 karakter."
                  />
                </Step>
              )}
              {step === 1 && (
                <Step title="Identitas Owner">
                  <Field
                    label="Nomor KTP / NIK"
                    value={form.ktpNumber}
                    onChange={(v) => update('ktpNumber', v)}
                  />
                  <label className="block text-sm font-bold">
                    Foto KTP
                    <input
                      className="mt-2 block w-full rounded-md border border-border bg-white p-3 text-sm"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setKtpPhoto(e.target.files?.[0] || null)}
                    />
                  </label>
                  <Field
                    label="Alamat sesuai KTP"
                    value={form.ownerAddress}
                    onChange={(v) => update('ownerAddress', v)}
                    textarea
                  />
                </Step>
              )}
              {step === 2 && (
                <Step title="Informasi Campsite">
                  <Field
                    label="Nama campsite"
                    value={form.campsiteName}
                    onChange={(v) => update('campsiteName', v)}
                  />
                  <Field
                    label="Tipe properti (opsional)"
                    value={form.campsiteType}
                    onChange={(v) => update('campsiteType', v)}
                    placeholder="Camping ground, glamping, cabin"
                  />
                  <Field
                    label="Nomor telepon campsite (opsional)"
                    value={form.campsitePhone}
                    onChange={(v) => update('campsitePhone', v)}
                  />
                  <Field
                    label="Email bisnis (opsional)"
                    value={form.campsiteEmail}
                    onChange={(v) => update('campsiteEmail', v)}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field
                      label="Instagram (opsional)"
                      value={form.instagramUrl}
                      onChange={(v) => update('instagramUrl', v)}
                    />
                    <Field
                      label="TikTok (opsional)"
                      value={form.tiktokUrl}
                      onChange={(v) => update('tiktokUrl', v)}
                    />
                    <Field
                      label="Website (opsional)"
                      value={form.websiteUrl}
                      onChange={(v) => update('websiteUrl', v)}
                    />
                  </div>
                </Step>
              )}
              {step === 3 && (
                <Step title="Lokasi Campsite">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Provinsi"
                      value={form.province}
                      onChange={(v) => update('province', v)}
                    />
                    <Field
                      label="Kota / Kabupaten"
                      value={form.city}
                      onChange={(v) => update('city', v)}
                    />
                  </div>
                  <Field
                    label="Kecamatan (opsional)"
                    value={form.district}
                    onChange={(v) => update('district', v)}
                  />
                  <Field
                    label="Alamat campsite"
                    value={form.campsiteAddress}
                    onChange={(v) => update('campsiteAddress', v)}
                    textarea
                  />
                  <Field
                    label="Link Google Maps (opsional)"
                    value={form.googleMapsUrl}
                    onChange={(v) => update('googleMapsUrl', v)}
                  />
                </Step>
              )}
              {step === 4 && (
                <Step title="Rekening Bank">
                  <Field
                    label="Nama bank"
                    value={form.bankName}
                    onChange={(v) => update('bankName', v)}
                  />
                  <Field
                    label="Nomor rekening"
                    value={form.bankAccountNumber}
                    onChange={(v) => update('bankAccountNumber', v)}
                  />
                  <Field
                    label="Nama pemilik rekening"
                    value={form.bankAccountHolder}
                    onChange={(v) => update('bankAccountHolder', v)}
                  />
                </Step>
              )}

              {error && (
                <p className="mt-4 text-sm font-semibold text-error">{error}</p>
              )}
              <div className="mt-7 flex items-center justify-between gap-3 border-t border-border pt-5">
                <button
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-bold disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" /> Sebelumnya
                </button>
                {step < steps.length - 1 ? (
                  <button
                    disabled={!canContinue}
                    onClick={() => setStep((s) => s + 1)}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-blue px-5 text-sm font-bold text-white disabled:opacity-40"
                  >
                    Lanjut <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    disabled={!canContinue || submitting}
                    onClick={submit}
                    className="inline-flex h-11 items-center gap-2 rounded-md bg-brand-blue px-5 text-sm font-bold text-white disabled:opacity-40"
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}{' '}
                    Kirim Pendaftaran
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatusPanel({
  login,
  setLogin,
  result,
  error,
  submitting,
  checkStatus,
}: {
  login: { email: string; password: string };
  setLogin: React.Dispatch<
    React.SetStateAction<{ email: string; password: string }>
  >;
  result: PartnerApplicationResult | null;
  error: string;
  submitting: boolean;
  checkStatus: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black">Status Pendaftaran</h2>
      <p className="mt-1 text-sm text-foreground-muted">
        Login dengan email dan password yang dipakai saat daftar.
      </p>
      <div className="mt-6 grid gap-4">
        <Field
          label="Email"
          value={login.email}
          onChange={(v) => setLogin((p) => ({ ...p, email: v }))}
          type="email"
        />
        <Field
          label="Password"
          value={login.password}
          onChange={(v) => setLogin((p) => ({ ...p, password: v }))}
          type="password"
        />
        <button
          onClick={checkStatus}
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-blue px-5 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Cek
          Status
        </button>
      </div>
      {result && (
        <div className="mt-6 rounded-md border border-brand-blue/20 bg-brand-blue/5 p-4">
          <div className="flex items-center gap-2 text-brand-blue">
            <CheckCircle2 className="h-5 w-5" />
            <strong>{statusLabel[result.status] || result.status}</strong>
          </div>
          <p className="mt-2 text-sm text-foreground-muted">
            {result.campsiteName} • {result.city}, {result.province}
          </p>
          {result.reviewNote && (
            <p className="mt-3 rounded bg-white p-3 text-sm text-foreground-muted">
              {result.reviewNote}
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="mt-4 text-sm font-semibold text-error">{error}</p>
      )}
    </div>
  );
}

function Step({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-5 text-2xl font-black">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helper,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helper?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 min-h-24 w-full rounded-md border border-border bg-white p-3 text-sm font-medium outline-none focus:border-brand-blue"
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm font-medium outline-none focus:border-brand-blue"
        />
      )}
      {helper && (
        <span className="mt-1 block text-xs font-medium text-foreground-muted">
          {helper}
        </span>
      )}
    </label>
  );
}
