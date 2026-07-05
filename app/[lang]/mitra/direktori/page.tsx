import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { PartnerDirectoryEmptyState } from '@/components/sections/directory/PartnerDirectoryEmptyState';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbJsonLd } from '@/lib/seo/structuredData';

/**
 * Forces fully static rendering for this route (Requirement 15.4).
 */
export const dynamic = 'force-static';

/**
 * SEO metadata for the Partner Directory page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/mitra/direktori',
  title: 'Direktori Mitra Embun',
  description:
    'Direktori mitra Embun akan segera hadir. Bergabunglah menjadi salah satu campsite pertama yang tampil di direktori Embun.',
});

/**
 * Partner Directory (`/mitra/direktori`) — Server Component (Requirement 6.1).
 *
 * DELIBERATELY shows a "coming soon" state only. The live public campsites
 * endpoint may return campsites that are NOT yet onboarded partners (e.g.
 * spots merely listed for booking), and surfacing those here would falsely
 * imply a partnership. Until a curated, verified partner list exists, the
 * directory intentionally does NOT fetch or render any campsite data — it
 * renders a coming-soon empty state instead. No `ItemList` JSON-LD is emitted
 * for the same reason (we must not publish unverified partners as structured
 * data). A visible link back to `/mitra` is always shown (Requirement 6.8).
 */
export default async function DirektoriPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const breadcrumbItems = [
    { label: 'Beranda', href: `/${lang}` },
    { label: 'Mitra', href: `/${lang}/mitra` },
    { label: 'Direktori Mitra' },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <Section variant="default" compactTop>
          <Container>
            <h1 className="font-serif text-[2.5rem] font-medium leading-[1.1] text-brand-black md:text-5xl">
              Direktori Mitra
            </h1>
          </Container>
        </Section>
        <PartnerDirectoryEmptyState message="Direktori mitra akan segera hadir. Jadilah salah satu campsite pertama yang bergabung dengan Embun." />
      </main>
      <SiteFooter />
    </>
  );
}
