'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Container } from '@/components/ui/Container';
import {
  BUTTON_BASE_CLASS,
  BUTTON_VARIANT_CLASS,
} from '@/components/ui/Button';

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
const getNavLinks = (lang: string) => [
  {
    href: `/${lang}/mitra`,
    label: lang === 'en' ? 'Become a Partner' : 'Gabung jadi mitra',
  },
  {
    href: `/${lang}/mitra/direktori`,
    label: lang === 'en' ? 'Our Partners' : 'Mitra kami',
  },
];

const getContactHref = (lang: string) => `/${lang}/mitra/#contact`;

const CONTACT_ANCHOR_ID = 'contact';
const CONTACT_HASH = `#${CONTACT_ANCHOR_ID}`;
const HEADER_ANCHOR_OFFSET = 88;

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
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as string) || 'id';
  const navLinks = getNavLinks(lang);
  const contactHref = getContactHref(lang);
  const switchLang = lang === 'id' ? 'en' : 'id';
  const switchHref = pathname
    ? pathname.replace(`/${lang}`, `/${switchLang}`)
    : `/${switchLang}`;

  function scrollToContactForm(behavior: ScrollBehavior) {
    const contactElem = document.getElementById(CONTACT_ANCHOR_ID);
    if (!contactElem) return false;

    const top =
      contactElem.getBoundingClientRect().top +
      window.scrollY -
      HEADER_ANCHOR_OFFSET;
    window.scrollTo({ top, behavior });
    return true;
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const targetPath = contactHref.split('#')[0].replace(/\/$/, '');
    const currentPath = pathname?.replace(/\/$/, '');

    if (currentPath !== targetPath || window.location.hash !== CONTACT_HASH) {
      return;
    }

    let retryId: number | undefined;
    let attempts = 0;

    function scrollWhenReady() {
      attempts += 1;

      if (!scrollToContactForm('smooth') && attempts < 10) {
        retryId = window.setTimeout(scrollWhenReady, 50);
      }
    }

    retryId = window.setTimeout(scrollWhenReady, 0);

    return () => {
      if (retryId !== undefined) {
        window.clearTimeout(retryId);
      }
    };
  }, [contactHref, pathname]);

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
        document.getElementById('mobile-nav-toggle')?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  function closeMobileMenu() {
    setIsMenuOpen(false);
  }

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    setIsMenuOpen(false);
    const targetPath = href.replace(/\/$/, '');
    const currentPath = pathname?.replace(/\/$/, '');

    if (currentPath === targetPath) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', targetPath);
    } else {
      if (href.endsWith('/mitra') || href.endsWith('/mitra/')) {
        e.preventDefault();
        window.location.assign(href);
      }
    }
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setIsMenuOpen(false);

    const targetPath = contactHref.split('#')[0].replace(/\/$/, '');
    const currentPath = pathname?.replace(/\/$/, '');
    const isContactPage = currentPath === targetPath;

    if (!isContactPage) {
      e.preventDefault();
      window.location.assign(contactHref);
      return;
    }

    if (scrollToContactForm('smooth')) {
      e.preventDefault();
      window.history.pushState(null, '', contactHref);
    }
  };

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
            href={`/${lang}`}
            className={[
              'inline-flex items-center rounded-sm',
              FOCUS_VISIBLE_CLASS,
            ].join(' ')}
          >
            <Image
              src={
                mounted &&
                (theme === 'dark' ||
                  (theme === 'system' && systemTheme === 'dark'))
                  ? '/images/logo/model1_white.svg'
                  : '/images/logo/model1_blue.svg'
              }
              alt="Embun"
              width={158}
              height={36}
              unoptimized
              priority
            />
          </Link>

          {/* Right-aligned Header Items — Nav Links + CTA + Lang */}
          <div className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
            <nav aria-label="Navigasi utama">
              <ul className="flex items-center gap-6 lg:gap-8">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
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

            <div className="flex items-center gap-4">
              <a
                href={contactHref}
                onClick={handleContactClick}
                className={[
                  'inline-flex items-center justify-center rounded-xl bg-[#cbfd00] hover:bg-[#b8e600] text-[#0841b5] font-semibold px-6 py-2.5 text-sm transition-all duration-200 shadow-sm active:scale-95',
                  FOCUS_VISIBLE_CLASS,
                ].join(' ')}
              >
                {lang === 'en' ? 'Contact Us' : 'Hubungi Kami'}
              </a>

              <Link
                href={switchHref}
                className={[
                  'px-2 py-1 text-sm font-bold text-foreground transition-colors hover:text-brand-blue rounded-md ml-1',
                  FOCUS_VISIBLE_CLASS,
                ].join(' ')}
                aria-label="Switch language"
              >
                {lang === 'id' ? 'EN' : 'ID'}
              </Link>
            </div>
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
            aria-label={
              isMenuOpen
                ? lang === 'en'
                  ? 'Close navigation menu'
                  : 'Tutup menu navigasi'
                : lang === 'en'
                  ? 'Open navigation menu'
                  : 'Buka menu navigasi'
            }
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X aria-hidden="true" size={24} />
            ) : (
              <Menu aria-hidden="true" size={24} />
            )}
          </button>
        </div>

        {/* Mobile drawer panel — shown when the hamburger is toggled open. */}
        {isMenuOpen ? (
          <div
            id={MOBILE_DRAWER_ID}
            className="md:hidden bg-transparent pb-6 pt-2"
          >
            <nav
              aria-label={
                lang === 'en' ? 'Mobile navigation' : 'Navigasi mobile'
              }
            >
              <ul className="flex flex-col gap-1 pt-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className={[
                        'block rounded-sm px-1 py-3 text-base font-medium text-foreground transition-colors hover:text-brand-blue',
                        FOCUS_VISIBLE_CLASS,
                      ].join(' ')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="flex items-center justify-between border-t border-foreground/10 pt-4 pb-2 mt-2">
                  <span className="text-base font-medium text-foreground">
                    {lang === 'en' ? 'Language' : 'Bahasa'}
                  </span>
                  <Link
                    href={switchHref}
                    className={[
                      'px-4 py-2 text-sm font-bold text-foreground transition-colors hover:text-brand-blue rounded-md border border-foreground/20 bg-transparent',
                      FOCUS_VISIBLE_CLASS,
                    ].join(' ')}
                    aria-label="Switch language"
                  >
                    {lang === 'id' ? 'English (EN)' : 'Indonesia (ID)'}
                  </Link>
                </li>
              </ul>
            </nav>

            <a
              href={contactHref}
              onClick={handleContactClick}
              className={[
                'mt-4 flex w-full items-center justify-center rounded-xl bg-[#cbfd00] hover:bg-[#b8e600] text-[#0841b5] font-semibold py-3.5 text-base transition-all duration-200 shadow-sm',
                FOCUS_VISIBLE_CLASS,
              ].join(' ')}
            >
              {lang === 'en' ? 'Contact Us' : 'Hubungi Kami'}
            </a>
          </div>
        ) : null}
      </Container>
    </header>
  );
}

export default SiteHeader;
