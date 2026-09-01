import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderDetailClient } from '@/components/orders/OrderDetailClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Detail Pesanan | Embun',
  description: 'Detail dan status pembayaran pesanan Embun Anda.',
  robots: { index: false, follow: false },
};

export default function OrderDetailPage() {
  return (
    <Suspense fallback={null}>
      <OrderDetailClient />
    </Suspense>
  );
}
