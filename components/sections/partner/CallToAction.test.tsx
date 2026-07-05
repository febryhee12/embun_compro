import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CallToAction from './CallToAction';

/**
 * Validates: Requirements 5.2
 */
describe('CallToAction (Partner Landing Page)', () => {
  it('renders the heading and subcopy', () => {
    render(<CallToAction />);

    expect(
      screen.getByRole('heading', { name: 'Siap Membawa Campsite Anda ke Lebih Banyak Tamu?' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Jadilah salah satu campsite pertama yang bergabung dengan Embun dan rasakan bagaimana reservasi serta komisi terkelola secara otomatis.'
      )
    ).toBeInTheDocument();
  });

  it('renders a CTA that targets #contact by default', () => {
    render(<CallToAction />);

    const cta = screen.getByRole('link', { name: 'Daftarkan Campsite Anda' });
    expect(cta).toHaveAttribute('href', '#contact');
  });

  it('renders custom props when passed', () => {
    render(
      <CallToAction
        heading="Judul Kustom"
        subcopy="Subcopy kustom."
        ctaHref="#custom"
        ctaLabel="Klik Disini"
      />
    );

    expect(screen.getByRole('heading', { name: 'Judul Kustom' })).toBeInTheDocument();
    expect(screen.getByText('Subcopy kustom.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Klik Disini' })).toHaveAttribute('href', '#custom');
  });
});
