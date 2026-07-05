import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { screenshots as screenshotItems, type ScreenshotItem } from '@/lib/content/screenshots';

export interface ScreenshotsProps {
  items?: ScreenshotItem[]; // ≥3 items required
}

/**
 * Screenshots (App Landing Page) — "Tangkapan Layar" section (Server
 * Component) showing the core guest flow: search → campsite detail →
 * checkout (Requirement 4.1).
 *
 * Rendered as a static grid rather than an interactive carousel/slider so
 * this stays a Server Component with no client JS needed, in line with the
 * design's "Server Components for all static marketing content" principle.
 * Each screenshot sits in a portrait `aspect-[9/16]` frame (phone-screenshot
 * shaped), with brand-radius rounded corners and a soft shadow, and uses
 * `Reveal` with an `index * 100` stagger for a subtle scroll-in effect,
 * matching the pattern already established in `Features.tsx`.
 */
export default function Screenshots({ items = screenshotItems }: ScreenshotsProps = {}) {
  return (
    <Section id="screenshots" variant="muted">
      <Container>
        <h2 className="font-serif text-[2.5rem] leading-[1.1] text-brand-black md:text-5xl">
          Lihat Tampilan Aslinya
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-[1.7] text-foreground-muted">
          Dari mencari campsite, melihat detailnya, hingga menyelesaikan pemesanan — semua
          berlangsung mulus di dalam Embun App.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} as="figure" delay={index * 100} className="flex flex-col gap-4">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              {item.caption && (
                <figcaption className="text-center text-sm leading-[1.6] text-foreground-muted">
                  {item.caption}
                </figcaption>
              )}
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
