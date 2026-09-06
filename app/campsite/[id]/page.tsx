import type { Metadata } from 'next';
import { CampsiteLandingClient } from '../../campsite-landing/CampsiteLandingClient';
import { resolveAssetUrl, getCampsiteCoverPhoto } from '@/lib/asset-utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const res = await fetch('https://api-staging.embun.app/api/public/campsites', {
      cache: 'force-cache',
    });
    if (!res.ok) return [];
    const campsites = await res.json();
    const params: { id: string }[] = [];

    if (Array.isArray(campsites)) {
      campsites.forEach((c: any) => {
        if (c.id) params.push({ id: String(c.id).trim() });
        if (c.slug) params.push({ id: String(c.slug).trim() });
      });
    }

    return params;
  } catch (e) {
    console.error('Error generating campsite static params:', e);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const targetId = (resolved?.id || '').trim().toLowerCase();
  const fallbackImage =
    'https://media-staging.embun.app/campsites/51f7987e-2632-4bfa-bfc6-302c782bb81d/1348dba5-1a61-4274-b0e8-d17ba2540a15.jpg';

  try {
    const directRes = await fetch(
      `https://api-staging.embun.app/api/public/campsites/resolve-spot?token=${encodeURIComponent(targetId)}`,
      { next: { revalidate: 60 } },
    );
    if (directRes.ok) {
      const data = await directRes.json();
      const campsite = data?.campsite;

      if (campsite) {
        const cover = getCampsiteCoverPhoto(campsite);
        const campPrimaryPhoto = cover ? resolveAssetUrl(cover) : fallbackImage;

        const title = `${campsite.name} — Profil Kawasan & Pilihan Spot Camping | Embun`;
        const description = `Jelajahi ${campsite.name} di ${
          campsite.city || campsite.address || 'Indonesia'
        }. Lihat video suasana, fasilitas, dan pesan spot camping atau glamping secara instan di Embun.`;

        return {
          title,
          description,
          openGraph: {
            title,
            description,
            images: [{ url: campPrimaryPhoto, width: 1200, height: 630, alt: campsite.name }],
            type: 'website',
            locale: 'id_ID',
            siteName: 'Embun',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [campPrimaryPhoto],
          },
        };
      }
    }
  } catch (e) {
    console.error('Error generating campsite metadata:', e);
  }

  return {
    title: 'Embun — Profil Campsite & Pilihan Spot Camping',
    description: 'Jelajahi dan pesan unit akomodasi alam terbaik di Embun.',
  };
}

export default function CampsitePage() {
  return <CampsiteLandingClient />;
}
