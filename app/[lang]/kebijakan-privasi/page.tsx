import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { LegalLayout } from '@/components/sections/legal/LegalLayout';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbJsonLd } from '@/lib/seo/structuredData';

/**
 * Forces fully static rendering for this route (Requirement 15.4).
 *
 * Mirrors the guard already used on `app/page.tsx`.
 */
export const dynamic = 'force-static';

/**
 * SEO metadata for the Privacy Policy page (Requirements 13.1, 13.2).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata(
    {
      path: '/kebijakan-privasi',
      title: lang === 'en' ? 'Privacy Policy — Embun' : 'Kebijakan Privasi — Embun',
      description: lang === 'en'
        ? 'Learn what personal data Embun collects, how it is used, who can access it, and our compliance with Indonesian PDPA (UU PDP) No. 27/2022.'
        : 'Pelajari data pribadi apa yang dikumpulkan Embun, tujuan penggunaannya, pihak yang dapat mengaksesnya, dan kepatuhan Embun terhadap UU PDP No. 27/2022.',
    },
    lang
  );
}

/**
 * Privacy Policy (`/kebijakan-privasi`) — Requirement 8.
 *
 * Composes `LegalLayout` (page title + last-updated line) with
 * the policy body itself.
 * The body covers: data types collected (8.2), purpose of collection (8.2),
 * who can access the data (8.2), UU PDP No. 27/2022 compliance (8.3), and a
 * contact section for privacy questions or data-deletion requests (8.5).
 */
export default async function KebijakanPrivasiPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isEn = lang === 'en';
  const breadcrumbItems = [
    { label: isEn ? 'Home' : 'Beranda', href: `/${lang}` },
    { label: isEn ? 'Privacy Policy' : 'Kebijakan Privasi' },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout
          title={isEn ? 'Privacy Policy' : 'Kebijakan Privasi'}
          lastUpdated="2026-07-30"
          isEn={isEn}
        >
          {isEn ? (
            <>
              <h2>Personal Data We Collect</h2>
              <p>
                Embun collects personal data that you provide directly when
                registering or using the Embun App or Website, including your
                full name, email address, and phone number.
              </p>
              <p>
                When you search for or reserve a campsite, Embun also collects
                location data you share to show nearby campsites, as well as
                transaction history such as reservation details, check-in and
                check-out dates, and payment methods used.
              </p>
              <p>
                If you register as a Campsite Management via the Contact Form on
                the Partner page, Embun also stores additional data such as your
                campsite name and the message you sent.
              </p>
              <p>
                Embun automatically collects limited technical data, such as
                your IP address and the type of browser or device you use, for
                login session security (preventing account abuse) and to
                understand campsite page visit patterns in aggregate. The Embun
                App currently does not use third-party analytics or tracking
                services (like Firebase Analytics or Crashlytics) to collect
                your behavioral data.
              </p>

              <h2>Purpose of Data Collection</h2>
              <p>
                Embun uses your personal data to process campsite reservations,
                manage your account on the Embun App, and send communications
                regarding order or payment status.
              </p>
              <p>
                Embun also uses your personal data to contact prospective
                partners who fill out the Contact Form, provide customer support
                when you submit inquiries, and continuously improve the quality
                of the Embun App and Website services.
              </p>

              <h2>Data Retention Period</h2>
              <p>
                Embun stores your profile and account data for as long as your
                account remains actively used. Transaction and payment history
                data is retained longer in accordance with the period required
                by applicable laws and regulations in Indonesia, including
                taxation and accounting provisions, before ultimately being
                deleted or anonymized.
              </p>
              <p>
                If you request account deletion, Embun will delete or anonymize
                your personal data that is no longer legally required to be
                retained within a reasonable time after your request is
                verified.
              </p>

              <h2>Parties with Access to Your Data</h2>
              <p>
                Your personal data can be accessed by Embun's internal team
                responsible for managing platform operations, customer service,
                and transaction verification.
              </p>
              <p>
                Campsite Managements can access Guest reservation data relevant
                to reservations at their own campsite, such as guest name, stay
                dates, and number of guests, solely for the operational purposes
                of that reservation.
              </p>
              <p>
                Embun also shares necessary transaction data with Xendit as
                the payment gateway provider, to process your payments securely.
              </p>
              <p>
                Embun does not sell or rent your personal data to third parties
                for marketing purposes outside the context described in this
                policy.
              </p>

              <h2>Compliance with Personal Data Protection Law</h2>
              <p>
                Embun is committed to managing your personal data in accordance
                with the Personal Data Protection Law (UU PDP) No. 27 of 2022
                applicable in Indonesia.
              </p>
              <p>
                As a personal data controller, Embun implements reasonable
                technical and organizational measures to protect your personal
                data from unauthorized access, disclosure, alteration, or
                deletion, in accordance with the principles set out in the UU
                PDP, including minimizing the purpose of data collection and
                processing to what is strictly necessary.
              </p>
              <p>
                You have rights guaranteed by the UU PDP over your personal
                data, including the right to know what data is collected, the
                right to correct inaccurate data, and the right to request the
                deletion of your personal data in accordance with applicable
                regulations.
              </p>

              <h2>User Age Limits</h2>
              <p>
                The Embun App and Website are intended for users who have met
                the legal age limit to conduct electronic transactions
                independently in Indonesia. Embun does not intentionally collect
                personal data from minors. If Embun discovers that a minor's
                personal data has been collected without the consent of a legal
                parent/guardian, Embun will delete such data as soon as
                possible.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions about this privacy policy or wish to
                submit a request to delete your personal data, please contact
                the Embun team via email{' '}
                <a href="mailto:support@embun.app">support@embun.app</a>.
              </p>
              <p>
                Embun will respond to your requests regarding personal data
                within a reasonable time in accordance with the applicable UU
                PDP provisions.
              </p>
            </>
          ) : (
            <>
              <h2>Data Pribadi yang Kami Kumpulkan</h2>
              <p>
                Embun mengumpulkan data pribadi yang Anda berikan secara
                langsung saat mendaftar atau menggunakan Embun App maupun
                Website, termasuk nama lengkap, alamat email, dan nomor telepon.
              </p>
              <p>
                Saat Anda mencari atau memesan campsite, Embun juga mengumpulkan
                data lokasi yang Anda bagikan untuk menampilkan campsite
                terdekat, serta riwayat transaksi seperti detail pemesanan,
                tanggal check-in dan check-out, dan metode pembayaran yang
                digunakan.
              </p>
              <p>
                Jika Anda mendaftar sebagai pengelola campsite melalui Contact
                Form pada halaman Mitra, Embun juga menyimpan data tambahan
                seperti nama campsite dan pesan yang Anda kirimkan.
              </p>
              <p>
                Embun juga mengumpulkan data teknis terbatas secara otomatis,
                seperti alamat IP dan jenis peramban atau perangkat yang Anda
                gunakan, untuk keperluan keamanan sesi login (mencegah
                penyalahgunaan akun) dan untuk memahami pola kunjungan halaman
                campsite secara agregat. Embun App saat ini tidak menggunakan
                layanan analitik atau pelacakan pihak ketiga (seperti Firebase
                Analytics atau Crashlytics) untuk mengumpulkan data perilaku
                Anda.
              </p>

              <h2>Tujuan Pengumpulan Data</h2>
              <p>
                Embun menggunakan data pribadi Anda untuk memproses pemesanan
                campsite, mengelola akun Anda di Embun App, dan mengirimkan
                komunikasi terkait status pesanan atau pembayaran.
              </p>
              <p>
                Embun juga menggunakan data pribadi Anda untuk menghubungi calon
                mitra yang mengisi Contact Form, memberikan dukungan pelanggan
                saat Anda mengajukan pertanyaan, dan meningkatkan kualitas
                layanan Embun App dan Website secara berkelanjutan.
              </p>

              <h2>Masa Penyimpanan Data</h2>
              <p>
                Embun menyimpan data profil dan akun Anda selama akun Anda masih
                aktif digunakan. Data riwayat transaksi dan pembayaran disimpan
                lebih lama sesuai dengan jangka waktu yang diwajibkan oleh
                peraturan perundang-undangan yang berlaku di Indonesia, termasuk
                ketentuan perpajakan dan pembukuan, sebelum akhirnya dihapus
                atau dianonimkan.
              </p>
              <p>
                Jika Anda mengajukan penghapusan akun, Embun akan menghapus atau
                mengaburkan (anonymize) data pribadi Anda yang tidak lagi wajib
                disimpan untuk kepatuhan hukum dalam waktu yang wajar setelah
                permintaan Anda diverifikasi.
              </p>

              <h2>Pihak yang Dapat Mengakses Data Anda</h2>
              <p>
                Data pribadi Anda dapat diakses oleh tim internal Embun yang
                bertugas mengelola operasional platform, layanan pelanggan, dan
                verifikasi transaksi.
              </p>
              <p>
                Pengelola campsite dapat mengakses data pemesanan Tamu yang
                relevan dengan reservasi di campsite milik mereka sendiri,
                seperti nama tamu, tanggal menginap, dan jumlah tamu,
                semata-mata untuk keperluan operasional reservasi tersebut.
              </p>
              <p>
                Embun juga membagikan data transaksi yang diperlukan kepada
                Xendit selaku penyedia layanan payment gateway, untuk
                memproses pembayaran Anda secara aman.
              </p>
              <p>
                Embun tidak menjual atau menyewakan data pribadi Anda kepada
                pihak ketiga untuk tujuan pemasaran di luar konteks yang
                dijelaskan dalam kebijakan ini.
              </p>

              <h2>Kepatuhan terhadap UU Pelindungan Data Pribadi</h2>
              <p>
                Embun berkomitmen untuk mengelola data pribadi Anda sesuai
                dengan Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27
                Tahun 2022 yang berlaku di Indonesia.
              </p>
              <p>
                Sebagai pengendali data pribadi, Embun menerapkan
                langkah-langkah teknis dan organisasi yang wajar untuk
                melindungi data pribadi Anda dari akses, pengungkapan,
                perubahan, atau penghapusan yang tidak sah, sesuai
                prinsip-prinsip yang diatur dalam UU PDP, termasuk pembatasan
                tujuan pengumpulan dan pemrosesan data seminimal yang
                diperlukan.
              </p>
              <p>
                Anda memiliki hak-hak yang dijamin oleh UU PDP atas data pribadi
                Anda, termasuk hak untuk mengetahui data apa yang dikumpulkan,
                hak untuk memperbaiki data yang tidak akurat, dan hak untuk
                meminta penghapusan data pribadi Anda sesuai dengan ketentuan
                yang berlaku.
              </p>

              <h2>Batasan Usia Pengguna</h2>
              <p>
                Embun App dan Website ditujukan bagi pengguna yang telah
                memenuhi batas usia legal untuk melakukan transaksi elektronik
                secara mandiri di Indonesia. Embun tidak dengan sengaja
                mengumpulkan data pribadi dari anak-anak di bawah umur. Jika
                Embun mengetahui bahwa data pribadi anak di bawah umur telah
                terkumpul tanpa persetujuan orang tua/wali yang sah, Embun akan
                menghapus data tersebut sesegera mungkin.
              </p>

              <h2>Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini
                atau ingin mengajukan permintaan penghapusan data pribadi Anda,
                silakan hubungi tim Embun melalui email{' '}
                <a href="mailto:support@embun.app">support@embun.app</a>.
              </p>
              <p>
                Embun akan menanggapi permintaan Anda terkait data pribadi dalam
                waktu yang wajar sesuai dengan ketentuan UU PDP yang berlaku.
              </p>
            </>
          )}
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
