import type { Metadata } from 'next';
import { SpotRedirectClient } from './SpotRedirectClient';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Embun — Booking Campsite & Glamping Pilihan',
  description:
    'Jelajahi dan pesan unit kamar, kabin, glamping, dan kavling tenda terbaik di Indonesia lewat aplikasi Embun.',
  openGraph: {
    title: 'Embun — Booking Campsite & Glamping Pilihan',
    description:
      'Jelajahi dan pesan unit kamar, kabin, glamping, dan kavling tenda terbaik di Indonesia lewat aplikasi Embun.',
    url: 'https://link.embun.app',
    siteName: 'Embun',
    images: [
      {
        url: 'https://embun.app/images/app-hero-mockup.jpg',
        width: 1200,
        height: 630,
        alt: 'Embun Campsite Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embun — Booking Campsite & Glamping Pilihan',
    description:
      'Jelajahi dan pesan unit kamar, kabin, glamping, dan kavling tenda terbaik di Indonesia lewat aplikasi Embun.',
    images: ['https://embun.app/images/app-hero-mockup.jpg'],
  },
  robots: { index: true, follow: true },
};

/**
 * /spot-landing — Halaman Web Preview Publik untuk link share properti & spot Embun
 * (diakses via `https://link.embun.app/spot/<shareCodeOrId>`).
 * Terintegrasi penuh dan realtime dengan backend Embun.
 */
export default function SpotLandingPage() {
  return <SpotRedirectClient />;
}
