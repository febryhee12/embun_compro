'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  setGuestSession,
  clearGuestSession,
  resolveAssetUrl,
  API_BASE_URL,
} from '@/lib/api-client';
import { CompleteProfileModal } from '@/components/explore/CompleteProfileModal';

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

const AUTH_MODAL_I18N = {
  id: {
    back: 'Kembali',
    defaultGuestName: 'Tamu Embun',
    verifiedAccount: 'Akun Terverifikasi',
    editProfile: 'Edit Profil',
    wishlist: 'Wishlist Saya',
    orders: 'Pesanan Saya',
    logout: 'Keluar dari Akun',
    welcomeTitle: 'Selamat Datang di Embun',
    welcomeDesc: 'Masuk ke akun Anda untuk mengakses profil dan pemesanan Anda.',
    checkoutTitle: 'Selesaikan Pemesanan',
    checkoutDesc: 'Masuk ke akun Anda untuk menyelesaikan pemesanan ini.',
    signInWithGoogle: 'Masuk dengan Google',
    signInWithApple: 'Masuk dengan Apple',
    consentPrefix: 'Dengan masuk atau mendaftar, Anda menyetujui ',
    privacyPolicy: 'Kebijakan Privasi',
    terms: 'Syarat & Ketentuan',
    and: ', dan ',
    refundPolicy: 'Kebijakan Refund',
    logoutModal: {
      title: 'Keluar dari Akun?',
      desc: 'Apakah Anda yakin ingin keluar dari akun Anda saat ini?',
      cancel: 'Batal',
      confirm: 'Keluar',
    },
    errors: {
      googleCancelled: 'Login Google dibatalkan.',
      googleProfileFailed: 'Gagal mengambil data profil Google.',
      googleFailed: 'Gagal masuk dengan Google.',
      googleLoading: 'Sedang memuat layanan Google Sign-In, silakan klik kembali.',
      googleConnectFailed: 'Gagal menghubungkan ke Google.',
      appleNotConfigured:
        'Login Apple belum dikonfigurasi (Services ID belum diatur). Silakan gunakan Google atau aplikasi Embun.',
      appleScriptFailed: 'Gagal memuat layanan Sign in with Apple.',
      appleTokenFailed: 'Apple tidak mengembalikan token identitas.',
      appleFailed: 'Gagal masuk dengan Apple.',
    },
  },
  en: {
    back: 'Back',
    defaultGuestName: 'Embun Guest',
    verifiedAccount: 'Verified Account',
    editProfile: 'Edit Profile',
    wishlist: 'My Wishlist',
    orders: 'My Bookings',
    logout: 'Log Out',
    welcomeTitle: 'Welcome to Embun',
    welcomeDesc: 'Sign in to access your profile and bookings.',
    checkoutTitle: 'Complete Booking',
    checkoutDesc: 'Sign in to your account to complete this booking.',
    signInWithGoogle: 'Sign in with Google',
    signInWithApple: 'Sign in with Apple',
    consentPrefix: 'By signing in or registering, you agree to our ',
    privacyPolicy: 'Privacy Policy',
    terms: 'Terms & Conditions',
    and: ', and ',
    refundPolicy: 'Refund Policy',
    logoutModal: {
      title: 'Log out of Account?',
      desc: 'Are you sure you want to log out of your current account?',
      cancel: 'Cancel',
      confirm: 'Log Out',
    },
    errors: {
      googleCancelled: 'Google sign-in cancelled.',
      googleProfileFailed: 'Failed to retrieve Google profile info.',
      googleFailed: 'Failed to sign in with Google.',
      googleLoading: 'Loading Google Sign-In services, please click again.',
      googleConnectFailed: 'Failed to connect to Google.',
      appleNotConfigured:
        'Apple Sign-In is not configured. Please use Google or the Embun app.',
      appleScriptFailed: 'Failed to load Sign in with Apple service.',
      appleTokenFailed: 'Apple did not return an identity token.',
      appleFailed: 'Failed to sign in with Apple.',
    },
  },
};

interface GuestAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  currentUser?: any | null;
  onLogout?: () => void;
  fromCheckout?: boolean;
  lang?: 'id' | 'en';
}

export function GuestAuthModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onLogout,
  fromCheckout = false,
  lang,
}: GuestAuthModalProps) {
  const [activeLang, setActiveLang] = useState<'id' | 'en'>(lang || 'id');

  useEffect(() => {
    if (lang) {
      setActiveLang(lang);
      return;
    }
    if (typeof window === 'undefined') return;
    if (window.location.pathname.startsWith('/en')) {
      setActiveLang('en');
      return;
    }
    const saved = localStorage.getItem('embun_lang');
    if (saved === 'id' || saved === 'en') {
      setActiveLang(saved);
    }
  }, [lang]);

  const t = AUTH_MODAL_I18N[activeLang];

  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingProfileForCompletion, setPendingProfileForCompletion] = useState<any | null>(null);

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
                setError(t.errors.googleCancelled);
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
                throw new Error(t.errors.googleProfileFailed);
              }

              const googleUser = await userInfoRes.json();

              // 2. Call backend /guest/auth/social (Flutter compatibility)
              let finalToken = tokenResponse.access_token;
              let finalProfile: any = {
                id: googleUser.sub,
                email: googleUser.email,
                fullName: googleUser.name,
                avatarUrl: googleUser.picture || '',
                phone: '',
                address: '',
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
              if (!finalProfile.phone || !finalProfile.address) {
                setPendingProfileForCompletion(finalProfile);
              } else {
                if (onSuccess) onSuccess(finalProfile);
                onClose();
              }
            } catch (err: any) {
              setError(err.message || t.errors.googleFailed);
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
                throw new Error(err.message || t.errors.googleFailed);
              }
              const tokenData = await authRes.json();
              const guest = tokenData.guest;
              setGuestSession(tokenData.accessToken, guest);
              if (!guest.phone || !guest.address) {
                setPendingProfileForCompletion(guest);
              } else {
                if (onSuccess) onSuccess(guest);
                onClose();
              }
            } catch (e: any) {
              setError(e.message || t.errors.googleFailed);
            } finally {
              setLoadingProvider(null);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } else {
        setError(t.errors.googleLoading);
        setLoadingProvider(null);
      }
    } catch (err: any) {
      setError(err.message || t.errors.googleConnectFailed);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoadingProvider('apple');
    try {
      const clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
      if (!clientId) {
        setError(t.errors.appleNotConfigured);
        return;
      }

      const AppleID = await loadAppleIdScript();
      if (!AppleID) {
        setError(t.errors.appleScriptFailed);
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
        throw new Error(t.errors.appleTokenFailed);
      }

      const authRes = await fetch(`${API_BASE_URL}/guest/auth/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'APPLE', idToken }),
      });
      if (!authRes.ok) {
        const err = await authRes.json().catch(() => ({}));
        throw new Error(err.message || t.errors.appleFailed);
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

      const guest = tokenData.guest;
      setGuestSession(tokenData.accessToken, guest);
      if (!guest.phone || !guest.address) {
        setPendingProfileForCompletion(guest);
      } else {
        if (onSuccess) onSuccess(guest);
        onClose();
      }
    } catch (err: any) {
      if (err?.error === 'popup_closed_by_user') {
        // User cancelled - not an error worth surfacing.
        return;
      }
      setError(err.message || t.errors.appleFailed);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-surface text-foreground rounded-3xl shadow-2xl border border-border overflow-hidden min-h-[480px] flex flex-col justify-between p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        {/* Top Bar with Back Arrow */}
        <div className="flex items-center justify-start shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground transition-colors cursor-pointer"
            aria-label={t.back}
          >
            <ArrowLeft size={22} className="stroke-[2.2]" />
          </button>
        </div>

        {/* Center Content */}
        <div className="py-4 space-y-6 flex-1 flex flex-col justify-center">
          {currentUser ? (
            /* Logged in profile view */
            <div className="space-y-4 text-center py-4">
              <div className="w-20 h-20 rounded-full bg-[#c2410c] text-white mx-auto flex items-center justify-center font-bold text-2xl border-2 border-brand-lime shadow-xs overflow-hidden shrink-0">
                {currentUser.photoUrl || currentUser.avatarUrl ? (
                  <img
                    src={resolveAssetUrl(
                      currentUser.photoUrl || currentUser.avatarUrl,
                    )}
                    alt={currentUser.fullName || 'Avatar'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-black text-white select-none">
                    {(currentUser.fullName || 'G')
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">
                  {currentUser.fullName || t.defaultGuestName}
                </h3>
                <p className="text-xs text-foreground-muted">
                  {currentUser.email ||
                    currentUser.phone ||
                    t.verifiedAccount}
                </p>
              </div>

              <div className="pt-6 space-y-2.5">
                <a
                  href="/profile"
                  className="w-full py-3.5 px-6 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-surface hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10 text-foreground text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs group"
                >
                  <span>{t.editProfile}</span>
                </a>
                <a
                  href="/wishlist"
                  className="w-full py-3.5 px-6 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-surface hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10 text-foreground text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs group"
                >
                  <span>{t.wishlist}</span>
                </a>
                <a
                  href="/orders"
                  className="w-full py-3.5 px-6 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-surface hover:bg-brand-blue/5 dark:hover:bg-brand-lime/10 text-foreground text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs group"
                >
                  <span>{t.orders}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-3.5 px-6 rounded-full border border-border hover:border-red-500/60 dark:hover:border-red-500/60 bg-surface hover:bg-red-500/10 text-foreground hover:text-red-500 dark:hover:text-red-400 text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs group"
                >
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Authentic Embun Login View */
            <div className="space-y-8">
              <div className="text-center space-y-2.5">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {fromCheckout
                    ? t.checkoutTitle
                    : t.welcomeTitle}
                </h2>
                <p className="text-xs sm:text-sm text-foreground-muted max-w-xs mx-auto leading-relaxed">
                  {fromCheckout
                    ? t.checkoutDesc
                    : t.welcomeDesc}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs text-center font-semibold">
                  {error}
                </div>
              )}

              {/* Action Buttons: Authentic Embun Buttons (Biru Embun in Light Mode, Lime in Dark Mode) */}
              <div className="space-y-3.5">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full py-4 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white dark:bg-brand-lime dark:hover:bg-brand-lime/90 dark:text-black font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99]"
                >
                  {loadingProvider === 'google' ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-white dark:text-black"
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
                  <span>{t.signInWithGoogle}</span>
                </button>

                {/* Apple Sign In */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full py-4 px-6 rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white dark:bg-brand-lime dark:hover:bg-brand-lime/90 dark:text-black font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99]"
                >
                  {loadingProvider === 'apple' ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-white dark:text-black"
                    />
                  ) : (
                    <svg
                      className="w-5 h-5 fill-current shrink-0"
                      viewBox="1 1 22 22"
                    >
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                    </svg>
                  )}
                  <span>{t.signInWithApple}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legal Consent - hanya muncul saat belum login */}
        {!currentUser && (
          <div className="pt-4 text-center shrink-0">
            <p className="text-[11px] sm:text-xs text-foreground-muted leading-relaxed max-w-xs mx-auto">
              {t.consentPrefix}
              <a
                href={`/${activeLang}/kebijakan-privasi/`}
                className="text-brand-blue dark:text-brand-lime font-semibold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.privacyPolicy}
              </a>
              ,{' '}
              <a
                href={`/${activeLang}/syarat-ketentuan/`}
                className="text-brand-blue dark:text-brand-lime font-semibold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.terms}
              </a>
              {t.and}
              <a
                href={`/${activeLang}/kebijakan-refund/`}
                className="text-brand-blue dark:text-brand-lime font-semibold hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.refundPolicy}
              </a>
              .
            </p>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-surface text-foreground rounded-3xl shadow-2xl border border-border p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-foreground">
              {t.logoutModal.title}
            </h3>
            <p className="text-xs text-foreground-muted leading-relaxed">
              {t.logoutModal.desc}
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-full border border-border hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime bg-surface hover:bg-surface-variant text-foreground text-xs font-bold transition-all cursor-pointer"
              >
                {t.logoutModal.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearGuestSession();
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                {t.logoutModal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Profile Dialog (Airbnb style for new guests or incomplete profiles) */}
      {pendingProfileForCompletion && (
        <CompleteProfileModal
          isOpen={Boolean(pendingProfileForCompletion)}
          currentUser={pendingProfileForCompletion}
          lang={activeLang}
          onClose={() => {
            const user = pendingProfileForCompletion;
            setPendingProfileForCompletion(null);
            if (onSuccess) onSuccess(user);
            onClose();
          }}
          onSuccess={(updatedUser) => {
            setPendingProfileForCompletion(null);
            if (onSuccess) onSuccess(updatedUser);
            onClose();
          }}
        />
      )}
    </div>
  );
}
