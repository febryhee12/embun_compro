import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Jelajahi Spot Camping & Glamping Terbaik | Embun Explore',
  description:
    'Temukan dan pesan glamping, kabin, dan spot camping terbaik di Indonesia lewat Embun.',
};

export default function ExploreRootPage() {
  redirect('/id/explore');
}
