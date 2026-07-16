export const i18n = {
  id: {
    app: {
      hero: {
        eyebrow: 'Sepraktis embun pagi, seluas caramu menikmati alam',
        headline: 'Cari dan Pesan Campsite Favoritmu, Semudah Itu',
        subcopy:
          'Embun App membantu kamu menemukan dan memesan campsite terbaik dalam hitungan menit. Bayar aman, pesanan langsung terkonfirmasi.',
        appStoreLead: undefined,
        googlePlayLead: undefined,
      },
      featuresHeading: undefined, // uses default
      featuresSubcopy: undefined,
      featuresComingSoonLabel: undefined,
      features: undefined, // uses default
      screenshots: {
        headline: 'Semua Kebutuhan Campingmu dalam Satu Aplikasi',
        subcopy:
          'Dari mencari lokasi ideal, membayar dengan aman, hingga menyimpan riwayat perjalanan — Embun App dirancang khusus untuk mempermudah petualanganmu di alam.',
        items: undefined,
      },
      faq: {
        heading: 'Pertanyaan yang Sering Diajukan',
        items: undefined,
      },
      downloadCta: {
        headline: 'Siap untuk Petualangan Selanjutnya?',
        subcopy:
          'Unduh Embun App sekarang. Temukan dan pesan campsite favoritmu langsung dari genggaman. Tersedia gratis di App Store dan Google Play.',
        appStoreLead: undefined,
        googlePlayLead: undefined,
      },
    },
    partner: {
      hero: {
        headline: 'Kelola Campsite Anda, Reservasi Biar Kami yang Urus',
        subcopy:
          'Embun mencatat setiap reservasi dan pembayaran secara otomatis, jadi Anda bisa fokus mengelola campsite tanpa repot administrasi manual.',
        ctaLabel: 'Daftar Jadi Mitra',
      },
      benefits: {
        heading: 'Yang Anda Dapatkan Sebagai Mitra',
        subcopy:
          'Booking, ketersediaan, dan pendapatan tersusun lebih rapi, sehingga operasional campsite tetap mudah dipantau tanpa banyak pekerjaan manual.',
        items: undefined,
      },
      directoryTeaser: {
        heading: 'Direktori Mitra Segera Hadir',
        subcopy:
          'Kami sedang menyiapkan direktori mitra Embun. Jadilah salah satu campsite pertama yang bergabung dan tampil di sana.',
        ctaLabel: 'Lihat Direktori',
      },
      faq: {
        heading: 'Pertanyaan yang Sering Diajukan',
        items: undefined,
      },
      contact: {
        heading: 'Hubungi Kami',
        subcopy:
          'Punya campsite atau pertanyaan? Isi formulir di bawah dan tim kami akan menghubungi Anda segera.',
      },
      cta: {
        heading: 'Siap Membawa Campsite Anda ke Lebih Banyak Tamu?',
        subcopy:
          'Jadilah salah satu campsite pertama yang bergabung dengan Embun dan rasakan bagaimana reservasi serta pembayaran terkelola secara otomatis.',
        ctaLabel: 'Daftarkan Campsite Anda',
      },
    },
  },
  en: {
    app: {
      hero: {
        eyebrow: 'As effortless as Embun, as vast as the way you enjoy nature',
        headline: 'Find and Book Your Favorite Campsite, Just Like That',
        subcopy:
          'Embun App helps you discover and book the best campsites in minutes. Secure payments, instant confirmations.',
        appStoreLead: 'Download on the',
        googlePlayLead: 'Get it on',
      },
      featuresHeading: 'Features that Make Camping Easier',
      featuresSubcopy:
        'From searching for a spot to paying, everything can be done right from your fingertips without having to repeatedly call the campsite owner.',
      featuresComingSoonLabel: 'Coming Soon',
      features: [
        {
          id: 'pencarian-campsite',
          title: 'Easy Campsite Search',
          description:
            'Find your ideal campsite from Embun partners based on location, amenities, and reviews. Our search filters help you find the right spot in seconds.',
          audience: 'guest',
          mockupSrc: '/images/mockups/pencarian.png',
          mockupAlt:
            'Campsite search result with location, amenity, and rating filters',
        },
        {
          id: 'pemesanan-mudah',
          title: 'Simple Booking',
          description:
            'Book your favorite spot in just a few taps, without the hassle of calling the campsite owner. Receive booking confirmation directly in the app.',
          audience: 'guest',
          mockupSrc: '/images/mockups/pemesanan.png',
          mockupAlt: 'Booking flow from selecting dates to confirmation',
        },
        {
          id: 'pembayaran-aman',
          title: 'Secure Payments',
          description:
            'Pay directly in the app using various secure cashless payment methods. Every transaction is neatly recorded without the need for manual transfers.',
          audience: 'guest',
          mockupSrc: '/images/mockups/pembayaran.png',
          mockupAlt: 'Payment page with secure cashless methods',
        },
        {
          id: 'riwayat-favorit',
          title: 'History & Favorites',
          description:
            'View your entire booking history and save your favorite campsites to easily re-book them later. Everything is organized in one place within the app.',
          audience: 'guest',
          mockupSrc: '/images/mockups/riwayat-favorit.png',
          mockupAlt: 'Booking history and favorite campsite collection view',
        },
        {
          id: 'asisten-pencarian-ai',
          title: 'Smart Search Assistant (AI)',
          description:
            'A conversational assistant in the Embun App that helps you find the perfect camping spot through a few simple questions. This feature is currently in preparation and will be available in future updates.',
          audience: 'guest',
          mockupSrc: '/images/mockups/asisten-ai.png',
          mockupAlt:
            'AI assistant conversation view asking for guest preferences',
          comingSoon: true,
        },
      ],
      screenshots: {
        headline: 'See It in Action',
        subcopy:
          'From searching for a campsite, viewing its details, to completing your booking — everything runs smoothly in the Embun App.',
        items: [
          {
            id: 'pencarian',
            src: '/images/screenshots/pencarian.png',
            alt: 'Embun App screenshot showing campsite search results by location and amenities',
            caption: '1. Find a campsite based on your location and needs',
          },
          {
            id: 'detail-campsite',
            src: '/images/screenshots/detail-campsite.png',
            alt: 'Embun App screenshot showing campsite details with photos, amenities, and spot options',
            caption: '2. View campsite details and select your spot',
          },
          {
            id: 'checkout',
            src: '/images/screenshots/checkout.png',
            alt: 'Embun App screenshot showing checkout and booking confirmation',
            caption: '3. Complete your booking and pay securely',
          },
        ],
      },
      faq: {
        heading: 'Frequently Asked Questions',
        items: [
          {
            question: 'What is Embun App?',
            answer:
              'Embun App is a mobile application for finding and booking campsites from various Embun partners across Indonesia. Through Embun App, users can view camping spot details, book available dates, and complete payments directly from their phones without needing to manually contact the campsite owner.',
          },
          {
            question: 'How do I book a campsite through Embun App?',
            answer:
              'To book a campsite via Embun App, simply search for your desired location or campsite name, select the available dates and spots, and complete the payment within the app. Booking confirmation will appear instantly in the app once payment is successful, with no need to wait for a manual reply from the campsite owner.',
          },
          {
            question: 'Are payments in Embun App secure?',
            answer:
              "Yes, Embun App supports secure cashless payments through trusted payment gateways, including bank transfers and e-wallets. Every transaction is automatically recorded in the app, so users don't need to make direct manual transfers to the campsite owner.",
          },
          {
            question: 'What should I do if I want to cancel a booking?',
            answer:
              'Users who wish to cancel a booking can open their booking history in the Embun App and submit a cancellation request according to the cancellation and refund policy of the respective campsite. Full terms regarding cancellations and refunds can be read on the Refund & Cancellation Policy page on the Embun Website.',
          },
        ],
      },
      downloadCta: {
        headline: 'Ready for Your Next Adventure?',
        subcopy:
          'Download Embun App now. Find and book your favorite campsite right from your fingertips. Available for free on the App Store and Google Play.',
        appStoreLead: 'Download on the',
        googlePlayLead: 'Get it on',
      },
    },
    partner: {
      hero: {
        headline: 'Manage Your Campsite, Let Us Handle the Reservations',
        subcopy:
          'Embun records every reservation and payment automatically, so you can focus on managing your campsite without the hassle of manual administration.',
        ctaLabel: 'Register as Partner',
      },
      benefits: {
        heading: 'What You Get as a Partner',
        subcopy:
          'Bookings, availability, and revenue stay neatly organized, so campsite operations are easier to monitor without extra manual work.',
        items: [
          {
            id: 'reservasi',
            title: 'Cleaner Incoming Bookings',
            description:
              'Every guest booking is recorded automatically with a clear status to monitor. Campsite teams no longer need to rely on scattered notes or message threads.',
            mockupSrc: '/images/mockups/reservasi.png',
            mockupAlt:
              'Incoming booking summary and reservation status for Embun partners',
          },
          {
            id: 'bagi-hasil-otomatis',
            title: 'Revenue That Is Easy to Track',
            description:
              'Booking revenue is shown clearly, including payment and payout status. Campsite owners can understand business performance without digging through technical reports.',
            mockupSrc: '/images/mockups/komisi.png',
            mockupAlt: 'Revenue and payment status summary for Embun partners',
          },
          {
            id: 'manajemen-blok-spot',
            title: 'Availability Always Under Control',
            description:
              'Dates, capacity, and camping area options can be managed from one place. What guests see stays aligned with real operations on site.',
            mockupSrc: '/images/mockups/manajemen-blok.png',
            mockupAlt: 'Camping area availability settings for Embun partners',
          },
        ],
      },
      directoryTeaser: {
        heading: 'Partner Directory Coming Soon',
        subcopy:
          'We are preparing the Embun partner directory. Be one of the first campsites to join and appear there.',
        ctaLabel: 'View Directory',
      },
      faq: {
        heading: 'Frequently Asked Questions',
        items: [
          {
            question: "What is Embun's service fee structure for partners?",
            answer:
              'Embun implements a profit-sharing scheme as a percentage of every successful booking transaction through the platform. The amount is agreed upon during partner registration, and there are no hidden fees.',
          },
          {
            question: 'How do I register as an Embun partner?',
            answer:
              'Campsite owners who want to join can contact the Embun team via the contact form on the Partner page. We will follow up with location verification and account setup.',
          },
          {
            question: 'Are there any fees to join as a partner?',
            answer:
              'There are no registration or monthly fees to join. Embun only applies profit sharing on successful booking transactions, so owners bear no upfront costs.',
          },
          {
            question: 'How does the fund settlement process work?',
            answer:
              "Booking funds are disbursed to the partner's account periodically after deducting Embun's service fee, according to the applicable settlement cycle. Partners can monitor transaction history via the dashboard.",
          },
        ],
      },
      contact: {
        heading: 'Contact Us',
        subcopy:
          'Own a campsite or have questions? Fill out the form below and our team will get back to you shortly.',
      },
      cta: {
        heading: 'Ready to Bring More Guests to Your Campsite?',
        subcopy:
          'Be one of the first campsites to join Embun and experience how reservations and payments are managed automatically.',
        ctaLabel: 'Register Your Campsite',
      },
    },
  },
};
