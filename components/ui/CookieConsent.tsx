'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';

/**
 * CookieConsent — Lightweight floating banner to inform users about cookie & local storage usage.
 * Stores consent choice in `localStorage` so it only appears once per visitor and never triggers page reloads.
 */
export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isEn = pathname?.startsWith('/en');

  // Do not show cookie banner on explore pages per user request:
  // "untuk halaman compro explore sepertinya tidak perlu cookies"
  const isExplorePage = pathname?.includes('/explore');

  useEffect(() => {
    if (isExplorePage) return;

    // Check if user has already accepted or dismissed the cookie consent
    const consent = localStorage.getItem('embun_cookie_consent');
    if (!consent) {
      // Small delay for smooth entry animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isExplorePage]);

  function handleAccept() {
    localStorage.setItem('embun_cookie_consent', 'accepted');
    setIsVisible(false);
  }

  function handleClose() {
    localStorage.setItem('embun_cookie_consent', 'dismissed');
    setIsVisible(false);
  }

  if (isExplorePage || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative rounded-2xl bg-[#1a1a1a]/95 dark:bg-[#0e1117]/95 text-white dark:text-[#fafaff] p-5 shadow-2xl backdrop-blur-md border border-white/10 dark:border-[#1d212a] flex flex-col gap-3">
        {/* Close Button */}
        <button
          onClick={handleClose}
          type="button"
          aria-label="Tutup"
          className="absolute top-3.5 right-3.5 text-white/60 dark:text-[#8b949e] hover:text-white dark:hover:text-white transition-colors p-1 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="pr-6">
          <h4 className="text-sm font-bold text-white dark:text-[#fafaff] mb-1">
            {isEn ? 'Cookie & Privacy Preference' : 'Privasi & Cookie'}
          </h4>
          <p className="text-xs text-white/80 dark:text-[#8b949e] leading-relaxed">
            {isEn
              ? 'Embun uses local storage to remember your language and preference settings to provide a smooth browsing experience.'
              : 'Embun menggunakan penyimpanan lokal untuk mengingat preferensi Anda agar navigasi tetap cepat tanpa perlu memuat ulang.'}{' '}
            <Link
              href={isEn ? '/en/kebijakan-privasi' : '/id/kebijakan-privasi'}
              className="underline text-brand-lime hover:opacity-90 font-semibold"
            >
              {isEn ? 'Learn more' : 'Pelajari selengkapnya'}
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={handleAccept}
            type="button"
            className="rounded-xl bg-brand-lime hover:bg-[#bfe80a] text-[#0841b5] font-bold text-xs px-5 py-2 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            {isEn ? 'Accept' : 'Saya Setuju'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
