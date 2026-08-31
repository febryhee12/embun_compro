'use client';

import React, { useState } from 'react';
import { X, Smartphone, Mail, ArrowRight, Loader2, CheckCircle2, User, LogOut } from 'lucide-react';
import { guestDevLogin, setGuestSession, clearGuestSession } from '@/lib/api-client';

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  currentUser?: any | null;
  onLogout?: () => void;
}

export function GuestAuthModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onLogout,
}: GuestAuthModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Harap masukkan nomor WhatsApp atau email');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Direct login / register via backend
      const res = await guestDevLogin(identifier.trim(), fullName.trim() || undefined);
      if (onSuccess) onSuccess(res.guest);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk ke akun');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // In production: Google OAuth popup
    // For fast interactive demo: auto-fill guest Google
    const dummyPhone = `+628${Math.floor(100000000 + Math.random() * 900000000)}`;
    setIdentifier(dummyPhone);
    setFullName('Tamu Google');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-foreground rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between relative">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <span className="font-bold text-sm text-foreground">
            {currentUser ? 'Akun Saya' : 'Masuk atau Daftar'}
          </span>
          <div className="w-8" />
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged in view */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-brand-blue/10 text-brand-blue mx-auto flex items-center justify-center font-bold text-xl border-2 border-brand-blue/30">
                <User size={28} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {currentUser.fullName || 'Tamu Embun'}
                </h3>
                <p className="text-xs text-foreground-muted">{currentUser.phone || currentUser.email}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    clearGuestSession();
                    if (onLogout) onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login Form view */
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-xl text-brand-blue tracking-tight">
                    embun
                  </span>
                </div>
                <h3 className="text-lg font-bold font-serif text-foreground">
                  Selamat Datang di Embun
                </h3>
                <p className="text-xs text-foreground-muted">
                  Masuk untuk mengelola reservasi, favorit, dan kemudahan booking.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleContinue} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-foreground-muted uppercase mb-1">
                    Nama Lengkap (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground-muted uppercase mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-foreground focus:outline-none focus:border-brand-blue focus:bg-white transition-colors"
                  />
                </div>

                <p className="text-[10px] text-foreground-muted leading-relaxed">
                  Kami akan mengirimkan notifikasi konfirmasi booking dan E-Tiket ke nomor ini.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Lanjutkan</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-border w-full" />
                <span className="bg-white px-3 text-[11px] text-foreground-muted uppercase font-semibold">
                  atau
                </span>
                <div className="border-t border-border w-full" />
              </div>

              {/* Social Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 rounded-xl border border-border hover:bg-surface text-xs font-semibold text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Lanjutkan dengan Google</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
