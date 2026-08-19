import type { Metadata } from 'next';
import { SITE_URL } from './config';

/**
 * SEO input for a single page.
 *
 * - `path` is used to build the canonical URL and `og:url`.
 * - `title` is required — every page needs a unique title.
 * - `description` and `ogImage` are optional; when omitted, the
 *   corresponding metadata fields are skipped entirely rather than
 *   being set to an empty value.
 */
export interface PageSeo {
  path: string;
  title: string;
  description?: string;
  ogImage?: string;
}

/**
 * Builds a Next.js `Metadata` object for a page based on the available
 * SEO fields. Fields without data are omitted from the returned object
 * instead of being set to `undefined`, so they never override metadata
 * inherited from a parent layout.
 *
 * Validates: Requirements 13.1, 13.2
 */
export function buildPageMetadata(seo: PageSeo, lang?: string): Metadata {
  // Normalize the base path (e.g. '/' or '/mitra')
  const basePath = seo.path.startsWith('/') ? seo.path : `/${seo.path}`;
  
  // Construct the localized path if a lang is provided
  const localizedPath = lang ? `/${lang}${basePath === '/' ? '' : basePath}` : basePath;
  const canonicalUrl = new URL(localizedPath, SITE_URL).toString();

  // Construct hreflang alternates if lang is provided
  let languages: Record<string, string> | undefined;
  if (lang) {
    languages = {
      id: new URL(`/id${basePath === '/' ? '' : basePath}`, SITE_URL).toString(),
      en: new URL(`/en${basePath === '/' ? '' : basePath}`, SITE_URL).toString(),
    };
  }

  return {
    title: seo.title,
    ...(seo.description ? { description: seo.description } : {}),
    alternates: {
      canonical: canonicalUrl,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: seo.title,
      ...(seo.description ? { description: seo.description } : {}),
      url: canonicalUrl,
      ...(seo.ogImage
        ? { images: [new URL(seo.ogImage, SITE_URL).toString()] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      ...(seo.description ? { description: seo.description } : {}),
    },
  };
}
