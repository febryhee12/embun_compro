import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import KebijakanMitraPage from './page';

/**
 * Unit tests for the Kebijakan Kemitraan page (`/kebijakan-mitra`)
 * composition, including its cross-references to `/kebijakan-refund`.
 *
 * Validates: Requirements 11.5, 11.6, 13.8
 */
describe('KebijakanMitraPage', () => {
  it('renders exactly one <h1>, matching the page title (Requirement 13.8)', () => {
    const { container } = render(<KebijakanMitraPage />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Kebijakan Kemitraan');
  });

  it('shows the "Terakhir diperbarui" (LastUpdated) line (Requirement 11.5)', () => {
    render(<KebijakanMitraPage />);

    expect(screen.getByText(/Terakhir diperbarui/i)).toBeInTheDocument();
  });

  it('shows the LegalDisclaimer notice (Requirement 11.5)', () => {
    render(<KebijakanMitraPage />);

    expect(
      screen.getByText(/disarankan untuk ditinjau oleh penasihat hukum/i)
    ).toBeInTheDocument();
  });

  it('renders three valid cross-reference links to /kebijakan-refund (Requirement 11.6)', () => {
    render(<KebijakanMitraPage />);

    // Match the exact inline cross-reference text ("Kebijakan Refund &
    // Pembatalan"). A narrower substring like /kebijakan refund/i would also
    // match the unrelated "Kebijakan Refund" link in `SiteFooter`.
    const links = screen.getAllByRole('link', { name: /^Kebijakan Refund & Pembatalan$/i });
    expect(links).toHaveLength(3);

    links.forEach((link) => {
      expect(link).toHaveAttribute('href', '/kebijakan-refund');
      expect(link).toHaveTextContent('Kebijakan Refund & Pembatalan');
    });
  });
});
