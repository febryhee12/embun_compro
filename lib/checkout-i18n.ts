export type Language = 'id' | 'en';

export const CHECKOUT_I18N = {
  id: {
    loading: 'Memuat halaman pemesanan...',
    notFoundTitle: 'Pemesanan Tidak Ditemukan',
    notFoundDesc:
      'Sesi pemilihan unit Anda telah berakhir atau belum dimulai. Silakan pilih unit camping kembali.',
    backToExplore: 'Kembali ke Explore',
    back: 'Kembali',
    pageTitle: 'Tinjau & Konfirmasi Pemesanan',
    tripSection: {
      title: 'Perjalanan Anda',
      dates: 'Tanggal',
      duration: (nights: number) => `${nights} Malam`,
      guests: 'Tamu',
      guestsCount: (count: number) => `${count} Orang`,
    },
    contactSection: {
      title: 'Data Kontak Tamu',
      fullNameLabel: 'Nama Lengkap Pemesan *',
      fullNamePlaceholder: 'Masukkan nama sesuai KTP',
      phoneLabel: 'Nomor WhatsApp / HP *',
      phonePlaceholder: '81234567890',
      emailLabel: 'Email (Opsional)',
      emailPlaceholder: 'nama@email.com',
      addressLabel: 'Alamat / Kota Asal Pemesan *',
      addressPlaceholder: 'Contoh: Jl. Dago No. 12, Bandung',
    },
    paymentSchemeSection: {
      title: 'Skema Pembayaran',
      badgeDp: 'Uang Muka (DP 50%)',
      badgeFull: 'Bayar Lunas',
      dpTitle: 'Uang Muka (DP 50%)',
      fullTitle: 'Pembayaran Penuh (Lunas)',
      dpSub: (balance: string) => `Sisa ${balance} wajib dilunasi paling lambat H-1`,
      fullSub: 'Lunas langsung tanpa sisa tagihan',
      dpNotice: (payable: string, balance: string) =>
        `Anda hanya membayar ${payable} saat ini. Sisa tagihan sebesar ${balance} wajib dilunasi melalui aplikasi Embun paling lambat H-1 sebelum tanggal check-in.`,
    },
    notesSection: {
      title: 'Catatan untuk Campsite',
      optionalBadge: 'Opsional',
      desc: 'Punya permintaan khusus, perkiraan jam tiba, atau info tambahan untuk pihak campsite? Sampaikan langsung di sini.',
      placeholder:
        'Contoh: Estimasi sampai lokasi sekitar jam 4 sore, kalau boleh minta tolong spot dekat fasilitas air / toilet ya...',
    },
    policySection: {
      title: 'Kebijakan Penginapan',
      checkInOutLabel: 'Waktu Check-In & Check-Out:',
      checkInOutDesc: (inTime: string, outTime: string) =>
        ` Check-in mulai pukul ${inTime} WIB, check-out maksimal pukul ${outTime} WIB.`,
      rescheduleLabel: 'Kebijakan Ubah Jadwal:',
      rescheduleDesc:
        ' Reschedule dapat diajukan minimal H-7 sebelum tanggal check-in untuk pesanan yang telah lunas.',
      cancellationLabel: 'Kebijakan Pembatalan & Refund:',
      cancellationDesc:
        ' Pengajuan pembatalan atau pengembalian dana tunduk pada syarat dan tenggat waktu resmi. ',
      cancellationLink: 'Lihat Rincian Batas Waktu Refund',
      paymentLabel: 'Pembayaran Resmi:',
      paymentDesc:
        ' Seluruh transaksi diproses melalui jalur pembayaran resmi dan terenkripsi. Tidak ada transaksi di luar sistem Embun.',
      agreementPrefix: 'Saya telah membaca dan menyetujui seluruh aturan di atas serta ',
      refundPolicyLink: 'Kebijakan Refund & Pembatalan',
    },
    pendingBanner: {
      title: (orderId: string) =>
        `Kavling ini sedang Anda booking pada pesanan sebelumnya (#${orderId})`,
      desc: 'Sistem sedang menahan kavling ini selama 15 menit untuk Anda. Anda dapat langsung melanjutkan pembayaran pesanan ini, atau batalkan pesanan lama untuk membuat baru.',
      continueBtn: 'Lanjutkan Bayar Sekarang',
      cancelBtn: 'Batalkan Pesanan Lama & Buat Baru',
      viewDetail: 'Lihat Rincian',
    },
    buttons: {
      confirmAndPay: (amount: string) => `Konfirmasi & Bayar · ${amount}`,
      processing: 'Memproses Pembayaran...',
      secureHint: 'Halaman pembayaran aman akan terbuka otomatis setelah konfirmasi.',
    },
    summary: {
      unitMeta: (nights: number, guests: number) => `${nights} Malam · ${guests} Tamu`,
      priceDetailsTitle: 'Rincian Harga',
      spotPriceFormula: (price: string, nights: number) => `${price} × ${nights} malam`,
      extraGuestsTitle: 'Tamu Tambahan',
      extraGuestsFormula: (count: number, price: string, nights: number) =>
        `${count} orang × ${price} × ${nights} malam`,
      additionalAddonsTitle: 'Perlengkapan Tambahan:',
      serviceAndTaxFee: 'Biaya Layanan & Pajak',
      totalBill: 'Total Tagihan',
      dpPaidNow: 'Dibayar Sekarang (DP 50% + Fee)',
      dpRemaining: 'Sisa Pelunasan di H-1',
      secureTransaction:
        'Transaksi terenkripsi dengan standar keamanan pembayaran digital',
    },
    errors: {
      fillName: 'Mohon lengkapi nama lengkap pemesan sesuai identitas.',
      fillPhone: 'Mohon lengkapi nomor WhatsApp yang aktif untuk konfirmasi & tiket.',
      fillAddress: 'Mohon lengkapi alamat atau kota asal pemesan.',
      agreeRequired: 'Mohon setujui kebijakan & syarat penginapan sebelum melanjutkan.',
      authRequired: 'Silakan masuk terlebih dahulu untuk melanjutkan pembayaran.',
      createFailed: 'Gagal membuat pesanan di server.',
      urlFailed: 'Gagal mendapatkan URL pembayaran.',
      sessionExpired: 'Sesi login telah berakhir. Silakan masuk kembali.',
      spotFull: 'Spot yang Anda pilih sudah penuh pada tanggal yang dipilih.',
      orderFailed: 'Gagal memproses pesanan.',
      resumeFailed: 'Gagal melanjutkan pembayaran pesanan.',
      cancelOldFailed: 'Gagal membatalkan pesanan lama.',
    },
  },
  en: {
    loading: 'Loading checkout page...',
    notFoundTitle: 'Booking Not Found',
    notFoundDesc:
      'Your booking session has expired or has not started yet. Please select a camping unit again.',
    backToExplore: 'Back to Explore',
    back: 'Back',
    pageTitle: 'Review & Confirm Booking',
    tripSection: {
      title: 'Your Trip',
      dates: 'Dates',
      duration: (nights: number) => `${nights} ${nights > 1 ? 'Nights' : 'Night'}`,
      guests: 'Guests',
      guestsCount: (count: number) => `${count} ${count > 1 ? 'Guests' : 'Guest'}`,
    },
    contactSection: {
      title: 'Guest Contact Details',
      fullNameLabel: 'Full Name *',
      fullNamePlaceholder: 'Enter full name as on ID/Passport',
      phoneLabel: 'WhatsApp / Phone Number *',
      phonePlaceholder: '81234567890',
      emailLabel: 'Email (Optional)',
      emailPlaceholder: 'name@email.com',
      addressLabel: 'Address / Origin City *',
      addressPlaceholder: 'e.g. Jl. Dago No. 12, Bandung',
    },
    paymentSchemeSection: {
      title: 'Payment Scheme',
      badgeDp: 'Down Payment (50%)',
      badgeFull: 'Pay in Full',
      dpTitle: 'Down Payment (50%)',
      fullTitle: 'Full Payment',
      dpSub: (balance: string) => `Remaining ${balance} must be settled by D-1`,
      fullSub: 'Paid in full with no remaining balance',
      dpNotice: (payable: string, balance: string) =>
        `You only pay ${payable} now. The remaining balance of ${balance} must be paid via Embun app at latest D-1 before check-in date.`,
    },
    notesSection: {
      title: 'Notes for Campsite',
      optionalBadge: 'Optional',
      desc: 'Have special requests, estimated arrival time, or extra info for the campsite? Let them know here.',
      placeholder:
        'e.g. Estimated arrival around 4 PM, if possible near water / restroom facilities...',
    },
    policySection: {
      title: 'Stay Policies',
      checkInOutLabel: 'Check-In & Check-Out Hours:',
      checkInOutDesc: (inTime: string, outTime: string) =>
        ` Check-in from ${inTime} WIB, check-out until ${outTime} WIB.`,
      rescheduleLabel: 'Reschedule Policy:',
      rescheduleDesc:
        ' Rescheduling can be requested at least 7 days before check-in date for fully paid bookings.',
      cancellationLabel: 'Cancellation & Refund Policy:',
      cancellationDesc:
        ' Cancellation or refund requests are subject to official terms and deadlines. ',
      cancellationLink: 'View Refund Deadline Details',
      paymentLabel: 'Official Payment:',
      paymentDesc:
        ' All transactions are processed through official encrypted payment channels. No transactions outside the Embun system.',
      agreementPrefix: 'I have read and agree to all the rules above and the ',
      refundPolicyLink: 'Refund & Cancellation Policy',
    },
    pendingBanner: {
      title: (orderId: string) =>
        `This spot is currently reserved in your previous booking (#${orderId})`,
      desc: 'The system is holding this spot for you for 15 minutes. You can continue paying for this order, or cancel the old order to create a new one.',
      continueBtn: 'Continue Payment Now',
      cancelBtn: 'Cancel Old Booking & Create New',
      viewDetail: 'View Details',
    },
    buttons: {
      confirmAndPay: (amount: string) => `Confirm & Pay · ${amount}`,
      processing: 'Processing Payment...',
      secureHint: 'A secure payment page will open automatically after confirmation.',
    },
    summary: {
      unitMeta: (nights: number, guests: number) =>
        `${nights} ${nights > 1 ? 'Nights' : 'Night'} · ${guests} ${guests > 1 ? 'Guests' : 'Guest'}`,
      priceDetailsTitle: 'Price Details',
      spotPriceFormula: (price: string, nights: number) =>
        `${price} × ${nights} ${nights > 1 ? 'nights' : 'night'}`,
      extraGuestsTitle: 'Extra Guests',
      extraGuestsFormula: (count: number, price: string, nights: number) =>
        `${count} ${count > 1 ? 'guests' : 'guest'} × ${price} × ${nights} ${nights > 1 ? 'nights' : 'night'}`,
      additionalAddonsTitle: 'Additional Equipment:',
      serviceAndTaxFee: 'Service Fee & Tax',
      totalBill: 'Total Amount',
      dpPaidNow: 'Pay Now (50% DP + Fee)',
      dpRemaining: 'Remaining Balance at D-1',
      secureTransaction:
        'Encrypted transaction with digital payment security standards',
    },
    errors: {
      fillName: 'Please enter the guest’s full name as shown on ID.',
      fillPhone: 'Please enter an active WhatsApp number for confirmation & ticket.',
      fillAddress: 'Please enter the guest’s address or home city.',
      agreeRequired: 'Please agree to the stay policies & terms before proceeding.',
      authRequired: 'Please sign in first to continue with payment.',
      createFailed: 'Failed to create order on server.',
      urlFailed: 'Failed to retrieve payment URL.',
      sessionExpired: 'Login session has expired. Please sign in again.',
      spotFull: 'The selected spot is fully booked for the chosen dates.',
      orderFailed: 'Failed to process order.',
      resumeFailed: 'Failed to proceed with payment.',
      cancelOldFailed: 'Failed to cancel previous order.',
    },
  },
};
