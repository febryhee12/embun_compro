import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PartnerCard from './PartnerCard';
import type { PartnerDirectoryItem } from '@/lib/partners/types';

/**
 * Validates: Requirements 6.4, 6.5, 6.6, 6.7
 */
describe('PartnerCard', () => {
  it('renders the partner name and logo image when logoSrc is present', () => {
    const item: PartnerDirectoryItem = {
      id: '1',
      name: 'Sawarna Camp',
      logoSrc: '/images/partners/sawarna.png',
      logoAlt: 'Logo Sawarna Camp',
    };

    render(<PartnerCard item={item} />);

    expect(screen.getByText('Sawarna Camp')).toBeInTheDocument();
    expect(screen.getByAltText('Logo Sawarna Camp')).toBeInTheDocument();
  });

  it('renders an initials placeholder when logoSrc is absent', () => {
    const item: PartnerDirectoryItem = {
      id: '2',
      name: 'Embun Camp',
      logoAlt: 'Logo Embun Camp',
    };

    render(<PartnerCard item={item} />);

    const placeholder = screen.getByRole('img', { name: 'Logo Embun Camp' });
    expect(placeholder).toBeInTheDocument();
    expect(placeholder.tagName).not.toBe('IMG');
    expect(placeholder).toHaveTextContent('EC');
  });

  it('falls back to the initials placeholder when the logo image fails to load (Requirement 6.6)', () => {
    const item: PartnerDirectoryItem = {
      id: '3',
      name: 'Sawarna Camp',
      logoSrc: '/images/partners/broken.png',
      logoAlt: 'Logo Sawarna Camp',
    };

    render(<PartnerCard item={item} />);

    const image = screen.getByAltText('Logo Sawarna Camp');
    fireEvent.error(image);

    expect(screen.queryByAltText('Logo Sawarna Camp')).not.toBeInTheDocument();
    const placeholder = screen.getByRole('img', { name: 'Logo Sawarna Camp' });
    expect(placeholder.tagName).not.toBe('IMG');
    expect(placeholder).toHaveTextContent('SC');
  });

  it('renders as a link with target="_blank" when item.href is present', () => {
    const item: PartnerDirectoryItem = {
      id: '4',
      name: 'Sawarna Camp',
      logoAlt: 'Logo Sawarna Camp',
      href: 'https://sawarna.example.com',
    };

    render(<PartnerCard item={item} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://sawarna.example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders as a non-link div when item.href is absent', () => {
    const item: PartnerDirectoryItem = {
      id: '5',
      name: 'Sawarna Camp',
      logoAlt: 'Logo Sawarna Camp',
    };

    render(<PartnerCard item={item} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
