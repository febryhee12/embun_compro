import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import KebijakanRefundPage from './page';

/**
 * Unit tests for the Refund & Cancellation Policy page (`/kebijakan-refund`)
 * composition.
 *
 * Validates: Requirements 10.5, 13.8
 */
describe('KebijakanRefundPage', () => {
  it('renders exactly one <h1>, matching the page title (Requirement 13.8)', () => {
    const { container } = render(<KebijakanRefundPage />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Kebijakan Refund & Pembatalan');
  });

  it('shows the "Terakhir diperbarui" (LastUpdated) line (Requirement 10.5)', () => {
    render(<KebijakanRefundPage />);

    expect(screen.getByText(/Terakhir diperbarui/i)).toBeInTheDocument();
  });

  it('shows the LegalDisclaimer notice (Requirement 10.5)', () => {
    render(<KebijakanRefundPage />);

    expect(
      screen.getByText(/disarankan untuk ditinjau oleh penasihat hukum/i)
    ).toBeInTheDocument();
  });
});
