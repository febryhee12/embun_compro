/** A single feature shown in the Features marketing section. */
export interface FeatureItem {
  id: string;
  title: string; // e.g. 'Reservasi', 'Komisi', 'Manajemen Blok'
  description: string; // max 2 sentences
  audience: 'owner' | 'guest' | 'both';
  mockupSrc: string; // micro-mockup of the Embun dashboard UI
  mockupAlt: string;
}

/**
 * Feature content for the Features marketing section.
 * At least 3 owner-facing features and 2 guest-facing features (Requirements 4.1, 4.2).
 * Each item has title, description (≤2 sentences), mockupSrc, and mockupAlt (Requirement 4.3).
 */
export const features: FeatureItem[] = [
  {
    id: 'reservasi',
    title: 'Manajemen Reservasi',
    description:
      'Semua booking yang masuk dari tamu di platform Embun tercatat otomatis, lengkap dengan status dan ketersediaan spot secara real-time. Mitra tidak perlu lagi mencatat manual di buku atau spreadsheet.',
    audience: 'owner',
    mockupSrc: '/images/mockups/reservasi.png',
    mockupAlt: 'Tampilan dashboard daftar reservasi dengan status booking dan kalender ketersediaan spot',
  },
  {
    id: 'komisi-otomatis',
    title: 'Komisi Otomatis',
    description:
      'Setiap transaksi yang berhasil dihitung dan dicatat otomatis tanpa tagihan manual. Mitra langsung menerima laporan pendapatan bersih dari setiap pemesanan.',
    audience: 'owner',
    mockupSrc: '/images/mockups/komisi.png',
    mockupAlt: 'Tampilan dashboard rincian komisi otomatis per transaksi dan ringkasan pendapatan bersih',
  },
  {
    id: 'manajemen-blok-spot',
    title: 'Manajemen Blok & Spot',
    description:
      'Atur layout, harga, dan kapasitas setiap titik camping dengan mudah melalui editor visual. Perubahan langsung tersinkron ke halaman pencarian tamu di platform Embun.',
    audience: 'owner',
    mockupSrc: '/images/mockups/manajemen-blok.png',
    mockupAlt: 'Tampilan editor visual peta blok dan spot camping dengan pengaturan harga dan kapasitas',
  },
  {
    id: 'pencarian-campsite',
    title: 'Pencarian Campsite',
    description:
      'Temukan campsite ideal dari berbagai mitra Embun berdasarkan lokasi, fasilitas, dan ulasan pengunjung lain. Filter pencarian membantu menemukan spot yang sesuai kebutuhan dalam hitungan detik.',
    audience: 'guest',
    mockupSrc: '/images/mockups/pencarian.png',
    mockupAlt: 'Tampilan hasil pencarian campsite dengan filter lokasi, fasilitas, dan rating ulasan',
  },
  {
    id: 'pemesanan-mudah',
    title: 'Pemesanan Mudah',
    description:
      'Pesan spot favorit dalam beberapa langkah singkat, tanpa ribet dan tanpa perlu telepon pemilik campsite. Konfirmasi booking diterima langsung di aplikasi.',
    audience: 'guest',
    mockupSrc: '/images/mockups/pemesanan.png',
    mockupAlt: 'Tampilan alur pemesanan spot camping dari pilih tanggal hingga konfirmasi booking',
  },
];
