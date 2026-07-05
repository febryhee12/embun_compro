import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Features from './Features';
import { appFeatures } from '@/lib/content/appFeatures';

/**
 * Validates: Requirements 3.2
 */
describe('Features (App Landing Page)', () => {
  it('renders every default appFeatures item title and description', () => {
    render(<Features />);

    for (const item of appFeatures) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
  });

  it('filters out an item missing title, description, or mockupSrc', () => {
    render(
      <Features
        items={[
          {
            id: 'complete',
            title: 'Item Lengkap',
            description: 'Deskripsi lengkap.',
            audience: 'guest',
            mockupSrc: '/images/mockups/complete.png',
            mockupAlt: 'Alt lengkap',
          },
          {
            id: 'missing-title',
            title: '',
            description: 'Deskripsi tanpa judul.',
            audience: 'guest',
            mockupSrc: '/images/mockups/missing.png',
            mockupAlt: 'Alt tanpa judul',
          },
        ]}
      />
    );

    expect(screen.getByText('Item Lengkap')).toBeInTheDocument();
    expect(screen.queryByText('Deskripsi tanpa judul.')).not.toBeInTheDocument();
  });

  it('renders the "Segera Hadir" badge only for comingSoon items', () => {
    render(<Features />);

    const comingSoonItems = appFeatures.filter((item) => item.comingSoon);
    const otherItems = appFeatures.filter((item) => !item.comingSoon);

    const badges = screen.getAllByText('Segera Hadir');
    expect(badges).toHaveLength(comingSoonItems.length);

    for (const item of otherItems) {
      const heading = screen.getByText(item.title);
      const row = heading.closest('div')?.parentElement;
      expect(row?.textContent).not.toContain('Segera Hadir');
    }
  });
});
