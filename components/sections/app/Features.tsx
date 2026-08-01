import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { MockupImage } from '@/components/ui/MockupImage';
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
  headline = 'Camping seru anti ribet.',
  subcopy = 'Dari mencari spot hingga bayar, semua bisa dilakukan langsung dari genggaman tanpa perlu bolak-balik telepon pemilik campsite.',
  comingSoonLabel = 'Segera Hadir',
  items = appFeatures,
}: AppFeaturesProps = {}) {
  const visibleItems = items.filter(
    (item) =>
      Boolean(item.title) &&
      Boolean(item.description) &&
      Boolean(item.mockupSrc),
  );

  return (
    <Section id="features" variant="default" className="py-16 lg:py-24">
      <Container>
        {/* Centered Heading and Subcopy */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
            {headline}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed">
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
                {/* Mockup Container — clean transparent wrapper so image asset renders without double background */}
                <div
                  className={[
                    'relative aspect-[4/3] w-full overflow-hidden rounded-2xl md:w-1/2 flex items-center justify-center bg-transparent',
                    imageFirst ? 'md:order-2' : 'md:order-1',
                  ].join(' ')}
                >
                  <MockupImage
                    src={item.mockupSrc}
                    alt={item.mockupAlt}
                    variant="wide"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    label={item.title}
                    className="object-contain w-full h-full"
                  />
                </div>

                <div
                  className={[
                    'w-full md:w-1/2',
                    imageFirst ? 'md:order-1' : 'md:order-2',
                  ].join(' ')}
                >
                  {item.comingSoon ? (
                    <span className="inline-block rounded-full bg-[#cbfd00] px-3.5 py-1 text-xs font-semibold text-[#0841b5] mb-3 shadow-xs">
                      {comingSoonLabel}
                    </span>
                  ) : null}
                  <h3 className="font-sans text-2xl font-bold text-brand-black sm:text-3xl">
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
