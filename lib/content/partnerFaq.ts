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
      'Embun menerapkan skema bagi hasil berupa persentase dari setiap transaksi booking yang berhasil melalui platform. Besarannya disepakati bersama pada saat pendaftaran mitra, dan tidak ada biaya tersembunyi lain yang dipotong dari hasil penjualan campsite.',
  },
  {
    question: 'Bagaimana cara mendaftar sebagai mitra Embun?',
    answer:
      'Pemilik campsite yang ingin bergabung sebagai mitra Embun dapat menghubungi tim Embun melalui formulir kontak yang tersedia di halaman Mitra pada Website Embun. Tim Embun akan menindaklanjuti pendaftaran dengan proses verifikasi lokasi dan penyiapan akun sebelum campsite dapat mulai menerima booking.',
  },
  {
    question: 'Apakah ada biaya untuk bergabung sebagai mitra?',
    answer:
      'Tidak ada biaya pendaftaran atau biaya bulanan untuk bergabung sebagai mitra Embun. Embun hanya menerapkan bagi hasil dari transaksi booking yang berhasil, sehingga pemilik campsite tidak menanggung biaya di muka sebelum mendapatkan penjualan.',
  },
  {
    question: 'Bagaimana proses pencairan dana (settlement) untuk mitra?',
    answer:
      'Dana hasil booking dicairkan ke rekening mitra secara berkala setelah dikurangi biaya layanan Embun, sesuai dengan siklus settlement yang berlaku. Mitra dapat memantau riwayat transaksi dan status pencairan dana melalui akun mitra pada sistem Embun.',
  },
];
