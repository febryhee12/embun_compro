import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import PartnerGrid from './PartnerGrid';
import type { PartnerDirectoryItem } from '@/lib/partners/types';

/**
 * Validates: Requirements 6.4, 6.5, 6.7
 */
describe('PartnerGrid', () => {
  const items: PartnerDirectoryItem[] = [
    { id: '1', name: 'Sawarna Camp', logoAlt: 'Logo Sawarna Camp' },
    { id: '2', name: 'Embun Camp', logoAlt: 'Logo Embun Camp' },
    { id: '3', name: 'Ranca Upas', logoAlt: 'Logo Ranca Upas' },
  ];

  it('renders one card per item', () => {
    render(<PartnerGrid items={items} />);

    expect(screen.getByText('Sawarna Camp')).toBeInTheDocument();
    expect(screen.getByText('Embun Camp')).toBeInTheDocument();
    expect(screen.getByText('Ranca Upas')).toBeInTheDocument();
  });

  it('renders a 2-column grid on mobile, scaling up on larger breakpoints (Requirement 6.7)', () => {
    const { container } = render(<PartnerGrid items={items} />);

    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('sm:grid-cols-3');
    expect(grid).toHaveClass('md:grid-cols-4');
  });
});
