/** A single benefit shown in the "Jadi Mitra" partner-recruitment section. */
export interface PartnerBenefit {
  id: string;
  title: string;
  description: string;
}

/**
 * Benefit copy for the "Jadi Mitra Campsite Embun" partner-recruitment
 * section. Embun has no real onboarded partners to showcase yet, so this
 * section recruits new supply instead of presenting fictional partner
 * social proof — each benefit reflects the actual marketplace/commission
 * business model (reach, automated reservations, transparent commission,
 * no upfront registration cost).
 */
export const partnerBenefits: PartnerBenefit[] = [
  {
    id: 'lebih-banyak-tamu',
    title: 'Lebih Banyak Tamu',
    description:
      'Campsite Anda tampil di platform Embun dan ditemukan oleh tamu baru yang sedang mencari tempat camping.',
  },
  {
    id: 'reservasi-otomatis',
    title: 'Reservasi Otomatis',
    description:
      'Reservasi, ketersediaan spot, dan konfirmasi tamu tercatat otomatis — tidak perlu lagi dicatat manual.',
  },
  {
    id: 'bagi-hasil-transparan',
    title: 'Bagi Hasil Transparan',
    description:
      'Embun menerapkan bagi hasil dari transaksi yang berhasil, dengan rincian yang jelas. Anda selalu tahu persis pendapatan bersih Anda.',
  },
  {
    id: 'tanpa-biaya-pendaftaran',
    title: 'Tanpa Biaya Pendaftaran',
    description:
      'Bergabung menjadi mitra Embun tidak dipungut biaya di muka. Bagi hasil hanya berlaku saat Anda mendapat tamu.',
  },
];

/** Accent photo shown alongside the partner-recruitment copy. */
export const partnerAccentPhoto = {
  photoSrc: '/images/portfolio/hutan-pinus.jpg',
  photoAlt: 'Area perkemahan asri dengan tenda-tenda di antara pepohonan hijau',
};
