import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import KebijakanPrivasiPage from './page';

/**
 * Unit tests for the Privacy Policy page (`/kebijakan-privasi`) composition.
 *
 * Validates: Requirements 8.4, 13.8
 */
describe('KebijakanPrivasiPage', () => {
  it('renders exactly one <h1>, matching the page title (Requirement 13.8)', () => {
    const { container } = render(<KebijakanPrivasiPage />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Kebijakan Privasi');
  });

  it('shows the "Terakhir diperbarui" (LastUpdated) line (Requirement 8.4)', () => {
    render(<KebijakanPrivasiPage />);

    expect(screen.getByText(/Terakhir diperbarui/i)).toBeInTheDocument();
  });

  it('shows the LegalDisclaimer notice (Requirement 8.4)', () => {
    render(<KebijakanPrivasiPage />);

    expect(
      screen.getByText(/disarankan untuk ditinjau oleh penasihat hukum/i)
    ).toBeInTheDocument();
  });
});
