import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import Hero from '@/components/sections/partner/Hero';
import Benefits from '@/components/sections/partner/Benefits';
import DirectoryTeaser from '@/components/sections/partner/DirectoryTeaser';
import Faq from '@/components/sections/Faq';
import Contact from '@/components/sections/Contact';
import CallToAction from '@/components/sections/partner/CallToAction';
import { JsonLd } from '@/components/seo/JsonLd';
import { partnerFaq } from '@/lib/content/partnerFaq';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbJsonLd } from '@/lib/seo/structuredData';

/**
 * Forces fully static rendering for this route (Requirement 15.4).
 *
 * Mirrors the guard already used on `app/page.tsx`: the page has no data
 * fetching and no dynamic APIs, so this declaration makes the static-export
 * intent explicit and fails the build loudly if that ever changes.
 */
export const dynamic = 'force-static';

/**
 * SEO metadata for the Partner Landing Page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/mitra',
  title: 'Jadi Mitra Embun — Kelola Campsite Anda',
  description:
    'Bermitra dengan Embun untuk mengelola reservasi, komisi otomatis, dan blok/spot campsite Anda dalam satu dashboard yang mudah digunakan.',
});

/**
 * Partner Landing Page (`/mitra`) — Requirement 5.1.
 *
 * Assembles the full Campsite Owner-facing landing page as a static Server
 * Component composition, in this fixed order:
 *
 * 1. `Hero` (partner) — owner-targeted value prop, renders the page's only
 *    `<h1>`, CTA scrolls to `#contact`.
 * 2. `Benefits` (partner) — the relocated "Features for Owners" content.
 * 3. `DirectoryTeaser` (partner) — lightweight social-proof link to
 *    `/mitra/direktori`.
 * 4. `Faq` (shared) — rendered with `partnerFaq` content, distinct from the
 *    App Landing Page's `appFaq`.
 * 5. `Contact` — the Contact Form section, anchored at `#contact` so both
 *    the Hero and CallToAction CTAs scroll into it.
 * 6. `CallToAction` (partner) — closing dark-section CTA, also scrolls to
 *    `#contact`.
 *
 * Every section below the Hero renders `<h2>`/`<h3>` headings only, so this
 * page has exactly one `<h1>` (Requirement 13.8).
 */
export default function MitraPage() {
  const breadcrumbItems = [{ label: 'Beranda', href: '/' }, { label: 'Mitra' }];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <Hero />
        <Benefits />
        <DirectoryTeaser />
        <Faq items={partnerFaq} />
        <Contact />
        <CallToAction />
      </main>
      <SiteFooter />
    </>
  );
}
