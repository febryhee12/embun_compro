import Link from 'next/link';

import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import {
  BUTTON_BASE_CLASS,
  BUTTON_VARIANT_CLASS,
} from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';

export interface DirectoryTeaserProps {
  heading: string;
  subcopy: string;
  directoryHref: string; // '/mitra/direktori'
  ctaLabel: string;
}

const DEFAULT_PROPS: DirectoryTeaserProps = {
  heading: 'Direktori Mitra Segera Hadir',
  subcopy:
    'Kami sedang menyiapkan direktori mitra Embun. Jadilah salah satu campsite pertama yang bergabung.',
  directoryHref: '/mitra/direktori',
  ctaLabel: 'Lihat Direktori',
};

/**
 * DirectoryTeaser — compact social-proof link section (Server Component).
 *
 * Sits between Benefits and Faq on the Partner Landing Page. Unlike
 * Hero/Benefits, this is intentionally a lightweight teaser: a short
 * heading, one-sentence subcopy, and a clear link to the Partner
 * Directory (`/mitra/direktori`) so prospective owners can see existing
 * partners before committing (Requirement 5.4).
 *
 * The link is styled with `BUTTON_VARIANT_CLASS.ghost` — not `primary` —
 * so it reads as a secondary CTA and doesn't compete visually with the
 * page's main Contact Form CTA. `variant="muted"` gives this section a
 * distinct background from the `default` Hero/Benefits sections above it
 * for visual rhythm (Requirement 1.7/10.6 handled by `Section`).
 */
export function DirectoryTeaser(props: Partial<DirectoryTeaserProps> = {}) {
  const { heading, subcopy, directoryHref, ctaLabel } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="directory-teaser" variant="muted">
      <Container>
        <Reveal>
          <div className="max-w-xl text-left">
            <h2 className="font-serif text-3xl leading-[1.15] text-brand-black md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-[1.7] text-foreground-muted">
              {subcopy}
            </p>
            <div className="mt-6">
              <Link
                href={directoryHref}
                className={[BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS.ghost].join(
                  ' ',
                )}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export default DirectoryTeaser;
