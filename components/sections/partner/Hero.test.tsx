import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';

/**
 * Validates: Requirements 5.2
 */
describe('Hero (Partner Landing Page)', () => {
  it('renders the headline as the page h1', () => {
    render(<Hero />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(
      'Kelola Campsite Anda, Kami Urus Reservasi dan Komisinya',
    );
  });

  it('renders the CTA link with the default #contact href', () => {
    render(<Hero />);

    const cta = screen.getByRole('link', { name: 'Gabung jadi Mitra' });
    expect(cta).toHaveAttribute('href', '#contact');
  });

  it('renders custom props when passed', () => {
    render(
      <Hero
        headline="Judul Kustom"
        subcopy="Subcopy kustom."
        ctaHref="#custom"
        ctaLabel="Klik Disini"
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Judul Kustom',
    );
    expect(screen.getByText('Subcopy kustom.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Klik Disini' })).toHaveAttribute(
      'href',
      '#custom',
    );
  });
});
