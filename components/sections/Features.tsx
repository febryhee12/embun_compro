import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import {
  features as featureItems,
  type FeatureItem,
} from '@/lib/content/features';

const AUDIENCE_LABEL: Record<FeatureItem['audience'], string> = {
  owner: 'Untuk Pemilik',
  guest: 'Untuk Tamu',
  both: 'Untuk Semua',
};

export interface FeaturesProps {
  items?: FeatureItem[];
}

/**
 * Features — asymmetric/minimalist list of Embun platform capabilities
 * (Server Component).
 *
 * Requirement 4.3 mandates that a feature only renders when it has all
 * three of title, description, and mockupSrc — so the content array is
 * defensively filtered before render (guards against future content edits
 * that might drop a field, even though the current `features` content
 * always has all three).
 *
 * Layout is a minimalist stacked list rather than a grid of uniform boxy
 * cards (Requirement 4.4): each feature is a horizontal row (mockup image
 * + text) on desktop, alternating which side the image sits on per row for
 * an asymmetric rhythm, separated by a subtle hairline border instead of a
 * boxed card with heavy shadow. On mobile (≤768px, below `md`) rows
 * collapse to a single column — image above text — while keeping the same
 * minimalist visual language (Requirement 4.6). No fixed heights are used
 * anywhere so text can wrap naturally without clipping.
 *
 * Images use `fill` rather than explicit `width`/`height` (Requirement 9.2)
 * because each mockup renders inside a responsive `aspect-[4/3]` container
 * that already reserves its box before the image loads — this prevents
 * layout shift just as effectively as fixed dimensions, while letting the
 * image scale fluidly with its parent instead of a static intrinsic size.
 */
export default function Features({ items = featureItems }: FeaturesProps = {}) {
  const visibleItems = items.filter(
    (item) =>
      Boolean(item.title) &&
      Boolean(item.description) &&
      Boolean(item.mockupSrc),
  );

  return (
    <Section id="features" variant="default">
      <Container>
        <h2 className="font-serif text-[2.5rem] leading-[1.1] text-brand-black md:text-5xl">
          Fitur Utama
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-[1.7] text-foreground-muted">
          Alat yang dirancang untuk operasional campsite yang lebih tenang, dan
          pengalaman tamu yang lebih mudah.
        </p>

        <div className="mt-12 flex flex-col gap-16 md:mt-16 md:gap-20">
          {visibleItems.map((item, index) => {
            const imageFirst = index % 2 === 1;

            return (
              <Reveal
                key={item.id}
                as="article"
                delay={index * 100}
                className="flex flex-col gap-8 border-l border-border/30 md:flex-row md:items-center md:gap-12 md:border-l-0 md:pl-0"
              >
                <div
                  className={[
                    'relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.08)] md:w-1/2',
                    imageFirst ? 'md:order-2' : 'md:order-1',
                  ].join(' ')}
                >
                  <Image
                    src={item.mockupSrc}
                    alt={item.mockupAlt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div
                  className={[
                    'w-full md:w-1/2',
                    imageFirst ? 'md:order-1' : 'md:order-2',
                  ].join(' ')}
                >
                  <span className="inline-block text-xs font-medium uppercase tracking-wide text-brand-blue">
                    {AUDIENCE_LABEL[item.audience]}
                  </span>
                  <h3 className="mt-2 font-sans text-2xl font-semibold text-brand-black">
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
