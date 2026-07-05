import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { appFeatures, type AppFeatureItem } from '@/lib/content/appFeatures';

export interface AppFeaturesProps {
  headline?: string;
  subcopy?: string;
  comingSoonLabel?: string;
  items?: AppFeatureItem[];
}

/**
 * app/Features — asymmetric/minimalist list of Embun App guest-facing
 * features (Server Component), ported from the shared-platform
 * `components/sections/Features.tsx` layout but scoped to App Landing Page
 * content (Requirements 3.1–3.7).
 *
 * A feature only renders when it has all three of title, description, and
 * mockupSrc (Requirement 3.6) — this completeness gate applies even to
 * `comingSoon` items; `appFeatures.ts` already guarantees the AI assistant
 * entry has all three, so it passes the filter and renders like any other
 * feature, just with an additional badge.
 *
 * Items with `comingSoon: true` render a clearly visible "Segera Hadir"
 * badge using the `--brand-lime` accent token, reserved sitewide for
 * badges/highlights (Requirements 3.6, 3.7). The badge is purely additive —
 * it never excludes an item from the completeness filter above. Since every
 * item on this page is guest-only (`audience: 'guest'` always), the
 * owner/guest `AUDIENCE_LABEL` badge from the original Features.tsx is
 * dropped; its slot is repurposed for the "Segera Hadir" badge only,
 * rendering nothing for non-comingSoon items to keep row layout consistent.
 *
 * Layout, imagery, and spacing rules are otherwise identical to the ported
 * component: minimalist alternating rows (image side alternates per row),
 * hairline border on mobile instead of boxy cards, subtle shadow
 * (`shadow-[0_2px_12px_rgba(0,0,0,0.08)]`) matching the 4–8px radius /
 * subtle-shadow brand rule, single-column stacking on mobile, and `fill`
 * images inside a reserved `aspect-[4/3]` box to avoid layout shift.
 */
export default function Features({
  headline = 'Fitur yang Bikin Camping Lebih Mudah',
  subcopy = 'Dari mencari spot hingga bayar, semua bisa dilakukan langsung dari genggaman tanpa perlu bolak-balik telepon pemilik campsite.',
  comingSoonLabel = 'Segera Hadir',
  items = appFeatures
}: AppFeaturesProps = {}) {
  const visibleItems = items.filter(
    (item) => Boolean(item.title) && Boolean(item.description) && Boolean(item.mockupSrc)
  );

  return (
    <Section id="features" variant="default">
      <Container>
        <h2 className="font-serif text-[2.5rem] leading-[1.1] text-brand-black md:text-5xl">
          {headline}
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
                  {item.comingSoon ? (
                    <span className="inline-block rounded-full bg-brand-lime px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
                      {comingSoonLabel}
                    </span>
                  ) : null}
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
