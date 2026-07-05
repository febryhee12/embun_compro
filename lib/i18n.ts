export const i18n = {
  id: {
    app: {
      hero: {
        headline: 'Cari dan Pesan Campsite Favoritmu, Semudah Itu',
        subcopy: 'Embun App membantu kamu menemukan dan memesan campsite terbaik dalam hitungan menit. Bayar aman, pesanan langsung terkonfirmasi.',
      },
      features: undefined, // uses default
      screenshots: {
        headline: 'Semua Kebutuhan Campingmu dalam Satu Aplikasi',
        subcopy: 'Dari mencari lokasi ideal, membayar dengan aman, hingga menyimpan riwayat perjalanan — Embun App dirancang khusus untuk mempermudah petualanganmu di alam.',
        items: undefined,
      },
      faq: {
        heading: 'Pertanyaan yang Sering Diajukan',
        items: undefined,
      },
      downloadCta: {
        headline: 'Siap untuk Petualangan Selanjutnya?',
        subcopy: 'Unduh Embun App sekarang. Temukan dan pesan campsite favoritmu langsung dari genggaman. Tersedia gratis di App Store dan Google Play.',
      }
    },
    partner: {
      hero: {
        headline: 'Kelola Campsite Anda, Reservasi Biar Kami yang Urus',
        subcopy: 'Embun mencatat setiap reservasi dan pembayaran secara otomatis, jadi Anda bisa fokus mengelola campsite tanpa repot administrasi manual.',
        ctaLabel: 'Daftar Jadi Mitra'
      },
      benefits: {
        heading: 'Yang Anda Dapatkan Sebagai Mitra',
        subcopy: 'Reservasi tercatat otomatis dan komisi terhitung sendiri, jadi Anda bisa fokus mengelola campsite tanpa repot administrasi manual.',
        items: undefined,
      },
      directoryTeaser: {
        heading: 'Direktori Mitra Segera Hadir',
        subcopy: 'Kami sedang menyiapkan direktori mitra Embun. Jadilah salah satu campsite pertama yang bergabung dan tampil di sana.',
      },
      faq: {
        heading: 'Pertanyaan yang Sering Diajukan',
        items: undefined,
      },
      contact: {
        heading: 'Hubungi Kami',
        subcopy: 'Punya campsite atau pertanyaan? Isi formulir di bawah dan tim kami akan menghubungi Anda segera.'
      },
      cta: {
        heading: 'Siap Membawa Campsite Anda ke Lebih Banyak Tamu?',
        subcopy: 'Jadilah salah satu campsite pertama yang bergabung dengan Embun dan rasakan bagaimana reservasi serta pembayaran terkelola secara otomatis.',
        ctaLabel: 'Daftarkan Campsite Anda',
      }
    }
  },
  en: {
    app: {
      hero: {
        headline: 'Find and Book Your Favorite Campsite, Just Like That',
        subcopy: 'Embun App helps you discover and book the best campsites in minutes. Secure payments, instant confirmations.',
      },
      features: [
        {
          id: 'pencarian-mudah',
          title: 'Easy Search',
          description: 'Find campsites that match your criteria. Filter by location, price, amenities, and read real reviews from fellow campers.',
          mockupSrc: '/images/mockups/search.png',
          mockupAlt: 'Search interface mockup',
          audience: 'Tamu' as any,
        },
        {
          id: 'booking-instan',
          title: 'Instant Booking',
          description: 'No more waiting for replies. Check availability in real-time and book your spot immediately through the app.',
          mockupSrc: '/images/mockups/booking.png',
          mockupAlt: 'Booking interface mockup',
          audience: 'Tamu' as any,
        },
        {
          id: 'pembayaran-aman',
          title: 'Secure Payments',
          description: 'Multiple payment options from bank transfers to e-wallets, processed securely to guarantee your reservation.',
          mockupSrc: '/images/mockups/payment.png',
          mockupAlt: 'Payment interface mockup',
          audience: 'Tamu' as any,
        },
      ],
      screenshots: {
        headline: 'Everything You Need for Camping in One App',
        subcopy: 'From finding the ideal location, paying securely, to keeping your travel history — Embun App is designed specifically to simplify your nature adventures.',
        items: [
          {
            id: 'explore',
            title: 'Explore Campsites',
            description: 'Discover hidden gems and popular spots alike.',
            src: '/images/screenshots/1-explore.png',
            alt: 'Explore screen',
          },
          {
            id: 'detail',
            title: 'Detailed Info',
            description: 'View full amenities, rules, and real photos.',
            src: '/images/screenshots/2-detail.png',
            alt: 'Detail screen',
          },
          {
            id: 'booking',
            title: 'Easy Booking',
            description: 'Select your dates and spots seamlessly.',
            src: '/images/screenshots/3-booking.png',
            alt: 'Booking screen',
          },
          {
            id: 'payment',
            title: 'Secure Checkout',
            description: 'Pay safely with your preferred method.',
            src: '/images/screenshots/4-payment.png',
            alt: 'Payment screen',
          },
        ]
      },
      faq: {
        heading: 'Frequently Asked Questions',
        items: [
          {
            question: 'Is Embun App free to download?',
            answer: 'Yes, Embun App is completely free to download on both App Store and Google Play. You only pay for the campsite reservations you make.'
          },
          {
            question: 'How do I know my booking is confirmed?',
            answer: 'Once your payment is successful, you will instantly receive a digital booking voucher in the app and via email. You just need to show this voucher at the campsite.'
          },
          {
            question: 'Can I cancel or reschedule my booking?',
            answer: 'Yes, you can request a cancellation or reschedule directly from the app. Please note that refunds and changes are subject to the specific policy of each campsite.'
          },
          {
            question: 'What payment methods are supported?',
            answer: 'We support various secure payment methods including bank transfers (Virtual Accounts), credit cards, and popular e-wallets like GoPay, OVO, and ShopeePay.'
          }
        ]
      },
      downloadCta: {
        headline: 'Ready for Your Next Adventure?',
        subcopy: 'Download Embun App now. Find and book your favorite campsite right from your fingertips. Available for free on the App Store and Google Play.',
      }
    },
    partner: {
      hero: {
        headline: 'Manage Your Campsite, Let Us Handle the Reservations',
        subcopy: 'Embun records every reservation and payment automatically, so you can focus on managing your campsite without the hassle of manual administration.',
        ctaLabel: 'Register as Partner'
      },
      benefits: {
        heading: 'What You Get as a Partner',
        subcopy: 'Reservations are recorded automatically and commissions calculated for you, so you can focus on managing your campsite.',
        items: [
          {
            id: 'reservasi',
            title: 'Reservation Management',
            description: 'All incoming bookings from guests are automatically recorded, complete with real-time status and spot availability. Partners no longer need to record manually in a book or spreadsheet.',
            mockupSrc: '/images/mockups/reservasi.png',
            mockupAlt: 'Dashboard showing reservation list and calendar'
          },
          {
            id: 'bagi-hasil-otomatis',
            title: 'Automated Profit Sharing',
            description: 'Every successful transaction is calculated and recorded automatically, without manual billing. Partners directly receive net income reports from each booking.',
            mockupSrc: '/images/mockups/komisi.png',
            mockupAlt: 'Dashboard showing transaction details and net income'
          },
          {
            id: 'manajemen-blok-spot',
            title: 'Block & Spot Management',
            description: 'Easily set layout, prices, and capacity for each camping spot through a visual editor. Changes are immediately synced to the guest search page.',
            mockupSrc: '/images/mockups/manajemen-blok.png',
            mockupAlt: 'Visual editor for block and spot map'
          }
        ]
      },
      directoryTeaser: {
        heading: 'Partner Directory Coming Soon',
        subcopy: 'We are preparing the Embun partner directory. Be one of the first campsites to join and appear there.',
      },
      faq: {
        heading: 'Frequently Asked Questions',
        items: [
          {
            question: 'What is Embun\'s service fee structure for partners?',
            answer: 'Embun implements a profit-sharing scheme as a percentage of every successful booking transaction through the platform. The amount is agreed upon during partner registration, and there are no hidden fees.'
          },
          {
            question: 'How do I register as an Embun partner?',
            answer: 'Campsite owners who want to join can contact the Embun team via the contact form on the Partner page. We will follow up with location verification and account setup.'
          },
          {
            question: 'Are there any fees to join as a partner?',
            answer: 'There are no registration or monthly fees to join. Embun only applies profit sharing on successful booking transactions, so owners bear no upfront costs.'
          },
          {
            question: 'How does the fund settlement process work?',
            answer: 'Booking funds are disbursed to the partner\'s account periodically after deducting Embun\'s service fee, according to the applicable settlement cycle. Partners can monitor transaction history via the dashboard.'
          }
        ]
      },
      contact: {
        heading: 'Contact Us',
        subcopy: 'Own a campsite or have questions? Fill out the form below and our team will get back to you shortly.'
      },
      cta: {
        heading: 'Ready to Bring More Guests to Your Campsite?',
        subcopy: 'Be one of the first campsites to join Embun and experience how reservations and payments are managed automatically.',
        ctaLabel: 'Register Your Campsite',
      }
    }
  }
};
