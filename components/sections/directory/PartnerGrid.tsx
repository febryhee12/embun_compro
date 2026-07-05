import type { PartnerDirectoryItem } from '@/lib/partners/types';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import PartnerCard from './PartnerCard';

export interface PartnerGridProps {
  items: PartnerDirectoryItem[];
}

/**
 * PartnerGrid — Server Component rendering the Partner Directory as a
 * responsive grid of `PartnerCard`s.
 *
 * Mobile (≤768px, i.e. below Tailwind's `md` breakpoint) shows 2 columns per
 * Requirement 6.7, scaling up to 3 columns on `sm` and 4 columns on `md` and
 * above. Assumes `items` is non-empty; the calling page is responsible for
 * choosing between `PartnerGrid` and `PartnerDirectoryEmptyState`.
 *
 * Wrapped in the shared `Section` primitive (like every other section
 * component in the site) so it gets the same `clamp(6rem, 12vw, 12rem)`
 * vertical rhythm as the rest of the page, instead of sitting flush against
 * its neighbors (Requirement 16.6).
 */
export default function PartnerGrid({ items }: PartnerGridProps) {
  return (
    <Section id="partner-grid" variant="default">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
          {items.map((item) => (
            <PartnerCard item={item} key={item.id} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
