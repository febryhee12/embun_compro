import type { Metadata } from 'next';
import { ExploreClient } from '@/components/explore/ExploreClient';

export const dynamic = 'force-static';

export function generateStaticParams() {
  return [{ lang: 'id' }, { lang: 'en' }];
}

export const metadata: Metadata = {
  title: 'Jelajahi Spot Camping & Glamping Terbaik | Embun Explore',
  description:
    'Temukan dan pesan glamping, kabin, dan spot camping terbaik di Indonesia lewat Embun. Dilengkapi tur virtual 360° dan pembayaran DP 50%.',
  openGraph: {
    title: 'Jelajahi Spot Camping & Glamping Terbaik | Embun Explore',
    description:
      'Temukan dan pesan glamping, kabin, dan spot camping terbaik di Indonesia lewat Embun. Dilengkapi tur virtual 360° dan pembayaran DP 50%.',
    url: 'https://embun.app/id/explore',
    siteName: 'Embun',
    images: [
      {
        url: 'https://embun.app/images/app-hero-mockup.jpg',
        width: 1200,
        height: 630,
        alt: 'Embun Explore Campsite',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function ExplorePage() {
  return <ExploreClient />;
}
