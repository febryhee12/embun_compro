/** A single benefit shown in the Partner landing page Benefits section. */
export interface PartnerBenefitItem {
  id: string;
  title: string; // e.g. 'Reservasi', 'Komisi Otomatis', 'Manajemen Blok'
  description: string; // max 2 sentences
  mockupSrc: string; // micro-mockup of the Embun dashboard UI
  mockupAlt: string;
}

/**
 * Benefit content for the Partner landing page Benefits section.
 * Reuses the owner-facing content from lib/content/features.ts (Requirement 5.3).
 * At least 3 items, each with title, description (≤2 sentences), mockupSrc, and mockupAlt.
 */
export const partnerBenefits: PartnerBenefitItem[] = [
  {
    id: 'reservasi',
    title: 'Reservasi Masuk Lebih Rapi',
    description:
      'Setiap pesanan dari tamu tercatat otomatis dengan status yang mudah dipantau. Tim campsite tidak perlu lagi mengandalkan catatan manual atau percakapan yang tercecer.',
    mockupSrc: '/images/mitra_need1.png',
    mockupAlt: 'Ringkasan reservasi masuk dan status pemesanan untuk mitra Embun',
  },
  {
    id: 'bagi-hasil-otomatis',
    title: 'Pendapatan Mudah Dipantau',
    description:
      'Ringkasan pendapatan dari pemesanan tersaji jelas, termasuk status pembayaran dan pencairan. Pemilik campsite bisa membaca performa usaha tanpa membuka laporan teknis yang rumit.',
    mockupSrc: '/images/mitra_need2.png',
    mockupAlt: 'Ringkasan pendapatan dan status pembayaran untuk mitra Embun',
  },
  {
    id: 'manajemen-blok-spot',
    title: 'Ketersediaan Selalu Terkontrol',
    description:
      'Tanggal, kapasitas, dan pilihan area camping bisa diatur dari satu tempat. Informasi yang dilihat tamu tetap selaras dengan kondisi operasional di lokasi.',
    mockupSrc: '/images/mitra_need3.png',
    mockupAlt:
      'Tampilan pengaturan ketersediaan area camping untuk mitra Embun',
  },
];
