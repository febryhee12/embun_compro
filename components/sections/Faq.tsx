import { Container } from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildFaqJsonLd } from '@/lib/seo/structuredData';
import type { FaqItem } from '@/lib/content/appFaq';

export interface FaqProps {
  items: FaqItem[];
  heading?: string;
}

/**
 * Faq — shared FAQ section (Server Component), used by both the App
 * Landing Page (with `appFaq` content) and the Partner Landing Page (with
 * `partnerFaq` content), satisfying Requirement 14.2 (at least one FAQ
 * section per page) and 14.6 (self-contained answers).
 *
 * `items` is a required prop rather than defaulted, since this component
 * is shared across two pages with two distinct content sets — callers must
 * be explicit about which FAQ content they render.
 *
 * Rendered as a plain, fully-visible question/answer list rather than a
 * collapsed accordion: interactivity would require client JS, and
 * Requirement 14.4 mandates that main textual content (including FAQ) be
 * readable as static HTML without JavaScript execution. A plain, always-
 * expanded Q&A list is also safer for AEO/crawlability than content hidden
 * behind client-side toggle state.
 *
 * JSON-LD `FAQPage` structured data (Requirement 14.3) is emitted inline
 * via `JsonLd`/`buildFaqJsonLd`, covering both the App Landing Page's Faq
 * (`appFaq`) and the Partner Landing Page's Faq (`partnerFaq`) since both
 * render this same shared component.
 */
export default function Faq({ items, heading = 'Pertanyaan yang Sering Diajukan' }: FaqProps) {
  return (
    <Section id="faq" variant="muted">
      <JsonLd data={buildFaqJsonLd(items)} />
      <Container>
        <h2 className="font-serif text-[2.5rem] leading-[1.1] text-brand-black md:text-5xl">
          {heading}
        </h2>

        <div className="mt-12 flex flex-col gap-10 md:mt-16">
          {items.map((item, index) => (
            <Reveal key={item.question} delay={index * 100} className="max-w-2xl">
              <h3 className="font-sans text-xl font-semibold text-brand-black">
                {item.question}
              </h3>
              <p className="mt-3 text-base leading-[1.7] text-foreground-muted">
                {item.answer}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
