import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DownloadCta from './DownloadCta';

/**
 * Validates: Requirements 4.4
 */
describe('DownloadCta (App Landing Page)', () => {
  it('renders the heading and subcopy', () => {
    render(<DownloadCta />);

    expect(screen.getByRole('heading', { name: 'Unduh Embun App Sekarang' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Temukan dan pesan campsite favoritmu langsung dari genggaman. Tersedia gratis di App Store dan Google Play.'
      )
    ).toBeInTheDocument();
  });

  it('renders both store CTA buttons opening in a new tab with the default hrefs', () => {
    render(<DownloadCta />);

    const appStoreLink = screen.getByRole('link', { name: /Unduh di App Store/i });
    expect(appStoreLink).toHaveAttribute('href', 'https://apps.apple.com/app/embun');
    expect(appStoreLink).toHaveAttribute('target', '_blank');
    expect(appStoreLink).toHaveAttribute('rel', 'noopener noreferrer');

    const googlePlayLink = screen.getByRole('link', { name: /Unduh di Google Play/i });
    expect(googlePlayLink).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=app.embun'
    );
    expect(googlePlayLink).toHaveAttribute('target', '_blank');
    expect(googlePlayLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders custom props when passed', () => {
    render(
      <DownloadCta
        heading="Judul Kustom"
        subcopy="Subcopy kustom."
        appStoreHref="https://apps.apple.com/custom"
        googlePlayHref="https://play.google.com/custom"
      />
    );

    expect(screen.getByRole('heading', { name: 'Judul Kustom' })).toBeInTheDocument();
    expect(screen.getByText('Subcopy kustom.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Unduh di App Store/i })).toHaveAttribute(
      'href',
      'https://apps.apple.com/custom'
    );
    expect(screen.getByRole('link', { name: /Unduh di Google Play/i })).toHaveAttribute(
      'href',
      'https://play.google.com/custom'
    );
  });
});
