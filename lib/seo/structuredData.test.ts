import { describe, expect, it } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
} from './structuredData';
import { SITE_URL } from './config';
import type { FaqItem } from '@/lib/content/appFaq';
import type { PartnerDirectoryItem } from '@/lib/partners/types';
import type { BreadcrumbItem } from '@/components/layout/Breadcrumbs';

/**
 * Validates: Requirements 13.5, 13.6, 13.7, 14.3
 */
describe('structuredData builders', () => {
  describe('buildOrganizationJsonLd', () => {
    it('returns an Organization JSON-LD object shaped per schema.org', () => {
      const result = buildOrganizationJsonLd();

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
      expect(result.name).toBe('Embun');
      expect(result.url).toBe(SITE_URL);
      expect(typeof result.logo).toBe('string');
      expect((result.logo as string).startsWith(SITE_URL)).toBe(true);
      expect(result.sameAs).toEqual([]);
    });
  });

  describe('buildSoftwareApplicationJsonLd', () => {
    it('returns a SoftwareApplication JSON-LD object shaped per schema.org', () => {
      const result = buildSoftwareApplicationJsonLd();

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('SoftwareApplication');
      expect(result.name).toBe('Embun App');
      expect(result.applicationCategory).toBeTruthy();
      expect(result.operatingSystem).toBeTruthy();
      expect(result.url).toBe(SITE_URL);
    });
  });

  describe('buildFaqJsonLd', () => {
    it('returns a FAQPage JSON-LD object with one Question/Answer pair per item', () => {
      const items: FaqItem[] = [
        { question: 'Apa itu Embun?', answer: 'Embun adalah platform pemesanan campsite.' },
        { question: 'Bagaimana cara mendaftar?', answer: 'Daftar melalui halaman kontak kami.' },
      ];

      const result = buildFaqJsonLd(items);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('FAQPage');
      const mainEntity = result.mainEntity as Array<Record<string, unknown>>;
      expect(mainEntity).toHaveLength(2);

      mainEntity.forEach((entry, index) => {
        expect(entry['@type']).toBe('Question');
        expect(entry.name).toBe(items[index].question);
        const acceptedAnswer = entry.acceptedAnswer as Record<string, unknown>;
        expect(acceptedAnswer['@type']).toBe('Answer');
        expect(acceptedAnswer.text).toBe(items[index].answer);
      });
    });
  });

  describe('buildItemListJsonLd', () => {
    it('returns an ItemList JSON-LD object, omitting url when href is absent', () => {
      const items: PartnerDirectoryItem[] = [
        { id: 'p1', name: 'Partner With Link', logoAlt: 'Partner With Link logo', href: 'https://partner.example.com' },
        { id: 'p2', name: 'Partner Without Link', logoAlt: 'Partner Without Link logo' },
      ];

      const result = buildItemListJsonLd(items);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('ItemList');
      const itemListElement = result.itemListElement as Array<Record<string, unknown>>;
      expect(itemListElement).toHaveLength(2);

      expect(itemListElement[0]['@type']).toBe('ListItem');
      expect(itemListElement[0].position).toBe(1);
      expect(itemListElement[0].name).toBe('Partner With Link');
      expect(itemListElement[0].url).toBe('https://partner.example.com');
      expect('url' in itemListElement[0]).toBe(true);

      expect(itemListElement[1]['@type']).toBe('ListItem');
      expect(itemListElement[1].position).toBe(2);
      expect(itemListElement[1].name).toBe('Partner Without Link');
      expect('url' in itemListElement[1]).toBe(false);
    });
  });

  describe('buildBreadcrumbJsonLd', () => {
    it('returns a BreadcrumbList JSON-LD object, resolving item URLs against SITE_URL and omitting item for the current page', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Beranda', href: '/' },
        { label: 'Tentang Kami' },
      ];

      const result = buildBreadcrumbJsonLd(items);

      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('BreadcrumbList');
      const itemListElement = result.itemListElement as Array<Record<string, unknown>>;
      expect(itemListElement).toHaveLength(2);

      expect(itemListElement[0]['@type']).toBe('ListItem');
      expect(itemListElement[0].position).toBe(1);
      expect(itemListElement[0].name).toBe('Beranda');
      expect(itemListElement[0].item).toBe(new URL('/', SITE_URL).toString());
      expect('item' in itemListElement[0]).toBe(true);

      expect(itemListElement[1]['@type']).toBe('ListItem');
      expect(itemListElement[1].position).toBe(2);
      expect(itemListElement[1].name).toBe('Tentang Kami');
      expect('item' in itemListElement[1]).toBe(false);
    });
  });
});
