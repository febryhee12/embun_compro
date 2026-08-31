'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop — Handles both:
 * 1. Automatic scroll-to-top on route navigation.
 * 2. Floating "Go to top" button visible after scrolling down.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // 1. Scroll to top automatically when navigating between pages
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 2. Listen to scroll position to show/hide floating button
  useEffect(() => {
    function toggleVisibility() {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      type="button"
      aria-label="Kembali ke atas"
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-30 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#cbfd00] hover:bg-[#b8e600] text-[#0841b5] shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 border border-black/10"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}

export default ScrollToTop;
