import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS } from '@/components/ui/Button';
import { HeroImage } from '@/components/sections/HeroImage';
import { Reveal } from '@/components/ui/Reveal';

export interface HeroProps {
  headline: string;
  subcopy: string;
  imageSrc: string;
  imageAlt: string;
  ctaHref: string; // e.g. '#contact'
  ctaLabel: string; // e.g. 'Hubungi Kami'
}

const DEFAULT_PROPS: HeroProps = {
  headline: 'Temukan dan Kelola Campsite dengan Mudah',
  subcopy:
    'Embun menghubungkan tamu dengan campsite terbaik, dan membantu pemilik campsite mengelola reservasi.',
  // NOTE: placeholder path — no real asset exists yet. A later content/asset
  // task must supply the actual campsite photo at this path.
  imageSrc: '/images/hero-campsite.jpg',
  imageAlt: 'Area perkemahan asri Embun dengan tenda-tenda di antara pepohonan hijau',
  ctaHref: '#contact',
  ctaLabel: 'Hubungi Kami',
};

/**
 * Hero — first-viewport marketing section (Server Component).
 *
 * Asymmetric two-column layout: copy column (~5/12) beside an offset image
 * column (~7/12) on desktop, stacking vertically on mobile — the campsite
 * photo is a bounded, framed image rather than a full-bleed background
 * (Requirement 2.2). The CTA is a plain `<a href="#contact">` styled like
 * `Button`'s `primary` variant; it relies on the global
 * `html { scroll-behavior: smooth }` rule (see `app/globals.css`) to smooth
 * scroll to the Contact Form section without needing any client JS
 * (Requirement 2.4), which keeps this component a pure Server Component.
 *
 * The image itself is delegated to `HeroImage` (`'use client'`) purely to
 * isolate the `onError` broken-image fallback (Requirement 2.5).
 */
export function Hero(props: Partial<HeroProps> = {}) {
  const { headline, subcopy, imageSrc, imageAlt, ctaHref, ctaLabel } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="hero" variant="default">
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
