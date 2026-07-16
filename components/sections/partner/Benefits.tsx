import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { MockupImage } from '@/components/ui/MockupImage';
import {
  partnerBenefits,
  type PartnerBenefitItem,
} from '@/lib/content/partnerBenefits';

export interface BenefitsProps {
  heading?: string;
  subcopy?: string;
  items?: PartnerBenefitItem[];
}

/**
 * Benefits — the relocated "Features for Owners" content, reframed for the
 * standalone Partner landing page (Server Component).
 *
 * Requirement 5.3: ports the same minimalist alternating-row layout used by
 * the homepage `Features.tsx` section (mockup image + text per row,
 * alternating sides, hairline border on mobile, subtle shadow instead of a
 * boxed card) rather than introducing a new visual pattern. Unlike
 * `Features.tsx`, there is no audience badge since every item here is
 * already owner-focused by definition — `partnerBenefits` content has no
 * `audience` field.
 *
 * Items are defensively filtered on title/description/mockupSrc for the
 * same robustness the homepage section has, even though the current
 * `partnerBenefits` content always has all three fields populated.
 */
export default function Benefits({
  heading = 'Yang Anda Dapatkan Sebagai Mitra',
  subcopy = 'Booking, ketersediaan, dan pendapatan tersusun lebih rapi, sehingga operasional campsite tetap mudah dipantau tanpa banyak pekerjaan manual.',
  items = partnerBenefits,
}: BenefitsProps = {}) {
  const visibleItems = items.filter(
    (item) =>
      Boolean(item.title) &&
      Boolean(item.description) &&
      Boolean(item.mockupSrc),
  );

  return (
    <Section id="benefits" variant="default">
      <Container>
        <h2 className="font-serif text-[2.5rem] leading-[1.1] text-brand-black md:text-5xl">
          {heading}
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-[1.7] text-foreground-muted">
          {subcopy}
        </p>

        <div className="mt-12 flex flex-col gap-16 md:mt-16 md:gap-20">
          {visibleItems.map((item, index) => {
            const imageFirst = index % 2 === 1;

            return (
              <Reveal
                key={item.id}
                as="article"
                delay={index * 100}
                className="flex flex-col gap-8 border-l border-border/30 pl-6 md:flex-row md:items-center md:gap-12 md:border-l-0 md:pl-0"
              >
                <div
                  className={[
                    'relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.08)] md:w-1/2',
                    imageFirst ? 'md:order-2' : 'md:order-1',
                  ].join(' ')}
                >
                  <MockupImage
                    src={item.mockupSrc}
                    alt={item.mockupAlt}
                    variant="wide"
                    label={item.title}
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>

                <div
                  className={[
                    'w-full md:w-1/2',
                    imageFirst ? 'md:order-1' : 'md:order-2',
                  ].join(' ')}
                >
                  <h3 className="font-sans text-2xl font-semibold text-brand-black">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-[1.7] text-foreground-muted">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
