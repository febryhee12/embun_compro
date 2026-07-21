/** A single FAQ entry shown in the App Landing Page's FAQ section. */
export interface FaqItem {
  question: string;
  /**
   * Written as a complete, self-contained sentence (or 2-3 sentences) that
   * makes sense on its own without relying on the question or any
   * surrounding visual context — since this content may be quoted directly
   * by AI answer engines (Requirement 14.6).
   */
  answer: string;
}

/**
 * FAQ content for the App Landing Page (Requirement 14.2). At least 4
 * guest-facing questions about the Embun App, each answered in full,
 * self-contained sentences suitable for direct quotation by AI answer
 * engines (Requirement 14.6).
 */
export const appFaq: FaqItem[] = [
  {
    question: 'Apa itu Embun App?',
    answer:
      'Embun App adalah aplikasi untuk mencari dan memesan spot outdoor dari mitra Embun di seluruh Indonesia — mulai dari glamping, cabin, campervan, motocamp, bikecamp, saung, hingga area camping biasa. Lengkap dengan detail spot, ketersediaan tanggal, dan pembayaran langsung dari ponsel tanpa perlu menghubungi pemilik secara manual.',
  },
  {
    question: 'Bagaimana cara memesan spot lewat Embun App?',
    answer:
      'Cari lokasi atau nama spot yang diinginkan, pilih tanggal dan tipe akomodasi yang tersedia, lalu bayar langsung di aplikasi. Konfirmasi pesanan muncul otomatis setelah pembayaran berhasil.',
  },
  {
    question: 'Apakah pembayaran di Embun App aman?',
    answer:
      'Ya, pembayaran diproses lewat payment gateway tepercaya dan tercatat otomatis di aplikasi tidak perlu transfer manual ke pemilik campsite.',
  },
  {
    question: 'Apa yang harus dilakukan jika ingin membatalkan pesanan?',
    answer:
      'Buka riwayat pemesanan di aplikasi dan ajukan pembatalan sesuai kebijakan Embun. Detail lengkap ada di halaman Kebijakan Refund & Pembatalan di website Embun.',
  },
];
