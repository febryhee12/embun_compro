'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS } from '@/components/ui/Button';

/**
 * Primary route links for the global header nav (Requirements 12.1, 12.2).
 * Every route is a real Next.js page — no in-page anchors here, since these
 * links must resolve correctly no matter which page the visitor is
 * currently on:
 *
 * - `/`                — App Landing Page (Beranda)
 * - `/mitra`            — Partner Landing Page (Mitra)
 * - `/mitra/direktori`  — Partner Directory (Direktori Mitra)
 */
const NAV_LINKS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Beranda' },
  { href: '/mitra', label: 'Mitra' },
  { href: '/mitra/direktori', label: 'Direktori Mitra' },
];

/** Route + anchor the "Hubungi Kami" CTA links to — the Contact Form lives on `/mitra` (Requirement 7.2). */
const CONTACT_HREF = '/mitra#contact';

/** Scroll offset (px) past which the header is treated as "past the Hero". */
const STICKY_SCROLL_THRESHOLD = 80;

/** DOM id of the mobile drawer panel, referenced by the hamburger button's `aria-controls`. */
const MOBILE_DRAWER_ID = 'mobile-nav-drawer';

/** Shared focus-visible outline for SiteHeader's interactive elements (Requirement 8.7). */
const FOCUS_VISIBLE_CLASS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-2';

/**
 * SiteHeader — global navigation header (Requirements 12.1, 12.2, 12.7, 12.8).
 *
 * Renders the Embun wordmark, real route links to every primary page (`/`,
 * `/mitra`, `/mitra/direktori`), and a "Hubungi Kami" CTA that links to the
 * Contact Form on `/mitra`. Once the visitor scrolls past the Hero
 * (approximated by `STICKY_SCROLL_THRESHOLD`), the header gains a
 * semi-transparent Off-White background + subtle blur/border so it reads
 * clearly against whatever section content sits behind it. This behavior is
 * identical across every page since `SiteHeader` is shared global chrome.
 *
 * Logo: renders the real Embun horizontal lockup (`model1_blue.svg`) in
 * Embun Blue, used on light backgrounds per the client's preference
 * (Requirement 10.5).
 */
export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > STICKY_SCROLL_THRESHOLD);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile drawer on Escape and return focus to the hamburger
  // button that opened it (Requirements 8.4, 8.6).
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        document
          .getElementById('mobile-nav-toggle')
          ?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  function closeMobileMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        isScrolled
          ? 'bg-background/90 backdrop-blur-sm shadow-[0_1px_0_0_var(--border)]'
          : 'bg-transparent',
      ].join(' ')}
    >
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className={['inline-flex items-center rounded-sm', FOCUS_VISIBLE_CLASS].join(' ')}
          >
            <Image
              src="/images/logo/model1_blue.svg"
              alt="Embun"
              width={158}
              height={36}
              unoptimized
              priority
            />
          </Link>

          {/* Desktop nav — visible on viewport ≥ 769px (Tailwind `md` = 768px). */}
          <nav aria-label="Navigasi utama" className="hidden md:flex">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={[
                      'text-sm font-medium text-foreground transition-colors hover:text-brand-blue rounded-sm',
                      FOCUS_VISIBLE_CLASS,
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <Link
              href={CONTACT_HREF}
              className={[BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS.primary, FOCUS_VISIBLE_CLASS].join(' ')}
            >
              Hubungi Kami
            </Link>
          </div>

          {/* Hamburger toggle — visible on viewport ≤ 768px (Requirement 8.6). */}
          <button
            id="mobile-nav-toggle"
            type="button"
            className={[
              'flex md:hidden items-center justify-center rounded-md p-2 text-brand-black',
              FOCUS_VISIBLE_CLASS,
            ].join(' ')}
            aria-expanded={isMenuOpen}
            aria-controls={MOBILE_DRAWER_ID}
            aria-label={isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X aria-hidden="true" size={24} /> : <Menu aria-hidden="true" size={24} />}
          </button>
        </div>

        {/* Mobile drawer panel — shown when the hamburger is toggled open. */}
        {isMenuOpen ? (
          <div
            id={MOBILE_DRAWER_ID}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm pb-6"
          >
            <nav aria-label="Navigasi mobile">
              <ul className="flex flex-col gap-1 pt-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMobileMenu}
                      className={[
                        'block rounded-sm px-1 py-3 text-base font-medium text-foreground transition-colors hover:text-brand-blue',
                        FOCUS_VISIBLE_CLASS,
                      ].join(' ')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href={CONTACT_HREF}
              onClick={closeMobileMenu}
              className={[
                BUTTON_BASE_CLASS,
                BUTTON_VARIANT_CLASS.primary,
                'mt-4 w-full py-4',
                FOCUS_VISIBLE_CLASS,
              ].join(' ')}
            >
              Hubungi Kami
            </Link>
          </div>
        ) : null}
      </Container>
    </header>
  );
}

export default SiteHeader;
