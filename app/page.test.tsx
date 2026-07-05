import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import Home from './page';

/**
 * Integration test for the App Landing Page (`/`) composition.
 *
 * Validates: Requirements 1.1, 1.3, 13.8
 */
describe('Home (App Landing Page composition)', () => {
  it('renders every section in the expected top-to-bottom order (Requirement 1.1)', () => {
    const { container } = render(<Home />);

    // Each section below renders a distinct `id`, set by the underlying
    // `Section` component — querying in document order and asserting the
    // ids come back in this exact sequence proves section order.
    const sectionIds = Array.from(container.querySelectorAll('section[id]')).map(
      (section) => section.id
    );

    expect(sectionIds).toEqual(['hero', 'features', 'screenshots', 'faq', 'download']);
  });

  it('renders no owner/commission/partnership proposition content (Requirement 1.3)', () => {
    const { container } = render(<Home />);

    // Requirement 1.3 forbids content that specifically targets Campsite
    // Owners — the partnership proposition, commission, and block
    // management — not the bare word "mitra" itself, which legitimately
    // appears in shared site chrome (header/footer nav to `/mitra`) and in
    // guest-facing FAQ copy describing the marketplace (e.g. "campsite dari
    // berbagai mitra Embun"). Checking for those specific owner-proposition
    // terms is what actually proves this content lives on `/mitra` instead.
    const text = container.textContent ?? '';
    const forbiddenTerms = ['komisi', 'kemitraan', 'Campsite Owner', 'manajemen blok'];

    for (const term of forbiddenTerms) {
      expect(text.toLowerCase()).not.toContain(term.toLowerCase());
    }
  });

  it('renders exactly one <h1>, matching the App Hero headline (Requirement 13.8)', () => {
    const { container } = render(<Home />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Cari dan Pesan Campsite Favoritmu, Semudah Itu');
  });
});
