'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { EXPLORE_I18N, type Language } from '@/lib/explore-i18n';

export interface ExploreFooterProps {
  className?: string;
  lang?: Language;
  onToggleLanguage?: () => void;
}

export function ExploreFooter({ className, lang = 'id', onToggleLanguage }: ExploreFooterProps = {}) {
  const currentYear = new Date().getFullYear();
  const t = EXPLORE_I18N[lang].footer;

  const handleToggle = () => {
    if (onToggleLanguage) {
      onToggleLanguage();
    } else if (typeof window !== 'undefined') {
      const nextLang: Language = lang === 'id' ? 'en' : 'id';
      localStorage.setItem('embun_lang', nextLang);
      window.location.reload();
    }
  };

  return (
    <footer
      className={`border-t border-border bg-surface text-foreground-muted mt-auto pt-10 pb-8 text-xs ${
        className ?? ''
      }`}
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-8">
          {/* Kolom 1: Logo Embun, PT, & Alamat */}
          <div className="md:col-span-6 flex flex-col gap-2.5">
            <div>
              <Image
                src="/images/logo/model1_blue.svg"
                alt="Embun"
                width={130}
                height={30}
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-foreground">
                PT Alam Kelana Digital
              </p>
              <p className="text-xs leading-relaxed max-w-md text-foreground-muted">
                Jl. Vila regensi 2 blok EA 13 No.16, Gelam Jaya, Pasar Kemis, Kabupaten Tangerang 15560, Banten, Indonesia
              </p>
            </div>
          </div>

          {/* Kolom 2: Kontak Resmi */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t.contactTitle}
            </p>
            <div className="flex flex-col gap-1.5">
              <a
                href="mailto:support@embun.app"
                className="hover:text-brand-blue hover:underline transition-colors"
              >
                support@embun.app
              </a>
              <a
                href="https://wa.me/6282131411919"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-blue hover:underline transition-colors"
              >
                +62 821-3141-1919 (WA)
              </a>
            </div>
          </div>

          {/* Kolom 3: Kebijakan & Legalitas */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">
              {t.policiesTitle}
            </p>
            <div className="flex flex-col gap-1.5">
              <Link href={`/${lang}/kebijakan-privasi/`} className="hover:text-brand-blue hover:underline transition-colors">
                {t.privacyPolicy}
              </Link>
              <Link href={`/${lang}/syarat-ketentuan/`} className="hover:text-brand-blue hover:underline transition-colors">
                {t.termsConditions}
              </Link>
              <Link href={`/${lang}/kebijakan-refund/`} className="hover:text-brand-blue hover:underline transition-colors">
                {t.refundPolicy}
              </Link>
              <Link href={`/${lang}/mitra/`} className="hover:text-brand-blue hover:underline transition-colors">
                {t.campPartners}
              </Link>
            </div>
          </div>
        </div>

        {/* Baris Bawah: Copyright & Pemilih Bahasa */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-foreground-muted">
          <p>© {currentYear} Embun | PT Alam Kelana Digital. {t.copyright}</p>
          <div className="flex items-center gap-4 flex-wrap">
            <p>{t.location}</p>
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-variant text-xs font-bold text-foreground shadow-2xs transition-all cursor-pointer hover:border-brand-blue hover:text-brand-blue"
              title={lang === 'en' ? 'Ubah ke Bahasa Indonesia' : 'Switch to English'}
            >
              <Globe size={14} className="text-brand-blue shrink-0" />
              <span>{lang === 'en' ? 'English (EN)' : 'Bahasa Indonesia (ID)'}</span>
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
