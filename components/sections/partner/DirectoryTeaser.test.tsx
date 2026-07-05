import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DirectoryTeaser from './DirectoryTeaser';

/**
 * Validates: Requirements 5.4
 */
describe('DirectoryTeaser (Partner Landing Page)', () => {
  it('renders the heading and subcopy', () => {
    render(<DirectoryTeaser />);

    expect(
      screen.getByRole('heading', { name: 'Lihat Campsite yang Sudah Bergabung' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Bergabung dengan campsite lain yang sudah mempercayakan reservasi dan operasionalnya kepada Embun.'
      )
    ).toBeInTheDocument();
  });

  it('renders a link to the directory with the default href', () => {
    render(<DirectoryTeaser />);

    const link = screen.getByRole('link', { name: 'Lihat Direktori Mitra' });
    expect(link).toHaveAttribute('href', '/mitra/direktori');
  });

  it('renders custom props when passed', () => {
    render(
      <DirectoryTeaser
        heading="Judul Kustom"
        subcopy="Subcopy kustom."
        directoryHref="/mitra/direktori-lain"
      />
    );

    expect(screen.getByRole('heading', { name: 'Judul Kustom' })).toBeInTheDocument();
    expect(screen.getByText('Subcopy kustom.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat Direktori Mitra' })).toHaveAttribute(
      'href',
      '/mitra/direktori-lain'
    );
  });
});
