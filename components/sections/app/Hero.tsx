import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { StoreBadge } from '@/components/ui/StoreBadge';
import { MockupImage } from '@/components/ui/MockupImage';
import { Reveal } from '@/components/ui/Reveal';

/** Shared focus-visible ring for the store-badge anchors (Requirement 8.7). */
const FOCUS_VISIBLE_CLASS =
  'rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-2';

export interface AppHeroProps {
  eyebrow?: string; // short brand tagline shown above the headline
  headline: string; // ≤10 words, guest value prop
  subcopy: string; // ≤2 sentences
  imageSrc: string;
  imageAlt: string;
  appStoreHref: string;
  googlePlayHref: string;
  appStoreLead?: string;
  googlePlayLead?: string;
}

const DEFAULT_PROPS: AppHeroProps = {
  eyebrow: undefined,
  headline: 'Cari dan Pesan Campsite Favoritmu, Semudah Itu',
  subcopy:
    'Apapun gaya liburan alammu, mulai dari camping seru, glamping, sampai staycation di cabin, Embun App bantu kamu menemukan dan memesannya dalam hitungan menit. Bayar aman, pesanan langsung terkonfirmasi.',
  // NOTE: placeholder path — no real app screenshot asset exists yet. A
  // later content/asset task must supply the actual mockup at this path.
  imageSrc: '/images/app-hero-mockup.png',
  imageAlt: 'Tangkapan layar Embun App menampilkan hasil pencarian campsite',
  appStoreHref: 'https://apps.apple.com/app/embun',
  googlePlayHref: 'https://play.google.com/store/apps/details?id=app.embun',
};

/**
 * Hero (App Landing Page) — first-viewport marketing section (Server
 * Component) targeted entirely at Guest audiences (Requirement 1.3): no
 * copy about campsite/owner management appears here.
 *
 * Reuses the same asymmetric two-column layout as the single-page
 * `Hero.tsx`: copy column (~5/12) beside an offset image column (~7/12) on
 * desktop, stacking vertically on mobile — the app screenshot/mockup is a
 * bounded, framed image rather than a full-bleed background (Requirement
 * 2.2).
 *
 * Renders two download CTAs (App Store, Google Play) as plain
 * `<a target="_blank" rel="noopener noreferrer">` links styled like
 * `Button`'s `ghost` variant, each opening the respective store link in a
 * new tab (Requirement 2.4) without needing any client JS.
 *
 * The image itself is delegated to the existing `HeroImage` (`'use client'`)
 * component to reuse its `onError` broken-image fallback (Requirement 2.5/2.6)
 * rather than duplicating that logic.
 */
export function Hero(props: Partial<AppHeroProps> = {}) {
  const {
    eyebrow,
    headline,
    subcopy,
    imageSrc,
    imageAlt,
    appStoreHref,
    googlePlayHref,
    appStoreLead,
    googlePlayLead,
  } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="hero" variant="default" compactTop>
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-8">
          {/* Copy column — ~5/12 on desktop */}
          <div className="w-full lg:w-5/12">
            {eyebrow ? (
              <Reveal delay={0}>
                <p className="font-medium tracking-wide text-brand-blue">
                  {eyebrow}
                </p>
              </Reveal>
            ) : null}
            <Reveal delay={100}>
              <h1 className="mt-2 font-serif text-5xl leading-[1.05] text-brand-black sm:text-6xl lg:text-7xl">
                {headline}
              </h1>
            </Reveal>
            <Reveal delay={250}>
              <p className="mt-6 max-w-md text-lg leading-[1.7] text-foreground-muted">
                {subcopy}
              </p>
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={appStoreHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Unduh Embun App di App Store"
                  className={FOCUS_VISIBLE_CLASS}
                >
                  <StoreBadge store="apple" lead={appStoreLead} />
                </a>
                <a
                  href={googlePlayHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Dapatkan Embun App di Google Play"
                  className={FOCUS_VISIBLE_CLASS}
                >
                  <StoreBadge store="google" lead={googlePlayLead} />
                </a>
              </div>
            </Reveal>
          </div>

          {/* Image column — ~7/12 on desktop, offset rather than centered */}
          <Reveal
            delay={200}
            offset={32}
            className="w-full lg:w-7/12 lg:translate-y-6"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md shadow-[var(--shadow-soft)] lg:ml-auto lg:max-w-[560px]">
              <MockupImage
                src={imageSrc}
                alt={imageAlt}
                variant="phone"
                sizes="(min-width: 1024px) 560px, 100vw"
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
