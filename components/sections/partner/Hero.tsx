import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
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
  headline: 'Anda membangun pengalaman menginap. Kami mengurus setiap reservasi.',
  subcopy:
    'Embun mencatat setiap reservasi dan pembayaran secara otomatis, jadi Anda bisa fokus mengelola bisnis outdoor Anda tanpa repot administrasi manual.',
  imageSrc: '/images/mitra1.png',
  imageAlt: 'Dashboard mitra Embun - Anda membangun pengalaman menginap, kami mengurus setiap reservasi',
  ctaHref: '#contact',
  ctaLabel: 'Gabung sekarang juga',
};

/**
 * Hero (Partner Landing Page) — first-viewport marketing section targeted at Campsite Owners.
 * Renders centered title, description, green CTA button, and mitra1.png dashboard screenshot below.
 */
export function Hero(props: Partial<PartnerHeroProps> = {}) {
  const { headline, subcopy, imageSrc, imageAlt, ctaHref, ctaLabel } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="hero" variant="default" compactTop className="pt-12 pb-16 lg:pt-16 lg:pb-24">
      <Container>
        <div className="flex flex-col items-center text-center">
          {/* Centered Title */}
          <Reveal delay={0}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] max-w-4xl mx-auto">
              {headline}
            </h1>
          </Reveal>

          {/* Centered Description */}
          <Reveal delay={150}>
            <p className="mt-6 text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              {subcopy}
            </p>
          </Reveal>

          {/* Centered CTA Button */}
          <Reveal delay={300}>
            <a
              href={ctaHref}
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#cbfd00] hover:bg-[#b8e600] text-[#0841b5] font-semibold px-8 py-3.5 text-base transition-all duration-200 shadow-sm active:scale-95"
            >
              {ctaLabel}
            </a>
          </Reveal>

          {/* Centered Hero Image below button (clean, transparent container without border or shadow) */}
          <Reveal delay={200} offset={32} className="w-full mt-12 sm:mt-16">
            <div className="relative w-full max-w-[1040px] mx-auto">
              <HeroImage
                src={imageSrc}
                alt={imageAlt}
                width={1899}
                height={947}
                priority
                className="w-full h-auto object-contain"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export default Hero;
