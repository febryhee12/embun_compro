import { Container } from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import { BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS } from '@/components/ui/Button';
import { HeroImage } from '@/components/sections/HeroImage';
import { partnerBenefits, partnerAccentPhoto } from '@/lib/content/portfolio';

/**
 * Portfolio — "Jadi Mitra Campsite Embun" partner-recruitment section
 * (Server Component, anchor id `#portfolio` kept so `SiteHeader`'s existing
 * nav link and any other in-page CTA targeting `#portfolio` still resolve).
 *
 * Embun has no real onboarded partners yet, so this section deliberately
 * does not present fictional partner photos/names as if they were existing
 * customers. Instead it recruits new supply: a headline + short pitch,
 * `partnerBenefits` rendered as a benefit list (reach, automated
 * reservations, transparent commission, no upfront cost — the actual
 * commission-based business model), one accent photo for visual interest,
 * and a prominent CTA that scrolls to `#contact`.
 *
 * The image reuses `HeroImage` (`'use client'`) purely for its existing
 * `onError` broken-image fallback, the same pattern already established by
 * `Hero.tsx`.
 */
export function Portfolio() {
  return (
    <Section id="portfolio" variant="default">
      <Container>
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-8">
          {/* Copy column */}
          <div className="w-full lg:w-6/12">
            <Reveal delay={0}>
              <h2 className="font-serif text-[2.5rem] leading-[1.1] text-foreground md:text-5xl">
                Jadi Mitra Campsite Embun
              </h2>
              <p className="mt-6 max-w-md text-lg leading-[1.7] text-foreground-muted">
                Daftarkan campsite Anda dan jangkau lebih banyak tamu. Embun mengurus reservasi
                dan komisi secara otomatis dan transparan, tanpa biaya di muka.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {partnerBenefits.map((benefit) => (
                  <li key={benefit.id}>
                    <p className="font-serif text-lg text-brand-black">{benefit.title}</p>
                    <p className="mt-1 text-sm leading-[1.6] text-foreground-muted">
                      {benefit.description}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={300}>
              <a
                href="#contact"
                className={[BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS.primary, 'mt-10'].join(' ')}
              >
                Daftarkan Campsite Sekarang
              </a>
            </Reveal>
          </div>

          {/* Accent photo column */}
          <Reveal delay={200} offset={32} className="w-full lg:w-6/12">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md shadow-[var(--shadow-soft)] lg:max-w-[480px]">
              <HeroImage
                src={partnerAccentPhoto.photoSrc}
                alt={partnerAccentPhoto.photoAlt}
                width={800}
                height={1000}
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export default Portfolio;
