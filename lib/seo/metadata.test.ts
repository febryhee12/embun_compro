import { describe, expect, it } from 'vitest';
import { buildPageMetadata } from './metadata';
import { SITE_URL } from './config';

/**
 * Validates: Requirements 13.1, 13.2
 */
describe('buildPageMetadata', () => {
  it('does not include description-related keys when description/ogImage are omitted', () => {
    const result = buildPageMetadata({ path: '/mitra', title: 'Mitra' });

    expect(result).not.toHaveProperty('description');
    expect(result.openGraph).not.toHaveProperty('description');
    expect(result.openGraph).not.toHaveProperty('images');
    expect(result.twitter).not.toHaveProperty('description');
  });

  it('sets description on title/openGraph/twitter when provided', () => {
    const description = 'Deskripsi halaman mitra Embun.';
    const result = buildPageMetadata({
      path: '/mitra',
      title: 'Mitra',
      description,
    });

    expect(result.description).toBe(description);
    expect(result.openGraph?.description).toBe(description);
    expect(result.twitter?.description).toBe(description);
  });

  it('resolves ogImage as an absolute URL against SITE_URL', () => {
    const result = buildPageMetadata({
      path: '/mitra',
      title: 'Mitra',
      ogImage: '/images/og/mitra.jpg',
    });

    expect(result.openGraph?.images).toEqual([
      'https://embun.app/images/og/mitra.jpg',
    ]);
  });

  it.each(['/', '/mitra', '/kebijakan-privasi'])(
    'builds the correct canonical URL for path %s',
    (path) => {
      const result = buildPageMetadata({ path, title: 'Judul' });
      const expectedUrl = new URL(path, SITE_URL).toString();

      expect(result.alternates?.canonical).toBe(expectedUrl);
      expect(result.openGraph?.url).toBe(expectedUrl);
    },
  );

  it('always sets twitter.card to summary_large_image regardless of optional fields', () => {
    const withoutOptional = buildPageMetadata({ path: '/', title: 'Judul' });
    const withOptional = buildPageMetadata({
      path: '/',
      title: 'Judul',
      description: 'Deskripsi',
      ogImage: '/images/og/home.jpg',
    });

    // Next.js's `Metadata['twitter']` type is a union that doesn't expose
    // `card` without narrowing; cast to the shape we actually construct.
    const withoutCard = (withoutOptional.twitter as { card?: string } | undefined)?.card;
    const withCard = (withOptional.twitter as { card?: string } | undefined)?.card;

    expect(withoutCard).toBe('summary_large_image');
    expect(withCard).toBe('summary_large_image');
  });
});
