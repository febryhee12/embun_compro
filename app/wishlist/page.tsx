import type { Metadata } from 'next';
import { WishlistClient } from '@/components/wishlist/WishlistClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Wishlist Saya | Embun',
  description: 'Daftar spot camping dan akomodasi favorit yang Anda simpan di Embun.',
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
