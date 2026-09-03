import { Metadata } from 'next';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata: Metadata = {
  title: 'Tinjau & Konfirmasi Pemesanan - Embun',
  description: 'Tinjau rincian pemesanan camping dan glamping Anda sebelum melakukan pembayaran aman.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
