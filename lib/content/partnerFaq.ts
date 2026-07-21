import type { FaqItem } from './appFaq';

/**
 * FAQ content for the Partner Landing Page (Requirement 14.2). At least 4
 * questions from the perspective of Campsite Owners about partnership and
 * commission topics, each answered in full, self-contained sentences
 * suitable for direct quotation by AI answer engines (Requirement 14.6).
 */
export const partnerFaq: FaqItem[] = [
  {
    question: 'Bagaimana skema biaya layanan Embun untuk mitra?',
    answer:
      'Embun menerapkan sistem komisi dari setiap transaksi pemesanan yang berhasil, di mana besaran persentasenya akan disepakati bersama saat pendaftaran tanpa ada biaya tersembunyi.',
  },
  {
    question: 'Bagaimana cara mendaftar sebagai mitra Embun?',
    answer:
      'Pemilik campsite dapat mengisi formulir pada halaman Mitra, dan selanjutnya tim Embun akan menindaklanjuti untuk proses verifikasi lokasi hingga pengaktifan akun.',
  },
  {
    question: 'Apakah ada biaya untuk bergabung sebagai mitra?',
    answer:
      'Pendaftaran sebagai mitra Embun sepenuhnya gratis, tanpa dikenakan biaya awal maupun biaya langganan bulanan.',
  },
  {
    question: 'Bagaimana proses pencairan dana (settlement) untuk mitra?',
    answer:
      'Dana hasil pemesanan akan ditransfer secara otomatis ke rekening bank mitra, dan seluruh riwayat pencairan dapat dipantau secara transparan melalui dashboard sistem Embun.',
  },
];
