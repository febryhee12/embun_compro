import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PartnerDirectoryEmptyState } from './PartnerDirectoryEmptyState';

/**
 * Validates: Requirement 6.4
 */
describe('PartnerDirectoryEmptyState', () => {
  it('renders the default message when no message prop is given', () => {
    render(<PartnerDirectoryEmptyState />);

    expect(
      screen.getByText('Belum ada mitra yang ditampilkan saat ini')
    ).toBeInTheDocument();
  });

  it('renders a custom message when provided', () => {
    render(<PartnerDirectoryEmptyState message="Pesan kustom." />);

    expect(screen.getByText('Pesan kustom.')).toBeInTheDocument();
    expect(
      screen.queryByText('Belum ada mitra yang ditampilkan saat ini')
    ).not.toBeInTheDocument();
  });
});
