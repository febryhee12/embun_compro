import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS } from '@/components/ui/Button';
import { HeroImage } from '@/components/sections/HeroImage';
import { Reveal } from '@/components/ui/Reveal';

export interface PartnerHeroProps {
  headline: string; // Owner-targeted value prop
  subcopy: string; // ≤2 sentences
  imageSrc: string;
  imageAlt: string;
  ctaHref: string; // '#contact'
  ctaLabel: string;
}

const DEFAULT_PROPS: PartnerHeroProps = {
  headline: 'Kelola Campsite Anda, Reservasi Biar Kami yang Urus',
  subcopy:
    'Embun mencatat setiap reservasi dan pembayaran secara otomatis, jadi Anda bisa fokus mengelola campsite tanpa repot administrasi manual.',
  // NOTE: placeholder path — no real owner-dashboard mockup asset exists yet.
  // A later content/asset task must supply the actual mockup at this path.
  imageSrc: '/images/partner-hero-mockup.png',
  imageAlt: 'Tangkapan layar dashboard mitra Embun menampilkan daftar reservasi dan pendapatan',
  ctaHref: '#contact',
  ctaLabel: 'Daftar Jadi Mitra',
};

/**
 * Hero (Partner Landing Page) — first-viewport marketing section (Server
 * Component) targeted entirely at Campsite Owners (Requirement 5.2): the
 * headline and subcopy speak directly to reservation/commission management,
 * not to Guest-facing search/booking language.
 *
 * Reuses the same asymmetric two-column layout as the original single-page
 * `Hero.tsx` and the App Landing Page's `Hero.tsx`: copy column (~5/12)
 * beside an offset image column (~7/12) on desktop, stacking vertically on
 * mobile — the owner-dashboard mockup is a bounded, framed image rather
 * than a full-bleed background.
 *
 * The CTA is a single in-page anchor (`<a href="#contact">`) styled like
 * `Button`'s `primary` variant, relying on the global
 * `html { scroll-behavior: smooth }` rule to smooth-scroll down to this
 * page's Contact Form section — no store-badge links here, unlike the App
 * Landing Page's Hero, since `/mitra` has a single lead-capture CTA rather
 * than external download links. This keeps the component a pure Server
 * Component with zero client JS.
 *
 * The image itself is delegated to the existing `HeroImage` (`'use client'`)
 * component to reuse its `onError` broken-image fallback rather than
 * duplicating that logic.
 *
 * Renders this page's only `<h1>` (Requirement 13.8) — the eventual
 * `/mitra` page assembly must not render another `<h1>` elsewhere on the
 * page.
 */
export function Hero(props: Partial<PartnerHeroProps> = {}) {
  const { headline, subcopy, imageSrc, imageAlt, ctaHref, ctaLabel } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="hero" variant="default" compactTop>
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-8">
          {/* Copy column — ~5/12 on desktop */}
          <div className="w-full lg:w-5/12">
            <Reveal delay={0}>
              <h1 className="font-serif text-5xl leading-[1.05] text-brand-black sm:text-6xl lg:text-7xl">
                {headline}
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-md text-lg leading-[1.7] text-foreground-muted">
                {subcopy}
              </p>
            </Reveal>
            <Reveal delay={300}>
              <a
                href={ctaHref}
                className={[BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS.primary, 'mt-8'].join(' ')}
              >
                {ctaLabel}
              </a>
            </Reveal>
          </div>

          {/* Image column — ~7/12 on desktop, offset rather than centered */}
          <Reveal delay={200} offset={32} className="w-full lg:w-7/12 lg:translate-y-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md shadow-[var(--shadow-soft)] lg:ml-auto lg:max-w-[560px]">
              <HeroImage
                src={imageSrc}
                alt={imageAlt}
                width={800}
                height={1000}
                priority
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export default Hero;
