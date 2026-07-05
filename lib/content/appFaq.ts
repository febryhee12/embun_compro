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
      'Embun App adalah aplikasi mobile untuk mencari dan memesan campsite dari berbagai mitra Embun di seluruh Indonesia. Melalui Embun App, pengguna dapat melihat detail spot camping, memesan tanggal yang tersedia, dan menyelesaikan pembayaran langsung dari ponsel tanpa perlu menghubungi pemilik campsite secara manual.',
  },
  {
    question: 'Bagaimana cara memesan campsite lewat Embun App?',
    answer:
      'Untuk memesan campsite lewat Embun App, pengguna cukup mencari lokasi atau nama campsite yang diinginkan, memilih tanggal dan spot yang tersedia, lalu menyelesaikan pembayaran di dalam aplikasi. Konfirmasi pesanan akan langsung muncul di aplikasi setelah pembayaran berhasil, tanpa perlu menunggu balasan manual dari pemilik campsite.',
  },
  {
    question: 'Apakah pembayaran di Embun App aman?',
    answer:
      'Ya, Embun App mendukung pembayaran non-tunai yang aman melalui payment gateway tepercaya, termasuk transfer bank dan e-wallet. Setiap transaksi tercatat secara otomatis di dalam aplikasi sehingga pengguna tidak perlu melakukan transfer manual langsung ke pemilik campsite.',
  },
  {
    question: 'Apa yang harus dilakukan jika ingin membatalkan pesanan?',
    answer:
      'Pengguna yang ingin membatalkan pesanan dapat membuka riwayat pemesanan di dalam Embun App dan mengajukan pembatalan sesuai dengan kebijakan pembatalan dan refund yang berlaku pada campsite terkait. Ketentuan lengkap mengenai pembatalan dan pengembalian dana dapat dibaca pada halaman Kebijakan Refund & Pembatalan di Website Embun.',
  },
];
