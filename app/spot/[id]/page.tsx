import type { Metadata } from "next";
import { SpotRedirectClient } from "../../spot-landing/SpotRedirectClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    const res = await fetch("https://api-staging.embun.app/api/public/campsites", {
      cache: "force-cache",
    });
    if (!res.ok) return [];
    const campsites = await res.json();
    const params: { id: string }[] = [];

    if (Array.isArray(campsites)) {
      campsites.forEach((c: any) => {
        if (c.id) params.push({ id: String(c.id).trim() });
        if (c.slug) params.push({ id: String(c.slug).trim() });
        if (Array.isArray(c.blocks)) {
          c.blocks.forEach((b: any) => {
            if (b.id) params.push({ id: String(b.id).trim() });
            if (b.shareCode) params.push({ id: String(b.shareCode).trim() });
          });
        }
      });
    }

    return params;
  } catch (e) {
    console.error("Error generating spot static params:", e);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const targetId = (resolved?.id || "").trim().toLowerCase();
  const fallbackImage =
    "https://media-staging.embun.app/campsites/51f7987e-2632-4bfa-bfc6-302c782bb81d/1348dba5-1a61-4274-b0e8-d17ba2540a15.jpg";

  try {
    const res = await fetch("https://api-staging.embun.app/api/public/campsites", {
      cache: "force-cache",
    });
    if (res.ok) {
      const campsites = await res.json();
      if (Array.isArray(campsites)) {
        for (const c of campsites) {
          const campPrimaryPhoto =
            (c.photos || []).find(
              (p: any) =>
                p.category === "home" ||
                p.category === "cover" ||
                p.category === "main",
            )?.url ||
            (c.photos || []).find((p: any) =>
              (p.category || "").includes("view"),
            )?.url ||
            (c.photos || [])[0]?.url ||
            fallbackImage;

          const cId = String(c.id || "").trim().toLowerCase();
          const cSlug = String(c.slug || "").trim().toLowerCase();

          // 1. MATCH BY CAMPSITE (PROPERTY LEVEL SHARE)
          if (cId === targetId || cSlug === targetId) {
            const title = `${c.name} — Booking Campsite & Glamping | Embun`;
            const description = `Jelajahi dan pesan penginapan di ${c.name}, ${
              c.city || c.address || "Indonesia"
            } lewat Embun.`;
            return {
              title,
              description,
              openGraph: {
                title,
                description,
                url: `https://embun.app/spot/${targetId}`,
                siteName: "Embun",
                images: [
                  {
                    url: campPrimaryPhoto,
                    width: 1200,
                    height: 630,
                    alt: c.name,
                  },
                ],
                locale: "id_ID",
                type: "website",
              },
              twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [campPrimaryPhoto],
              },
            };
          }

          // 2. MATCH BY BLOCK / SPOT (SPOT DETAIL LEVEL SHARE)
          if (Array.isArray(c.blocks)) {
            for (const b of c.blocks) {
              const bId = String(b.id || "").trim().toLowerCase();
              const bShare = String(b.shareCode || "").trim().toLowerCase();

              if (bId === targetId || bShare === targetId) {
                const spotName =
                  b.blockNumber &&
                  !b.name.toLowerCase().includes(b.blockNumber.toLowerCase())
                    ? `${b.name} ${b.blockNumber}`
                    : b.name;

                const spotPhotos = Array.isArray(b.photos) ? b.photos : [];
                const spotImages = Array.isArray(b.images) ? b.images : [];
                const spotPrimaryPhoto =
                  spotPhotos.find((p: any) => p?.url)?.url ||
                  spotImages.find((img: string) => img) ||
                  campPrimaryPhoto;

                const title = `${spotName} by ${c.name} | Embun`;
                const description = `Pesan ${spotName} di ${c.name}, ${
                  c.city || c.address || "Indonesia"
                }. Booking mudah dan konfirmasi instan di Embun.`;

                return {
                  title,
                  description,
                  openGraph: {
                    title,
                    description,
                    url: `https://link.embun.app/spot/${targetId}`,
                    siteName: "Embun",
                    images: [
                      {
                        url: spotPrimaryPhoto,
                        width: 1200,
                        height: 630,
                        alt: `${spotName} - ${c.name}`,
                      },
                    ],
                    locale: "id_ID",
                    type: "website",
                  },
                  twitter: {
                    card: "summary_large_image",
                    title,
                    description,
                    images: [spotPrimaryPhoto],
                  },
                };
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error fetching spot metadata:", e);
  }

  return {
    title: "Embun — Booking Campsite & Glamping Pilihan",
    description:
      "Jelajahi dan pesan unit kamar, kabin, glamping, dan kavling tenda terbaik di Indonesia lewat aplikasi Embun.",
    openGraph: {
      title: "Embun — Booking Campsite & Glamping Pilihan",
      description:
        "Jelajahi dan pesan unit kamar, kabin, glamping, dan kavling tenda terbaik di Indonesia lewat aplikasi Embun.",
      url: `https://link.embun.app/spot/${targetId}`,
      siteName: "Embun",
      images: [
        {
          url: fallbackImage,
          width: 1200,
          height: 630,
          alt: "Embun Campsite Preview",
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Embun — Booking Campsite & Glamping Pilihan",
      description:
        "Jelajahi dan pesan unit kamar, kabin, glamping, dan kavling tenda terbaik di Indonesia lewat aplikasi Embun.",
      images: [fallbackImage],
    },
  };
}

export default function SpotPage() {
  return <SpotRedirectClient />;
}
