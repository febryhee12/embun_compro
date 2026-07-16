import type { ReactNode } from 'react';

import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

export interface LegalLayoutProps {
  /** Page title, rendered as the page's single `<h1>` (Requirement 13.8). */
  title: string;
  /** ISO date string (e.g. "2025-01-15"), rendered human-readable. */
  lastUpdated: string;
  /** Policy body — structured HTML (`<h2>`, `<h3>`, `<p>`, `<ul>`, etc). */
  children: ReactNode;
}

/**
 * Formats an ISO date string (e.g. "2025-01-15") into human-readable
 * Indonesian long-form (e.g. "15 Januari 2025").
 */
function formatLastUpdated(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * LegalLayout — shared shell for all four Legal Pages (Server Component).
 *
 * Renders the page's serif `<h1>` title, a human-readable "last updated"
 * line, then the policy `children` styled with the site's typography scale
 * (Requirement 16.7 — legal content must not look like unstyled plain
 * text). Callers are responsible for rendering `LegalDisclaimer` themselves
 * (below the `lastUpdated` line, above `children`) — this component does
 * not render it.
 *
 * Nested policy markup (`<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<li>`,
 * `<strong>`, `<em>`, `<a>`/`<Link>`) is styled via descendant selectors on
 * the body wrapper rather than a `prose` plugin, matching the rest of the
 * site's hand-rolled Tailwind typography. Inline links (e.g. the
 * `/kebijakan-mitra` → `/kebijakan-refund` cross-reference) intentionally
 * get their brand color/underline from this shared selector rather than a
 * per-instance `className`, so page authors can't accidentally ship an
 * unstyled `<Link>`/`<a>` inside legal body copy.
 */
export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <Section id="legal" variant="default" compactTop={true}>
      <Container>
        <h1 className="font-serif text-[2.5rem] font-medium leading-[1.1] text-brand-black md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-[1.5] text-foreground-muted">
          Terakhir diperbarui: {formatLastUpdated(lastUpdated)}
        </p>

        <div
          className={[
            'mt-10 max-w-2xl text-base leading-[1.7] text-foreground-muted',
            '[&>*:first-child]:mt-0',
            '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-[1.875rem]',
            '[&_h2]:font-medium [&_h2]:leading-[1.15] [&_h2]:text-brand-black [&_h2]:md:text-4xl',
            '[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-sans [&_h3]:text-xl',
            '[&_h3]:font-semibold [&_h3]:leading-[1.3] [&_h3]:text-brand-black [&_h3]:md:text-2xl',
            '[&_p]:mt-4 [&_p]:leading-[1.7]',
            '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6',
            '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6',
            '[&_li]:leading-[1.7]',
            '[&_strong]:font-semibold [&_strong]:text-foreground',
            '[&_em]:italic',
            '[&_a]:text-brand-blue [&_a]:underline [&_a]:transition-colors [&_a]:hover:text-brand-blue-hover',
          ].join(' ')}
        >
          {children}
        </div>
      </Container>
    </Section>
  );
}

export default LegalLayout;
