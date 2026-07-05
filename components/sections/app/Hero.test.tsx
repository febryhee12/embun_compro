import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Hero from './Hero';

/**
 * Validates: Requirements 2.3, 2.6
 */
describe('Hero (App Landing Page)', () => {
  it('renders the headline as the page h1', () => {
    render(<Hero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Cari dan Pesan Campsite Favoritmu, Semudah Itu');
  });

  it('renders both store CTA links opening in a new tab with the default hrefs', () => {
    render(<Hero />);

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
      <Hero
        headline="Judul Kustom"
        subcopy="Subcopy kustom."
        appStoreHref="https://apps.apple.com/custom"
        googlePlayHref="https://play.google.com/custom"
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Judul Kustom');
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

  it('hides the broken screenshot and shows a placeholder when the image fails to load', () => {
    render(<Hero imageAlt="Tangkapan layar contoh" />);

    const image = screen.getByAltText('Tangkapan layar contoh');
    fireEvent.error(image);

    expect(screen.queryByAltText('Tangkapan layar contoh')).not.toBeInTheDocument();
    const placeholder = screen.getByRole('img', { name: 'Tangkapan layar contoh' });
    expect(placeholder).toHaveStyle({ backgroundColor: '#f4f4f4' });
  });
});
