'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, LogOut, Loader2, Phone, Mail, Check, ShieldCheck } from 'lucide-react';
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
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authTab, setAuthTab] = useState<'quick' | 'social'>('quick');

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Nomor WhatsApp wajib diisi.');
      return;
    }
    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }

    setError(null);
    setLoadingProvider('form');
    try {
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+62' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+62' + formattedPhone;
      }

      const res = await guestDevLogin(formattedPhone, fullName.trim());
      if (email.trim()) {
        res.guest.email = email.trim();
        setGuestSession(res.accessToken, res.guest);
      }
      if (onSuccess) onSuccess(res.guest);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk akun.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoadingProvider('google');
    try {
      const dummyPhone = `+62812${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await guestDevLogin(dummyPhone, fullName || 'Tamu Google');
      res.guest.email = 'tamu.google@gmail.com';
      setGuestSession(res.accessToken, res.guest);
      if (onSuccess) onSuccess(res.guest);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoadingProvider('apple');
    try {
      const dummyPhone = `+62813${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await guestDevLogin(dummyPhone, fullName || 'Tamu Apple');
      res.guest.email = 'tamu.apple@icloud.com';
      setGuestSession(res.accessToken, res.guest);
      if (onSuccess) onSuccess(res.guest);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk dengan Apple.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden min-h-[500px] flex flex-col justify-between p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Top Bar with Back Arrow */}
        <div className="flex items-center justify-between shrink-0 border-b border-border pb-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="stroke-[2.2]" />
          </button>
          <span className="font-bold text-xs uppercase tracking-wider text-foreground-muted">
            {currentUser ? 'Profil Tamu' : 'Masuk / Daftar'}
          </span>
          <div className="w-6" />
        </div>

        {/* Center Content */}
        <div className="py-4 space-y-5 flex-1 flex flex-col justify-center">
          {currentUser ? (
            /* Logged in profile view */
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-brand-lime/30 text-brand-blue mx-auto flex items-center justify-center font-bold text-2xl border-2 border-brand-lime shadow-xs">
                <User size={36} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  {currentUser.fullName || 'Tamu Embun'}
                </h3>
                <p className="text-xs text-foreground-muted">
                  {currentUser.phone || currentUser.email || 'Akun Terverifikasi'}
                </p>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    clearGuestSession();
                    if (onLogout) onLogout();
                    onClose();
                  }}
                  className="w-full py-3.5 px-6 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <LogOut size={16} />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login & Data Tamu View */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Data Tamu & Pemesanan
                </h2>
                <p className="text-xs text-foreground-muted max-w-xs mx-auto leading-relaxed">
                  Isi data Anda untuk verifikasi pemesanan & e-tiket langsung ke WhatsApp/Email Anda.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
                  {error}
                </div>
              )}

              {/* Quick Form */}
              <form onSubmit={handleFormLogin} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Pratama"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-border bg-surface text-xs text-foreground placeholder:text-foreground-muted focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block mb-1">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-border bg-surface text-xs text-foreground placeholder:text-foreground-muted focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-foreground-muted block mb-1">
                    Email (Opsional untuk E-Tiket)
                  </label>
                  <input
                    type="email"
                    placeholder="Contoh: rian@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-border bg-surface text-xs text-foreground placeholder:text-foreground-muted focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingProvider !== null}
                  className="w-full py-3.5 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
                >
                  {loadingProvider === 'form' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  <span>Konfirmasi & Lanjutkan</span>
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-foreground-muted">atau masuk dengan</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingProvider !== null}
                  className="py-2.5 px-3 rounded-2xl border border-border bg-surface hover:bg-surface-variant text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingProvider === 'google' ? (
                    <Loader2 size={14} className="animate-spin text-brand-blue" />
                  ) : (
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loadingProvider !== null}
                  className="py-2.5 px-3 rounded-2xl border border-border bg-surface hover:bg-surface-variant text-foreground font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loadingProvider === 'apple' ? (
                    <Loader2 size={14} className="animate-spin text-brand-blue" />
                  ) : (
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.42-6.19-9.89-10.97-20.91-14.34-33.07-3.37-12.16-5.06-23.76-5.06-34.8 0-14.99 3.78-27.42 11.34-37.3 7.56-9.88 17.2-14.92 28.91-15.12 4.13 0 9.03 1.14 14.71 3.42 5.68 2.28 9.38 3.47 11.1 3.56 1.3.11 5.09-1.12 11.34-3.69 6.26-2.57 11.45-3.77 15.58-3.6 11.52.55 20.89 4.9 28.09 13.06-10.22 6.2-15.22 14.88-15 26.04.22 8.79 3.58 16.08 10.09 21.87 6.5 5.78 14.28 9.01 23.33 9.69-2.46 7.42-5.46 14.66-8.99 21.72zM119.22 33.39c0-6.72 2.45-13.12 7.36-19.2 4.9-6.08 11.02-10.22 18.36-12.41.97 6.63-.87 13.03-5.52 19.2-4.65 6.16-10.74 10.25-18.27 12.27-.43-.76-.65-1.57-.65-2.42z" />
                    </svg>
                  )}
                  <span>Apple</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legal Consent */}
        <div className="pt-3 text-center shrink-0 border-t border-border">
          <p className="text-[10.5px] text-foreground-muted leading-relaxed max-w-xs mx-auto">
            Dengan masuk, Anda menyetujui{' '}
            <a
              href="/kebijakan-privasi"
              className="text-brand-blue font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kebijakan Privasi
            </a>{' '}
            &{' '}
            <a
              href="/syarat-ketentuan"
              className="text-brand-blue font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Syarat & Ketentuan
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
