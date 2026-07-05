import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SyaratKetentuanPage from './page';

/**
 * Unit tests for the Terms of Service page (`/syarat-ketentuan`) composition.
 *
 * Validates: Requirements 9.5, 13.8
 */
describe('SyaratKetentuanPage', () => {
  it('renders exactly one <h1>, matching the page title (Requirement 13.8)', () => {
    const { container } = render(<SyaratKetentuanPage />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Syarat & Ketentuan');
  });

  it('shows the "Terakhir diperbarui" (LastUpdated) line (Requirement 9.5)', () => {
    render(<SyaratKetentuanPage />);

    // Note: the policy body also mentions the phrase `"Terakhir diperbarui"`
    // (without a trailing colon) in prose, so match on the colon to target
    // only the `LastUpdated` line rendered by `LegalLayout`.
    expect(screen.getByText(/Terakhir diperbarui:/i)).toBeInTheDocument();
  });

  it('shows the LegalDisclaimer notice (Requirement 9.5)', () => {
    render(<SyaratKetentuanPage />);

    expect(
      screen.getByText(/disarankan untuk ditinjau oleh penasihat hukum/i)
    ).toBeInTheDocument();
  });
});
