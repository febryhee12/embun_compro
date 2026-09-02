'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email?: string; name?: string; accountType?: 'PARTNER_APPLICATION' | 'HOST' }>({});

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setError('Tautan reset password tidak memiliki token yang valid.');
      return;
    }

    let isCancelled = false;
    fetch(`${API_BASE_URL}/auth/verify-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (isCancelled) return;
        if (!res.ok) {
          throw new Error(data.message || 'Token reset password tidak valid atau sudah kedaluwarsa.');
        }
        setTokenValid(true);
        setUserInfo({ email: data.email, name: data.name, accountType: data.accountType });
      })
      .catch((err) => {
        if (isCancelled) return;
        setTokenValid(false);
        setError(err.message || 'Tautan reset password sudah kedaluwarsa atau tidak valid.');
      })
      .finally(() => {
        if (!isCancelled) setVerifying(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Kata sandi baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengubah kata sandi.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-variant/30 p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl shadow-xl border border-surface-variant">
        <div className="flex justify-center mb-8">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 p-3">
            <img
              src="/logo-embun-white.svg"
              alt="Embun"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {verifying ? (
          <div className="py-12 text-center flex flex-col items-center">
            <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-foreground">
              Memverifikasi tautan reset password...
            </p>
          </div>
        ) : !tokenValid ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1.5">
                Tautan Tidak Valid
              </h2>
              <p className="text-xs text-secondary leading-relaxed max-w-xs mx-auto">
                {error || 'Tautan pengaturan ulang kata sandi sudah kedaluwarsa atau tidak dapat digunakan.'}
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => router.push('/mitra/register')}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all cursor-pointer"
              >
                Minta Tautan di Halaman Pendaftaran Mitra
              </button>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full flex items-center justify-center py-3 px-4 border border-surface-variant rounded-xl text-xs font-semibold text-foreground bg-surface hover:bg-surface-variant/40 transition-all cursor-pointer"
              >
                Minta Tautan di Halaman Masuk Dashboard
              </button>
            </div>
          </div>
        ) : success ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1.5">
                Kata Sandi Berhasil Diubah!
              </h2>
              <p className="text-xs text-secondary leading-relaxed max-w-xs mx-auto">
                {userInfo.accountType === 'PARTNER_APPLICATION'
                  ? 'Kata sandi pendaftaran mitra Anda telah aktif. Silakan masuk untuk memantau status pengajuan atau memperbaiki data berkas.'
                  : 'Kata sandi baru Anda telah aktif. Silakan masuk kembali ke dashboard menggunakan kata sandi baru.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(userInfo.accountType === 'PARTNER_APPLICATION' ? '/mitra/register' : '/login')}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all cursor-pointer"
            >
              {userInfo.accountType === 'PARTNER_APPLICATION'
                ? 'Masuk ke Status Pengajuan Mitra'
                : 'Masuk ke Dashboard'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 justify-center mb-1 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Keamanan Akun</span>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground mb-1">
              Buat Kata Sandi Baru
            </h1>
            {userInfo.email && (
              <p className="text-center text-secondary mb-6 text-xs">
                Untuk akun: <strong className="text-foreground">{userInfo.email}</strong>
              </p>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-secondary" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-background border border-surface-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-secondary" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-3 bg-background border border-surface-variant rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Ulangi kata sandi baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-secondary hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all mt-6 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Simpan Kata Sandi Baru
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-variant/30">
          <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
