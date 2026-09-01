import type { Metadata } from 'next';
import { OrdersClient } from '@/components/orders/OrdersClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Pesanan Saya | Embun',
  description: 'Riwayat pesanan Embun Anda.',
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return <OrdersClient />;
}
