import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import Hero from '@/components/sections/partner/Hero';
import Benefits from '@/components/sections/partner/Benefits';
import HowToJoin from '@/components/sections/partner/HowToJoin';
import SupportedTypes from '@/components/sections/partner/SupportedTypes';
import PartnerFaqAndContact from '@/components/sections/partner/PartnerFaqAndContact';
import CallToAction from '@/components/sections/partner/CallToAction';
import { JsonLd } from '@/components/seo/JsonLd';
import { partnerFaq } from '@/lib/content/partnerFaq';
import type { PartnerBenefitItem } from '@/lib/content/partnerBenefits';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbJsonLd } from '@/lib/seo/structuredData';
import { i18n } from '@/lib/i18n';

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
  title: 'Jadi Mitra Embun Kelola Properti Campsite Anda',
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
export default async function MitraPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const breadcrumbItems = [
    { label: lang === 'en' ? 'Home' : 'Beranda', href: `/${lang}` },
    { label: lang === 'en' ? 'Partner' : 'Mitra' },
  ];
  const dict = lang === 'en' ? i18n.en.partner : i18n.id.partner;

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <Hero
          headline={dict.hero.headline}
          subcopy={dict.hero.subcopy}
          ctaLabel={dict.hero.ctaLabel}
        />
        <SupportedTypes
          heading={dict.supportedTypes.heading}
          subcopy={dict.supportedTypes.subcopy}
        />
        <Benefits
          heading={dict.benefits.heading}
          subcopy={dict.benefits.subcopy}
          items={dict.benefits.items as PartnerBenefitItem[] | undefined}
        />
        <HowToJoin
          heading={dict.howToJoin.heading}
          subcopy={dict.howToJoin.subcopy}
          steps={dict.howToJoin.steps}
        />
        <PartnerFaqAndContact
          faqHeading={dict.faq.heading}
          faqItems={dict.faq.items}
          contactHeading={dict.contact.heading}
          contactSubcopy={dict.contact.subcopy}
        />
        <CallToAction
          heading={dict.cta.heading}
          subcopy={dict.cta.subcopy}
          ctaLabel={dict.cta.ctaLabel}
        />
      </main>
      <SiteFooter />
    </>
  );
}
