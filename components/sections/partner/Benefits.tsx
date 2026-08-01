import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
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
 */
export default function Benefits({
  heading = 'Yang Anda Dapatkan Sebagai Mitra',
  subcopy = 'Reservasi, ketersediaan, dan pendapatan tersusun lebih rapi, sehingga operasional campsite tetap mudah dipantau tanpa banyak pekerjaan manual.',
  items = partnerBenefits,
}: BenefitsProps = {}) {
  const visibleItems = items.filter(
    (item) =>
      Boolean(item.title) &&
      Boolean(item.description) &&
      Boolean(item.mockupSrc),
  );

  return (
    <Section id="benefits" variant="default" className="py-16 lg:py-24">
      <Container>
        {/* Centered Heading and Subcopy with Plus Jakarta Sans font */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
            {heading}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
            {subcopy}
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-16 md:mt-20 md:gap-24">
          {visibleItems.map((item, index) => {
            const imageFirst = index % 2 === 1;

            return (
              <Reveal
                key={item.id}
                as="article"
                delay={index * 100}
                className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12 lg:gap-16"
              >
                {/* Mockup Image Container — clean transparent wrapper without extra background card or border */}
                <div
                  className={[
                    'relative aspect-[4/3] w-full overflow-hidden md:w-1/2 flex items-center justify-center bg-transparent',
                    imageFirst ? 'md:order-2' : 'md:order-1',
                  ].join(' ')}
                >
                  <Image
                    src={item.mockupSrc}
                    alt={item.mockupAlt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-contain w-full h-full"
                    quality={90}
                  />
                </div>

                {/* Text Content */}
                <div
                  className={[
                    'w-full md:w-1/2',
                    imageFirst ? 'md:order-1' : 'md:order-2',
                  ].join(' ')}
                >
                  <h3 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base sm:text-lg leading-[1.7] text-foreground-muted">
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
