import type { Metadata } from 'next';
import { CampsiteLandingClient } from './CampsiteLandingClient';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Embun — Profil Campsite & Pilihan Spot Camping Lengkap',
  description:
    'Jelajahi profil lengkap kawasan campsite, video suasana, fasilitas, dan seluruh unit kavling tenda & glamping terbaik di Embun.',
  openGraph: {
    title: 'Embun — Profil Campsite & Pilihan Spot Camping Lengkap',
    description:
      'Jelajahi profil lengkap kawasan campsite, video suasana, fasilitas, dan seluruh unit kavling tenda & glamping terbaik di Embun.',
    url: 'https://embun.app',
    siteName: 'Embun',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embun — Profil Campsite & Pilihan Spot Camping Lengkap',
    description:
      'Jelajahi profil lengkap kawasan campsite, video suasana, fasilitas, dan seluruh unit kavling tenda & glamping terbaik di Embun.',
  },
  robots: { index: true, follow: true },
};

export default function CampsiteLandingPage() {
  return <CampsiteLandingClient />;
}
