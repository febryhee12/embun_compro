/** A single screenshot shown in the App Landing Page's Tangkapan Layar section. */
export interface ScreenshotItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Screenshot content for the App Landing Page's Tangkapan Layar section.
 * At least 3 screenshots representing the core guest flow — search →
 * campsite detail → checkout/booking (Requirement 4.1) — each with a
 * descriptive `alt` and a short numbered `caption`.
 */
export const screenshots: ScreenshotItem[] = [
  {
    id: 'pencarian',
    src: '/images/screenshots/pencarian.png',
    alt: 'Tangkapan layar Embun App menampilkan hasil pencarian campsite berdasarkan lokasi dan fasilitas',
    caption: '1. Cari campsite sesuai lokasi dan kebutuhanmu',
  },
  {
    id: 'detail-campsite',
    src: '/images/screenshots/detail-campsite.png',
    alt: 'Tangkapan layar Embun App menampilkan halaman detail campsite dengan foto, fasilitas, dan pilihan spot',
    caption: '2. Lihat detail campsite dan pilih spot yang kamu mau',
  },
  {
    id: 'checkout',
    src: '/images/screenshots/checkout.png',
    alt: 'Tangkapan layar Embun App menampilkan halaman checkout dan konfirmasi pemesanan campsite',
    caption: '3. Selesaikan pemesanan dan bayar dengan aman',
  },
];
