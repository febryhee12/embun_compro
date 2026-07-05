import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PartnerDirectoryItem } from '@/lib/partners/types';

const { fetchPartners } = vi.hoisted(() => ({
  fetchPartners: vi.fn<() => Promise<PartnerDirectoryItem[]>>(),
}));

vi.mock('@/lib/partners/fetchPartners', () => ({
  fetchPartners,
}));

// `DirektoriPage` is an async Server Component. It must be imported after
// the mock is registered (dynamic import, awaited in each test) so every
// test picks up the current `fetchPartners` mock resolution.
async function renderDirektoriPage() {
  const { default: DirektoriPage } = await import('./page');
  const jsx = await DirektoriPage();
  return render(jsx);
}

/**
 * Validates: Requirements 6.4, 6.5, 6.6, 6.7
 */
describe('DirektoriPage (Partner Directory)', () => {
  it('renders the partner grid when fetchPartners resolves 2+ partners', async () => {
    fetchPartners.mockResolvedValueOnce([
      { id: '1', name: 'Sawarna Camp', logoAlt: 'Logo Sawarna Camp' },
      { id: '2', name: 'Embun Camp', logoAlt: 'Logo Embun Camp' },
    ]);

    await renderDirektoriPage();

    expect(screen.getByText('Sawarna Camp')).toBeInTheDocument();
    expect(screen.getByText('Embun Camp')).toBeInTheDocument();
    expect(
      screen.queryByText('Belum ada mitra yang ditampilkan saat ini')
    ).not.toBeInTheDocument();
  });

  it('renders the empty state when fetchPartners resolves an empty array (e.g. failure fallback or genuine empty success)', async () => {
    fetchPartners.mockResolvedValueOnce([]);

    await renderDirektoriPage();

    expect(
      screen.getByText('Belum ada mitra yang ditampilkan saat ini')
    ).toBeInTheDocument();
  });

  it('renders exactly one <h1> ("Direktori Mitra")', async () => {
    fetchPartners.mockResolvedValueOnce([
      { id: '1', name: 'Sawarna Camp', logoAlt: 'Logo Sawarna Camp' },
    ]);

    const { container } = await renderDirektoriPage();

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Direktori Mitra');
  });

  it('renders the "Kembali ke halaman Mitra" link pointing to /mitra', async () => {
    fetchPartners.mockResolvedValueOnce([]);

    await renderDirektoriPage();

    const link = screen.getByRole('link', { name: /Kembali ke halaman Mitra/ });
    expect(link).toHaveAttribute('href', '/mitra');
  });
});
