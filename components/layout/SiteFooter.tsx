'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Globe, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Container } from '@/components/ui/Container';

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16.8 13.7c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.2-.6.1-.1.3-.4.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.2-.7-1.6-.9-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1.1 1-1.1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
    </svg>
  );
}

/**
 * SiteFooter — global footer (Requirements 6.4, 6.5, 10.5, 12.3).
 *
 * Renders on the Embun Black (`--surface-dark`) background.
 * WhatsApp, Instagram, LinkedIn, dan email disembunyikan sementara.
 */

interface LegalLink {
  href: string;
  label: string;
}

const getLegalLinks = (lang: string): LegalLink[] => [
  {
    href: `/${lang}/explore`,
    label: lang === 'en' ? 'Explore' : 'Jelajah',
  },
  {
    href: `/${lang}/kebijakan-privasi`,
    label: lang === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi',
  },
  {
    href: `/${lang}/syarat-ketentuan`,
    label: lang === 'en' ? 'Terms & Conditions' : 'Syarat & Ketentuan',
  },
  {
    href: `/${lang}/kebijakan-refund`,
    label: lang === 'en' ? 'Refund Policy' : 'Kebijakan Refund',
  },
];

/**
 * Focus-visible override for SiteFooter's Legal Page links (Requirement 12.8).
 *
 * SiteFooter renders on the Embun Black (`--surface-dark`) background. The
 * global focus ring (`app/globals.css`) defaults to Embun Blue, which does
 * not meet the WCAG 2.1 non-text 3:1 contrast minimum against Embun Black —
 * so this local override swaps the ring color to `--brand-lime`, mirroring
 * the same dark-context override used by `CTAButton`/`DownloadCtaButton`.
 */
const FOCUS_VISIBLE_CLASS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2';

export function SiteFooter() {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as string) || 'id';
  const legalLinks = getLegalLinks(lang);
  const switchLang = lang === 'id' ? 'en' : 'id';
  const switchHref = pathname
    ? pathname.replace(`/${lang}`, `/${switchLang}`)
    : `/${switchLang}`;

  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#FAFEE8] dark:bg-surface text-brand-black dark:text-foreground border-t border-black/10 dark:border-white/10 transition-colors">
      <Container>
        <div className="flex flex-col gap-6 py-12 md:flex-row md:items-start md:justify-between">
          {/* Logo + tagline */}
          <div className="max-w-xs">
            <Image
              src="/images/logo/model1_blue.svg"
              alt="Embun"
              width={158}
              height={36}
              unoptimized
              className="dark:hidden"
            />
            <Image
              src="/images/logo/model1_white.svg"
              alt="Embun"
              width={158}
              height={36}
              unoptimized
              className="hidden dark:block"
            />
            <p className="mt-3 text-sm text-foreground-muted">
              {lang === 'en'
                ? 'As simple as morning dew, as vast as your way of enjoying nature.'
                : 'Sepraktis embun pagi, seluas caramu menikmati alam.'}
            </p>
            {/* Social Media & Contact Links */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com/embun.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-muted transition-colors hover:text-brand-blue dark:hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm"
                aria-label="Instagram Embun"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/embunapp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-muted transition-colors hover:text-brand-blue dark:hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm"
                aria-label="X (Twitter) Embun"
              >
                <XIcon className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@embun.app"
                className="text-foreground-muted transition-colors hover:text-brand-blue dark:hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm"
                aria-label="Email Embun Support"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/6282131411919"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground-muted transition-colors hover:text-brand-blue dark:hover:text-brand-lime focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm"
                aria-label="WhatsApp Embun"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>


          {/* Legal Page links */}
          <nav aria-label={lang === 'en' ? 'Legal links' : 'Tautan legal'}>
            <ul className="flex flex-col gap-2 md:items-end">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm text-sm text-foreground-muted transition-colors hover:text-brand-blue dark:hover:text-brand-lime"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Copyright, Pemilih Bahasa & Switch Mode Tema */}
        <div className="flex flex-col gap-4 border-t border-black/10 dark:border-white/10 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground-muted">
            © {year} Embun | PT Alam Kelana Digital.{' '}
            {lang === 'en'
              ? 'All rights reserved.'
              : 'Seluruh hak cipta dilindungi.'}
          </p>
          <div className="flex items-center gap-3.5 flex-wrap">
            <p className="text-xs text-foreground-muted">
              Kabupaten Tangerang, Indonesia
            </p>
            {/* Language Switcher */}
            <Link
              href={switchHref}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/15 dark:border-white/15 bg-white/90 dark:bg-surface hover:bg-white dark:hover:bg-neutral-800 text-xs font-bold text-brand-black dark:text-foreground shadow-2xs transition-all cursor-pointer hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime"
              title={lang === 'en' ? 'Ubah ke Bahasa Indonesia' : 'Switch to English'}
            >
              <Globe size={14} className="text-brand-blue dark:text-brand-lime shrink-0" />
              <span>{lang === 'en' ? 'English (EN)' : 'Bahasa Indonesia (ID)'}</span>
            </Link>

            {/* Dark Mode Toggle Switcher */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/15 dark:border-white/15 bg-white/90 dark:bg-surface hover:bg-white dark:hover:bg-neutral-800 text-xs font-bold text-brand-black dark:text-foreground shadow-2xs transition-all cursor-pointer hover:border-brand-blue dark:hover:border-brand-lime hover:text-brand-blue dark:hover:text-brand-lime"
              title={
                mounted && resolvedTheme === 'dark'
                  ? lang === 'en'
                    ? 'Switch to Light Mode'
                    : 'Ganti ke Mode Terang'
                  : lang === 'en'
                  ? 'Switch to Dark Mode'
                  : 'Ganti ke Mode Gelap'
              }
              aria-label="Toggle Theme"
            >
              {mounted ? (
                resolvedTheme === 'dark' ? (
                  <>
                    <Sun size={14} className="text-brand-lime shrink-0" />
                    <span>{lang === 'en' ? 'Light Mode' : 'Mode Terang'}</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-brand-blue shrink-0" />
                    <span>{lang === 'en' ? 'Dark Mode' : 'Mode Gelap'}</span>
                  </>
                )
              ) : (
                <>
                  <Sun size={14} className="shrink-0" />
                  <span>Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default SiteFooter;
