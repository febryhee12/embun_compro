'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, LogOut, Loader2, Receipt } from 'lucide-react';
import {
  setGuestSession,
  clearGuestSession,
  API_BASE_URL,
} from '@/lib/api-client';

const GOOGLE_CLIENT_ID =
  '630714602612-7o9huedo97o6jf5ci1k7g1p6g8ncobqf.apps.googleusercontent.com';
const APPLE_ID_SCRIPT_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

/** Lazily loads Apple's "Sign in with Apple JS" SDK and resolves `window.AppleID`. */
function loadAppleIdScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).AppleID) return Promise.resolve((window as any).AppleID);
  return new Promise((resolve) => {
    const existing = document.getElementById('appleid-signin-script');
    const onReady = () => resolve((window as any).AppleID ?? null);
    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'appleid-signin-script';
    script.src = APPLE_ID_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
}

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  currentUser?: any | null;
  onLogout?: () => void;
  fromCheckout?: boolean;
}

export function GuestAuthModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onLogout,
  fromCheckout = false,
}: GuestAuthModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Google Identity Services SDK dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    setError(null);
    setLoadingProvider('google');

    try {
      if ((window as any).google?.accounts?.oauth2) {
        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            try {
              if (tokenResponse.error) {
                setError('Login Google dibatalkan.');
                setLoadingProvider(null);
                return;
              }

              // 1. Fetch real Google profile info using access token
              const userInfoRes = await fetch(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                },
              );

              if (!userInfoRes.ok) {
                throw new Error('Gagal mengambil data profil Google');
              }

              const googleUser = await userInfoRes.json();

              // 2. Call backend /guest/auth/social (Flutter compatibility)
              let finalToken = tokenResponse.access_token;
              let finalProfile = {
                id: googleUser.sub,
                email: googleUser.email,
                fullName: googleUser.name,
                avatarUrl: googleUser.picture || '',
                phone: '',
              };

              try {
                const authRes = await fetch(
                  `${API_BASE_URL}/guest/auth/social`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      // Backend's SocialLoginDto only accepts uppercase 'GOOGLE'/'APPLE'
                      // (@IsIn) - a lowercase value 400s and silently falls through
                      // to the catch below, leaving the guest "logged in" with a raw
                      // Google access token that the backend never issued/recognizes.
                      provider: 'GOOGLE',
                      idToken: tokenResponse.access_token,
                    }),
                  },
                );

                if (authRes.ok) {
                  const tokenData = await authRes.json();
                  finalToken = tokenData.accessToken || finalToken;
                  const meRes = await fetch(`${API_BASE_URL}/guest/me`, {
                    headers: { Authorization: `Bearer ${finalToken}` },
                  });
                  if (meRes.ok) {
                    finalProfile = await meRes.json();
                  }
                }
              } catch (backendErr) {
                console.warn(
                  'Backend sync warning (using real Google profile):',
                  backendErr,
                );
              }

              setGuestSession(finalToken, finalProfile);
              if (onSuccess) onSuccess(finalProfile);
              onClose();
            } catch (err: any) {
              setError(err.message || 'Gagal masuk dengan Google.');
            } finally {
              setLoadingProvider(null);
            }
          },
        });

        // Request access token with real Google popup window
        client.requestAccessToken();
      } else if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (!response.credential) return;
            try {
              // response.credential is a real Google-signed ID token - it must
              // still be exchanged with the backend for an embun session token
              // (never used directly as one; the backend never issued it).
              const authRes = await fetch(`${API_BASE_URL}/guest/auth/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  provider: 'GOOGLE',
                  idToken: response.credential,
                }),
              });
              if (!authRes.ok) {
                const err = await authRes.json().catch(() => ({}));
                throw new Error(err.message || 'Login Google gagal.');
              }
              const tokenData = await authRes.json();
              setGuestSession(tokenData.accessToken, tokenData.guest);
              if (onSuccess) onSuccess(tokenData.guest);
              onClose();
            } catch (e: any) {
              setError(e.message || 'Gagal masuk dengan Google.');
            } finally {
              setLoadingProvider(null);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        setError('Sedang memuat layanan Google Sign-In, silakan klik kembali.');
        setLoadingProvider(null);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungkan ke Google.');
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoadingProvider('apple');
    try {
      const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
      if (!clientId) {
        setError(
          'Login Apple belum dikonfigurasi (Services ID belum diatur). Silakan gunakan Google atau aplikasi Embun.',
        );
        return;
      }

      const AppleID = await loadAppleIdScript();
      if (!AppleID) {
        setError('Gagal memuat layanan Sign in with Apple.');
        return;
      }

      AppleID.auth.init({
        clientId,
        scope: 'name email',
        redirectURI:
          process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ||
          (typeof window !== 'undefined' ? window.location.origin : ''),
        usePopup: true,
      });

      const result = await AppleID.auth.signIn();
      const idToken: string | undefined = result?.authorization?.id_token;
      if (!idToken) {
        throw new Error('Apple tidak mengembalikan token identitas.');
      }

      const authRes = await fetch(`${API_BASE_URL}/guest/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'APPLE', idToken }),
      });
      if (!authRes.ok) {
        const err = await authRes.json().catch(() => ({}));
        throw new Error(err.message || 'Login Apple gagal.');
      }
      const tokenData = await authRes.json();

      // Apple only returns `user.name` on the very FIRST authorization ever
      // granted to this Services ID - the id_token itself never carries a
      // name. Use it opportunistically to fill in a nicer display name only
      // when the backend profile doesn't already have one.
      const appleName = result?.user?.name;
      if (appleName && !tokenData.guest?.fullName) {
        const fullName = [appleName.firstName, appleName.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();
        if (fullName) {
          tokenData.guest = { ...tokenData.guest, fullName };
        }
      }

      setGuestSession(tokenData.accessToken, tokenData.guest);
      if (onSuccess) onSuccess(tokenData.guest);
      onClose();
    } catch (err: any) {
      if (err?.error === 'popup_closed_by_user') {
        // User cancelled - not an error worth surfacing.
        return;
      }
      setError(err.message || 'Gagal masuk dengan Apple.');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white text-foreground rounded-t-3xl sm:rounded-3xl shadow-2xl border border-border overflow-hidden min-h-[480px] flex flex-col justify-between p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Top Bar with Back Arrow */}
        <div className="flex items-center justify-start shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft size={22} className="stroke-[2.2]" />
          </button>
        </div>

        {/* Center Content */}
        <div className="py-4 space-y-6 flex-1 flex flex-col justify-center">
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
                  {currentUser.phone ||
                    currentUser.email ||
                    'Akun Terverifikasi'}
                </p>
              </div>

              <div className="pt-6 space-y-2.5">
                <a
                  href="/profile"
                  className="w-full py-3.5 px-6 rounded-full border border-border bg-white hover:bg-surface text-foreground text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <User size={16} />
                  <span>Edit Profil</span>
                </a>
                <a
                  href="/orders"
                  className="w-full py-3.5 px-6 rounded-full border border-border bg-white hover:bg-surface text-foreground text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Receipt size={16} />
                  <span>Pesanan Saya</span>
                </a>
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
            /* Authentic Embun Login View */
            <div className="space-y-8">
              <div className="text-center space-y-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {fromCheckout
                    ? 'Selesaikan Pemesanan'
                    : 'Selamat Datang di Embun'}
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
                  {fromCheckout
                    ? 'Masuk ke akun Anda untuk menyelesaikan pemesanan ini.'
                    : 'Masuk ke akun Anda untuk mengakses profil dan pemesanan Anda.'}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold">
                  {error}
                </div>
              )}

              {/* Action Buttons: Authentic Embun Lime Pill Buttons with Brand Blue Text/Icons */}
              <div className="space-y-3.5">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full py-4 px-6 rounded-full bg-[#cefb0a] hover:bg-[#bfe80a] text-[#0841b5] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50 active:scale-[0.99]"
                >
                  {loadingProvider === 'google' ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-[#0841b5]"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 fill-current shrink-0"
                      viewBox="0 0 24 24"
                    >
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Masuk dengan Google</span>
                </button>

                {/* Apple Sign In */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full py-4 px-6 rounded-full bg-[#cefb0a] hover:bg-[#bfe80a] text-[#0841b5] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xs hover:shadow-md disabled:opacity-50 active:scale-[0.99]"
                >
                  {loadingProvider === 'apple' ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-[#0841b5]"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 fill-current shrink-0"
                      viewBox="0 0 170 170"
                    >
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.71-14.42-6.19-9.89-10.97-20.91-14.34-33.07-3.37-12.16-5.06-23.76-5.06-34.8 0-14.99 3.78-27.42 11.34-37.3 7.56-9.88 17.2-14.92 28.91-15.12 4.13 0 9.03 1.14 14.71 3.42 5.68 2.28 9.38 3.47 11.1 3.56 1.3.11 5.09-1.12 11.34-3.69 6.26-2.57 11.45-3.77 15.58-3.6 11.52.55 20.89 4.9 28.09 13.06-10.22 6.2-15.22 14.88-15 26.04.22 8.79 3.58 16.08 10.09 21.87 6.5 5.78 14.28 9.01 23.33 9.69-2.46 7.42-5.46 14.66-8.99 21.72zM119.22 33.39c0-6.72 2.45-13.12 7.36-19.2 4.9-6.08 11.02-10.22 18.36-12.41.97 6.63-.87 13.03-5.52 19.2-4.65 6.16-10.74 10.25-18.27 12.27-.43-.76-.65-1.57-.65-2.42z" />
                    </svg>
                  )}
                  <span>Masuk dengan Apple</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legal Consent */}
        <div className="pt-4 text-center shrink-0">
          <p className="text-[11px] sm:text-xs text-foreground-muted leading-relaxed max-w-xs mx-auto">
            Dengan masuk atau mendaftar, Anda menyetujui{' '}
            <a
              href="/kebijakan-privasi"
              className="text-brand-blue font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kebijakan Privasi
            </a>
            ,{' '}
            <a
              href="/syarat-ketentuan"
              className="text-brand-blue font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Syarat & Ketentuan
            </a>
            , dan{' '}
            <a
              href="/kebijakan-refund"
              className="text-brand-blue font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kebijakan Refund
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
