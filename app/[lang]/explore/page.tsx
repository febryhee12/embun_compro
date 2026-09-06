import type { Metadata } from 'next';
import { ExploreClient } from '@/components/explore/ExploreClient';
import type { Language } from '@/lib/explore-i18n';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === 'en';

  return {
    title: isEn
      ? 'Explore Best Camping & Glamping Spots | Embun Explore'
      : 'Jelajahi Spot Camping & Glamping Terbaik | Embun Explore',
    description: isEn
      ? 'Discover and book prime glamping, cabins, and scenic camping spots in Indonesia with Embun. Features interactive 360° virtual tours.'
      : 'Temukan dan pesan glamping, kabin, dan spot camping terbaik di Indonesia lewat Embun. Dilengkapi tur virtual 360° dan pembayaran DP 50%.',
    openGraph: {
      title: isEn
        ? 'Explore Best Camping & Glamping Spots | Embun Explore'
        : 'Jelajahi Spot Camping & Glamping Terbaik | Embun Explore',
      description: isEn
        ? 'Discover and book prime glamping, cabins, and scenic camping spots in Indonesia with Embun. Features interactive 360° virtual tours.'
        : 'Temukan dan pesan glamping, kabin, dan spot camping terbaik di Indonesia lewat Embun. Dilengkapi tur virtual 360° dan pembayaran DP 50%.',
      url: `https://embun.app/${lang}/explore`,
      siteName: 'Embun',
      locale: isEn ? 'en_US' : 'id_ID',
      type: 'website',
    },
  };
}

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  return <ExploreClient initialLang={lang as Language} />;
}

