import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { StoreBadge } from '@/components/ui/StoreBadge';
import { Reveal } from '@/components/ui/Reveal';
import Image from 'next/image';

/** Shared focus-visible ring for store buttons (Requirement 8.7). */
const FOCUS_VISIBLE_CLASS =
  'rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-2';

export interface AppHeroProps {
  eyebrow?: string;
  headline: string;
  subcopy: string;
  imageSrc: string;
  imageAlt: string;
  appStoreHref: string;
  googlePlayHref: string;
  appStoreLead?: string;
  googlePlayLead?: string;
}

const DEFAULT_PROPS: AppHeroProps = {
  eyebrow: undefined,
  headline: 'Jelajah Tanpa Batas, Reservasi Tanpa Cemas.',
  subcopy:
    'Embun App membantu kamu menemukan dan memesan campsite terbaik dalam hitungan menit. Bayar aman, pesanan langsung terkonfirmasi.',
  imageSrc: '/images/embun_1.png',
  imageAlt: 'Embun App - Jelajah tanpa batas, reservasi tanpa cemas',
  appStoreHref: '',
  googlePlayHref: '',
  appStoreLead: 'Segera Hadir',
  googlePlayLead: 'Segera Hadir',
};

/**
 * Hero (App Landing Page) — 12 Column Grid layout matching client specifications.
 *
 * Left column (5 out of 12 cols):
 * - Headline ("Jelajah Tanpa Batas, Reservasi Tanpa Cemas.")
 * - Subcopy ("Embun App membantu kamu menemukan dan memesan campsite terbaik...")
 * - Action buttons ("StoreBadge" for App Store and Google Play)
 *
 * Right column (7 out of 12 cols):
 * - Clean Embun Hero image (embun_1.png) without green card wrapper.
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
    <Section id="hero" variant="default" compactTop className="py-6 sm:py-10 lg:py-14">
      <Container>
        {/* 12-Column Grid Layout */}
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: 5 of 12 columns on desktop */}
          <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
            {eyebrow ? (
              <Reveal delay={0}>
                <p className="font-medium tracking-wide text-brand-blue mb-3">
                  {eyebrow}
                </p>
              </Reveal>
            ) : null}
            <Reveal delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
                {headline}
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-6 text-base sm:text-lg text-foreground-muted leading-relaxed max-w-lg">
                {subcopy}
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={appStoreHref || undefined}
                  target={appStoreHref ? '_blank' : undefined}
                  rel={appStoreHref ? 'noopener noreferrer' : undefined}
                  aria-label="Unduh Embun App di App Store"
                  className={`${FOCUS_VISIBLE_CLASS} ${!appStoreHref ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  <StoreBadge store="apple" lead={appStoreLead} />
                </a>
                <a
                  href={googlePlayHref || undefined}
                  target={googlePlayHref ? '_blank' : undefined}
                  rel={googlePlayHref ? 'noopener noreferrer' : undefined}
                  aria-label="Dapatkan Embun App di Google Play"
                  className={`${FOCUS_VISIBLE_CLASS} ${!googlePlayHref ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  <StoreBadge store="google" lead={googlePlayLead} />
                </a>
              </div>
            </Reveal>




          </div>

          {/* Right Column: 7 of 12 columns on desktop */}
          <Reveal delay={200} offset={20} className="col-span-12 lg:col-span-7 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[680px]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={1200}
                height={800}
                className="w-full h-auto object-contain rounded-2xl"
                priority
                sizes="(min-width: 1024px) 680px, 100vw"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export default Hero;

