import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Benefits from './Benefits';
import { partnerBenefits } from '@/lib/content/partnerBenefits';

/**
 * Validates: Requirements 5.3
 */
describe('Benefits (Partner Landing Page)', () => {
  it('renders every default partnerBenefits item title', () => {
    render(<Benefits />);

    for (const item of partnerBenefits) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
  });

  it('filters out an item missing title, description, or mockupSrc', () => {
    render(
      <Benefits
        items={[
          {
            id: 'complete',
            title: 'Item Lengkap',
            description: 'Deskripsi lengkap.',
            mockupSrc: '/images/mockups/complete.png',
            mockupAlt: 'Alt lengkap',
          },
          {
            id: 'missing-title',
            title: '',
            description: 'Deskripsi tanpa judul.',
            mockupSrc: '/images/mockups/missing.png',
            mockupAlt: 'Alt tanpa judul',
          },
        ]}
      />
    );

    expect(screen.getByText('Item Lengkap')).toBeInTheDocument();
    expect(screen.queryByText('Deskripsi tanpa judul.')).not.toBeInTheDocument();
  });
});
