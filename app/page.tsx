import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Embun | Cari dan Pesan Campsite Favoritmu',
  description:
    'Temukan dan pesan spot camping terbaik lewat Embun App: pencarian campsite, pemesanan mudah, pembayaran aman, dan riwayat perjalananmu dalam satu aplikasi.',
  alternates: {
    canonical: 'https://embun.app/id',
  },
};

export default function RootPage() {
  // Since we use output: 'export', Next.js static export does not support server-side redirects in next.config.js.
  // However, next/navigation redirect in a Server Component will generate a meta refresh tag for static exports.
  redirect('/id');
}
