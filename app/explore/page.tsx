import type { Metadata } from 'next';
import { ExploreClient } from '@/components/explore/ExploreClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Jelajahi Spot Camping & Glamping Terbaik | Embun Explore',
  description:
    'Temukan dan pesan glamping, kabin, dan spot camping terbaik di Indonesia lewat Embun. Dilengkapi tur virtual 360° dan pembayaran DP 50%.',
};

export default function ExplorePage() {
  return <ExploreClient />;
}
