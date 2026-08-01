import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MitraPage from './page';

/**
 * Integration test for the Partner Landing Page (`/mitra`) composition.
 *
 * Validates: Requirements 5.1, 5.5, 13.8
 */
describe('MitraPage (Partner Landing Page composition)', () => {
  async function renderMitraPage() {
    return render(await MitraPage({ params: Promise.resolve({ lang: 'id' }) }));
  }

  it('renders every section in the expected top-to-bottom order (Requirement 5.1)', async () => {
    const { container } = await renderMitraPage();

    // Each section below renders a distinct `id`, set by the underlying
    // `Section` component — querying in document order and asserting the
    // ids come back in this exact sequence proves section order.
    const sectionIds = Array.from(
      container.querySelectorAll('section[id]'),
    ).map((section) => section.id);

    expect(sectionIds).toEqual([
      'hero',
      'supported-types',
      'benefits',
      'how-to-join',
      'faq',
      'cta',
    ]);
  });

  it('renders the Contact Form on this page, not on `/` (Requirement 5.5)', async () => {
    const { container } = await renderMitraPage();

    // Contact Form fields, queried by their input `id` (see ContactForm.tsx /
    // Field.tsx) since some labels render a trailing " *" text node for
    // required fields, and "Nama" vs "Nama campsite (opsional)" would
    // otherwise collide on a loose text match.
    expect(document.getElementById('name')).toBeInTheDocument();
    expect(document.getElementById('email')).toBeInTheDocument();
    expect(document.getElementById('phone')).toBeInTheDocument();
    expect(document.getElementById('message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Kirim pesan' }),
    ).toBeInTheDocument();

    // The `#contact` anchor is unique and points at the form block, not the
    // FAQ wrapper above it.
    const contactAnchors = container.querySelectorAll('#contact');
    expect(contactAnchors).toHaveLength(1);
    expect(contactAnchors[0]?.querySelector('form')).not.toBeNull();
  });

  it('renders exactly one <h1>, matching the partner Hero headline (Requirement 13.8)', async () => {
    const { container } = await renderMitraPage();

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(
      'Anda membangun pengalaman menginap. Kami mengurus setiap reservasi.',
    );
  });
});
