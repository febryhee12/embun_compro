/** A single feature shown in the App Landing Page's Fitur & Cara Kerja section. */
export interface AppFeatureItem {
  id: string;
  title: string; // e.g. 'Pencarian Campsite', 'Pemesanan Mudah'
  description: string; // max 2 sentences
  audience: 'guest'; // fixed — App Landing Page is guest-only
  mockupSrc: string; // micro-mockup of the Embun App UI
  mockupAlt: string;
  /** When true, renders a visible "Segera Hadir" badge. Does NOT exempt the
   *  item from requiring title/description/mockupSrc/mockupAlt (Requirement 3.6). */
  comingSoon?: boolean;
}

/**
 * Feature content for the App Landing Page's Fitur & Cara Kerja section.
 * At least 4 guest-facing features (Requirement 3.1), each with title,
 * description (≤2 sentences), mockupSrc, and mockupAlt (Requirement 3.2).
 * Includes one comingSoon item, "Asisten Pencarian Pintar (AI)", which is
 * not yet active on the current Embun App release (Requirements 3.6, 3.7).
 */
export const appFeatures: AppFeatureItem[] = [
  {
    id: 'pencarian-campsite',
    title: 'Pencarian Campsite',
    description:
      'Temukan campsite ideal dari berbagai mitra Embun berdasarkan lokasi, fasilitas, dan ulasan pengunjung lain. Filter pencarian membantu menemukan spot yang sesuai kebutuhan dalam hitungan detik.',
    audience: 'guest',
    mockupSrc: '/images/image1.png',
    mockupAlt: 'Tampilan hasil pencarian campsite dengan filter lokasi, fasilitas, dan rating ulasan',
  },
  {
    id: 'pemesanan-mudah',
    title: 'Pemesanan Mudah',
    description:
      'Pesan spot favorit dalam beberapa langkah singkat, tanpa ribet dan tanpa perlu telepon pemilik campsite. Konfirmasi pesanan diterima langsung di aplikasi.',
    audience: 'guest',
    mockupSrc: '/images/image2.png',
    mockupAlt: 'Tampilan alur pemesanan spot camping dari pilih tanggal hingga konfirmasi pesanan',
  },
  {
    id: 'asisten-pencarian-ai',
    title: 'Asisten Pencarian Pintar (AI)',
    description:
      'Asisten percakapan dalam Embun App yang akan membantu Guest menemukan spot camping paling cocok hanya lewat beberapa pertanyaan sederhana. Fitur ini sedang disiapkan dan belum dapat digunakan pada versi aplikasi yang beredar saat ini.',
    audience: 'guest',
    mockupSrc: '/images/image3.png',
    mockupAlt: 'Tampilan percakapan asisten AI yang menanyakan preferensi Guest untuk merekomendasikan campsite',
    comingSoon: true,
  },
];
