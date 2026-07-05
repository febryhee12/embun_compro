import type { FaqItem } from '@/lib/content/appFaq';
import type { PartnerDirectoryItem } from '@/lib/partners/types';
import type { BreadcrumbItem } from '@/components/layout/Breadcrumbs';
import { SITE_URL } from './config';

/**
 * Hand-built JSON-LD (schema.org) builder functions.
 *
 * Each builder returns a plain object shaped to a specific schema.org
 * type. No external schema library is used — the objects are constructed
 * directly per design.md ("Hand-built JSON-LD via typed builder
 * functions"). Callers are expected to serialize the result into a
 * `<script type="application/ld+json">` tag.
 */

export type OrganizationJsonLd = Record<string, unknown>;
export type SoftwareApplicationJsonLd = Record<string, unknown>;
export type FaqPageJsonLd = Record<string, unknown>;
export type ItemListJsonLd = Record<string, unknown>;
export type BreadcrumbListJsonLd = Record<string, unknown>;

/**
 * Organization structured data — rendered on every page via `layout.tsx`.
 *
 * Validates: Requirements 13.5, 14.3
 */
export function buildOrganizationJsonLd(): OrganizationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Embun',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo/model1_blue.svg`,
    sameAs: [],
  };
}

/**
 * SoftwareApplication structured data — rendered on the App Landing Page
 * only.
 *
 * Validates: Requirements 13.6, 14.3
 */
export function buildSoftwareApplicationJsonLd(): SoftwareApplicationJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Embun App',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'iOS, Android',
    url: SITE_URL,
  };
}

/**
 * FAQPage structured data — rendered on any page with a Faq section.
 *
 * Validates: Requirements 13.7, 14.3
 */
export function buildFaqJsonLd(items: FaqItem[]): FaqPageJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * ItemList structured data — rendered on the Partner Directory only.
 *
 * Validates: Requirements 13.7, 14.3
 */
export function buildItemListJsonLd(items: PartnerDirectoryItem[]): ItemListJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.href ? { url: item.href } : {}),
    })),
  };
}

/**
 * BreadcrumbList structured data — rendered on every non-home page.
 *
 * Validates: Requirements 13.5, 14.3
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): BreadcrumbListJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, SITE_URL).toString() } : {}),
    })),
  };
}
