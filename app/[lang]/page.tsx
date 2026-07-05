import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import AppHero from '@/components/sections/app/Hero';
import AppFeatures from '@/components/sections/app/Features';
import AppScreenshots from '@/components/sections/app/Screenshots';
import Faq from '@/components/sections/Faq';
import AppDownloadCta from '@/components/sections/app/DownloadCta';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { JsonLd } from '@/components/seo/JsonLd';
import { appFaq } from '@/lib/content/appFaq';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildSoftwareApplicationJsonLd } from '@/lib/seo/structuredData';
import { i18n } from '@/lib/i18n';

/**
 * Forces fully static rendering for this route (Requirement 9.4).
 *
 * The page has no data fetching and no dynamic APIs (`cookies()`,
 * `headers()`, `searchParams`) anywhere in its render tree — Next.js would
 * already statically prerender it by default. This declaration makes that
 * intent explicit and acts as a build-time guard: if a dynamic API is ever
 * introduced into this tree by mistake, `next build` fails loudly instead
 * of silently opting the route into server rendering.
 */
export const dynamic = 'force-static';

/**
 * SEO metadata for the App Landing Page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/',
  title: 'Embun — Cari dan Pesan Campsite Favoritmu',
  description:
    'Temukan dan pesan spot camping terbaik lewat Embun App: pencarian campsite, pemesanan mudah, pembayaran aman, dan riwayat perjalananmu dalam satu aplikasi.',
});

/**
 * Home — the App Landing Page, the single page / only route of the site
 * (Server Component).
 *
 * Composes the App Landing Page sections in the required order (Requirements
 * 1.1, 1.2): `Hero` → `Features` → `Screenshots` → `Faq` → `DownloadCta`,
 * all sourced from `components/sections/app/*` and scoped entirely to Guest
 * audiences. Each section owns its own anchor `id` (`#hero`, `#features`,
 * `#screenshots`, `#faq`, `#download`) via the shared `Section` primitive.
 * `SiteHeader` and `SiteFooter` sit outside `<main>` since they are global
 * layout chrome rather than page content.
 *
 * No owner/commission/partnership content (e.g. the old single-page
 * `Ethos`, `Features`, `Portfolio`, `Contact`, `CallToAction` sections)
 * renders on this route (Requirement 1.3/1.4) — that content now lives on
 * the `/mitra` route instead.
 */
export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = lang === 'en' ? i18n.en.app : i18n.id.app;

  return (
    <>
      <JsonLd data={buildSoftwareApplicationJsonLd()} />
      <SiteHeader />
      <main>
        <AppHero headline={dict.hero.headline} subcopy={dict.hero.subcopy} />
        <AppFeatures headline={dict.featuresHeading} subcopy={dict.featuresSubcopy} items={dict.features} />
        <AppScreenshots headline={dict.screenshots.headline} subcopy={dict.screenshots.subcopy} items={dict.screenshots.items} />
        <Faq items={dict.faq.items || appFaq} heading={dict.faq.heading} />
        <AppDownloadCta heading={dict.downloadCta.headline} subcopy={dict.downloadCta.subcopy} />
      </main>
      <SiteFooter />
    </>
  );
}
