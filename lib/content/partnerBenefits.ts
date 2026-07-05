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
    title: 'Manajemen Reservasi',
    description:
      'Semua booking yang masuk dari tamu di platform Embun tercatat otomatis, lengkap dengan status dan ketersediaan spot secara real-time. Mitra tidak perlu lagi mencatat manual di buku atau spreadsheet.',
    mockupSrc: '/images/mockups/reservasi.png',
    mockupAlt: 'Tampilan dashboard daftar reservasi dengan status booking dan kalender ketersediaan spot',
  },
  {
    id: 'bagi-hasil-otomatis',
    title: 'Bagi Hasil Otomatis',
    description:
      'Setiap transaksi yang berhasil dihitung dan dicatat otomatis, tanpa tagihan manual. Mitra langsung menerima laporan pendapatan bersih dari setiap pemesanan.',
    mockupSrc: '/images/mockups/komisi.png',
    mockupAlt: 'Tampilan dashboard rincian transaksi otomatis dan ringkasan pendapatan bersih mitra',
  },
  {
    id: 'manajemen-blok-spot',
    title: 'Manajemen Blok & Spot',
    description:
      'Atur layout, harga, dan kapasitas setiap titik camping dengan mudah melalui editor visual. Perubahan langsung tersinkron ke halaman pencarian tamu di platform Embun.',
    mockupSrc: '/images/mockups/manajemen-blok.png',
    mockupAlt: 'Tampilan editor visual peta blok dan spot camping dengan pengaturan harga dan kapasitas',
  },
];
