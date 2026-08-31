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
        url: 'https://media-staging.embun.app/campsites/51f7987e-2632-4bfa-bfc6-302c782bb81d/1348dba5-1a61-4274-b0e8-d17ba2540a15.jpg',
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
    images: [
      'https://media-staging.embun.app/campsites/51f7987e-2632-4bfa-bfc6-302c782bb81d/1348dba5-1a61-4274-b0e8-d17ba2540a15.jpg',
    ],
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
