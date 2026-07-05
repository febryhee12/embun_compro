import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';

export interface EmptyStateProps {
  message?: string;
}

const DEFAULT_MESSAGE = 'Belum ada mitra yang ditampilkan saat ini';

/**
 * PartnerDirectoryEmptyState — Server Component rendered in place of
 * `PartnerGrid` on the Partner Directory page when the resolved partner
 * list is empty (Requirement 6.4).
 *
 * Renders an informative empty-state block rather than a blank/silent void,
 * so Visitors understand the directory is intentionally empty rather than
 * broken. Wrapped in the shared `Section` primitive — like `PartnerGrid` —
 * so it gets the same `clamp(6rem, 12vw, 12rem)` vertical rhythm as every
 * other section on the site, instead of a bespoke `py-24` value
 * (Requirement 16.6).
 */
export function PartnerDirectoryEmptyState({ message = DEFAULT_MESSAGE }: EmptyStateProps) {
  return (
    <Section id="partner-grid-empty" variant="default">
      <Container>
        <p className="text-center text-lg leading-[1.7] text-foreground-muted">{message}</p>
      </Container>
    </Section>
  );
}
