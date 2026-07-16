import type { Metadata } from 'next';
import Link from 'next/link';

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
 * SEO metadata for the Terms of Service page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/syarat-ketentuan',
  title: 'Syarat & Ketentuan — Embun',
  description:
    'Baca aturan penggunaan Embun App dan Website, batasan tanggung jawab Embun sebagai platform penghubung, serta mekanisme penyelesaian perselisihan.',
});

/**
 * Terms of Service (`/syarat-ketentuan`) (Requirement 9.1-9.6).
 *
 * Composes `LegalLayout` (title + last-updated)
 * and the policy body covering usage rules,
 * limitation of liability, and dispute resolution.
 */
export default async function SyaratKetentuanPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isEn = lang === 'en';
  const breadcrumbItems = [
    { label: isEn ? 'Home' : 'Beranda', href: `/${lang}` }, 
    { label: isEn ? 'Terms & Conditions' : 'Syarat & Ketentuan' }
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout 
          title={isEn ? "Terms & Conditions" : "Syarat & Ketentuan"} 
          lastUpdated="2026-07-03"
        >
          {isEn ? (
            <>
              <h2>1. Acceptance of Terms and Conditions</h2>
              <p>
                By downloading, accessing, or using the Embun application (&quot;Embun App&quot;)
                or this website (&quot;Website&quot;), you acknowledge that you have read, understood,
                and agreed to the entirety of these Terms and Conditions. If you do not agree to any
                part of these Terms and Conditions, we advise you not to
                continue using the Embun App or Website.
              </p>
              <p>
                These Terms and Conditions form an integral and inseparable part of Embun's{' '}
                <Link href={`/${lang}/kebijakan-privasi`}>Privacy Policy</Link>,{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Refund &amp; Cancellation Policy</Link>, and{' '}
                <Link href={`/${lang}/kebijakan-mitra`}>Partner Policy</Link>. By agreeing to
                these Terms and Conditions, you are also deemed to have agreed to all provisions in
                those documents.
              </p>

              <h2>2. Rules for Using the Embun App and Website</h2>
              <p>
                The Embun App and Website are provided to help Guests find and book camping spots,
                and to help Campsite Managements manage the availability and bookings of their campsites.
                Every user must use the Embun App and Website in accordance with these purposes and in 
                compliance with the laws applicable in Indonesia.
              </p>
              <p>
                Users are prohibited from abusing the Embun App or Website, including but not
                limited to the following actions:
              </p>
              <ul>
                <li>
                  Users are prohibited from making fictitious bookings, manipulating the payment system, or
                  committing fraud in any form.
                </li>
                <li>
                  Users are prohibited from accessing, altering, or damaging campsite data (including photos, prices, and availability), nor hacking Campsite Management accounts, nor Embun systems without authorization.
                </li>
                <li>
                  Users are prohibited from using the Embun App or Website for unlawful purposes,
                  spreading misleading content, or harming other parties.
                </li>
                <li>
                  Users are prohibited from reverse engineering, copying, or
                  redistributing any part or all of the code, design, or content of the Embun
                  App and Website without written permission from Embun.
                </li>
              </ul>
              <p>
                The Embun App and Website are only intended for users who are at least 18
                (eighteen) years old or have obtained consent from a legal parent/guardian.
                Users under this age are not permitted to make booking transactions
                independently via the Embun App.
              </p>
              <p>
                All intellectual property rights to the Embun App and Website, including but not
                limited to logos, trade names, interface designs, source code, and displayed content,
                belong to Embun or its licensors and are protected by applicable laws and regulations.
                The use of the Embun App and Website does not grant users any ownership rights over
                such intellectual property.
              </p>

              <h2>3. Account and Security</h2>
              <p>
                Users are fully responsible for maintaining the confidentiality of their login credentials
                (including passwords, PINs, or third-party sign-in methods like Google/Apple Sign-In) and
                all activities that occur under your account. Please immediately contact the Embun support team
                via email at <a href="mailto:help@embun.app">help@embun.app</a> if you
                suspect any unauthorized access to your account.
              </p>
              <p>
                Embun reserves the right to suspend or delete a user's account at any time unilaterally,
                without prior notice, if there are indications of violations of these Terms and Conditions,
                including but not limited to fictitious bookings, payment fraud, or account abuse.
              </p>

              <h2>4. User Content and Reviews</h2>
              <p>
                Guests may leave reviews and ratings for campsites after completing their stay.
                Reviews must be based on actual experiences, be objective, and use appropriate language.
              </p>
              <p>
                Users are prohibited from posting reviews or other content that contains elements of SARA 
                (Ethnicity, Religion, Race, and Inter-group relations), hate speech, profanity, harassment, 
                spam, or content aimed at unlawfully ruining the reputation of Campsite Managements or Embun.
                Embun reserves the right to remove reviews that violate these terms. Embun acts as a platform moderator and has the prerogative to review, hide,
                or delete user content that is proven to violate the above provisions without prior notice
                to the content creator.
              </p>

              <h2>5. Payments and Third-Party Payment Gateways</h2>
              <p>
                All payment transactions on the Embun App are processed through third-party payment gateway services.
                System failures, processing delays, or additional fees charged by the Guest's bank or payment method
                provider are beyond Embun's control and responsibility.
              </p>
              <p>
                Some Campsite Managements may require a security deposit for tent or equipment rentals on site. 
                The amount and provisions for returning the deposit are the prerogative of each Campsite Management and are 
                displayed on the campsite details page.
              </p>

              <h2>6. Limitation of Embun's Liability</h2>
              <p>
                Embun acts as a connecting platform (<em>marketplace</em>) between Guests and Campsite Managements,
                and is not a party that directly provides camping services. Camping services, including physical 
                campsite conditions, facilities, area security, and on-site service quality, are provided 
                by and are the sole responsibility of the Campsite Management of the respective campsite.
              </p>
              <p>
                Embun strives to maintain the accuracy of information displayed on the Embun App and Website, 
                but cannot guarantee that all information regarding campsites, availability, and prices uploaded by 
                Campsite Managements is always free from errors. Embun is not liable for any losses, accidents, damages, or 
                injuries incurred while Guests are on the campsite premises, unless such losses are directly caused 
                by Embun's negligence in carrying out its functions as a platform.
              </p>
              <p>
                Disputes arising between Guests and Campsite Managements regarding the implementation of camping services on-site, 
                including but not limited to facility conditions and service complaints, are the responsibility of the 
                Guest and Campsite Management to resolve, with Embun potentially acting as a communication facilitator if needed.
              </p>

              <h2>7. Dispute Resolution</h2>
              <p>
                If a user has a complaint, question, or dispute related to the use of the Embun App or Website,
                the user may contact the Embun support team via the Help &amp; Ticket channel available within the
                Embun App, or via email at <a href="mailto:help@embun.app">help@embun.app</a>, to seek a
                resolution through deliberation and mutual consensus first.
              </p>
              <p>
                If a resolution through deliberation cannot be reached within a reasonable time,
                the dispute will be resolved in accordance with the applicable laws of the Republic of Indonesia,
                and the parties agree to submit to the jurisdiction of the competent courts in Indonesia.
              </p>

              <h2>8. Changes to Terms and Conditions</h2>
              <p>
                Embun may modify or update these Terms and Conditions from time to time.
                Changes will become effective as of the &quot;Last updated&quot; date stated at the top of this page.
                By continuing to use the Embun App or Website after the changes take effect, users are deemed to have
                agreed to such changes.
              </p>
            </>
          ) : (
            <>
              <h2>1. Penerimaan Syarat dan Ketentuan</h2>
              <p>
                Dengan mengunduh, mengakses, atau menggunakan aplikasi Embun (&quot;Embun App&quot;)
                maupun situs web ini (&quot;Website&quot;), Anda menyatakan telah membaca, memahami,
                dan menyetujui seluruh isi Syarat dan Ketentuan ini. Jika Anda tidak menyetujui salah
                satu bagian dari Syarat dan Ketentuan ini, kami menyarankan Anda untuk tidak
                melanjutkan penggunaan Embun App atau Website.
              </p>
              <p>
                Syarat dan Ketentuan ini merupakan satu kesatuan dan tidak terpisahkan dengan{' '}
                <Link href={`/${lang}/kebijakan-privasi`}>Kebijakan Privasi</Link>,{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Kebijakan Refund &amp; Pembatalan</Link>, dan{' '}
                <Link href={`/${lang}/kebijakan-mitra`}>Kebijakan Kemitraan</Link> Embun. Dengan menyetujui
                Syarat dan Ketentuan ini, Anda juga dianggap telah menyetujui seluruh ketentuan pada
                dokumen-dokumen tersebut.
              </p>

              <h2>2. Aturan Penggunaan Embun App dan Website</h2>
              <p>
                Embun App dan Website disediakan untuk membantu Tamu menemukan dan memesan spot
                camping, serta membantu pengelola campsite mengelola ketersediaan dan
                pemesanan campsite miliknya. Setiap pengguna wajib menggunakan Embun App dan Website
                sesuai dengan tujuan tersebut dan sesuai dengan hukum yang berlaku di Indonesia.
              </p>
              <p>
                Pengguna dilarang menyalahgunakan Embun App atau Website, termasuk namun tidak
                terbatas pada tindakan berikut:
              </p>
              <ul>
                <li>
                  Pengguna dilarang membuat pemesanan fiktif, memanipulasi sistem pembayaran, atau
                  melakukan kecurangan dalam bentuk apa pun.
                </li>
                <li>
                  Pengguna dilarang mengakses, mengubah, atau merusak data campsite (termasuk foto, harga, dan ketersediaan), maupun meretas akun pengelola campsite, maupun sistem Embun tanpa izin.
                </li>
                <li>
                  Pengguna dilarang menggunakan Embun App atau Website untuk tujuan yang melanggar
                  hukum, menyebarkan konten yang menyesatkan, atau merugikan pihak lain.
                </li>
                <li>
                  Pengguna dilarang melakukan rekayasa balik (<em>reverse engineering</em>), menyalin,
                  atau mendistribusikan ulang sebagian maupun seluruh kode, desain, atau konten Embun
                  App dan Website tanpa izin tertulis dari Embun.
                </li>
              </ul>
              <p>
                Embun App dan Website hanya diperuntukkan bagi pengguna yang berusia minimal 18
                (delapan belas) tahun atau telah mendapatkan persetujuan dari orang tua/wali yang sah.
                Pengguna di bawah usia tersebut tidak diperkenankan melakukan transaksi pemesanan
                secara mandiri melalui Embun App.
              </p>
              <p>
                Seluruh hak kekayaan intelektual atas Embun App dan Website, termasuk namun tidak
                terbatas pada logo, nama dagang, desain antarmuka, kode sumber, dan konten yang
                ditampilkan, merupakan milik Embun atau pemberi lisensinya dan dilindungi oleh
                peraturan perundang-undangan yang berlaku. Penggunaan Embun App dan Website tidak
                memberikan hak kepemilikan apa pun kepada pengguna atas kekayaan intelektual tersebut.
              </p>

              <h2>3. Akun dan Keamanan</h2>
              <p>
                Pengguna bertanggung jawab penuh untuk menjaga kerahasiaan kredensial login (termasuk
                kata sandi, PIN, atau metode masuk pihak ketiga seperti Google/Apple Sign-In) dan
                seluruh aktivitas yang terjadi di bawah akun Anda. Segera hubungi tim dukungan Embun
                medalui email <a href="mailto:help@embun.app">help@embun.app</a> apabila Anda
                mencurigai adanya akses tidak sah ke akun Anda.
              </p>
              <p>
                Embun berhak menangguhkan (suspend) atau menghapus akun pengguna kapan saja secara
                sepihak, tanpa pemberitahuan sebelumnya, apabila ditemukan indikasi pelanggaran
                terhadap Syarat dan Ketentuan ini, termasuk namun tidak terbatas pada pemesanan
                fiktif, kecurangan pembayaran, atau penyalahgunaan akun.
              </p>

              <h2>4. Konten Pengguna dan Ulasan</h2>
              <p>
                Tamu dapat memberikan ulasan (review) dan penilaian (rating) atas campsite setelah
                menyelesaikan masa menginap. Ulasan harus didasarkan pada pengalaman aktual, bersifat
                objektif, dan menggunakan bahasa yang pantas.
              </p>
              <p>
                Pengguna dilarang mengunggah ulasan atau konten lain yang mengandung unsur SARA
                (Suku, Agama, Ras, dan Antargolongan), ujaran kebencian, kata-kata kasar, pelecehan,
                spam, atau konten yang bertujuan menjatuhkan reputasi pengelola campsite maupun Embun
                secara tidak wajar. Embun berhak menghapus ulasan yang melanggar ketentuan ini.
              </p>
              <p>
                Embun bertindak sebagai moderator platform dan memiliki hak prerogatif untuk meninjau,
                menyembunyikan, atau menghapus konten pengguna yang terbukti melanggar ketentuan di
                atas tanpa pemberitahuan sebelumnya kepada pembuat konten.
              </p>

              <h2>5. Pembayaran dan Payment Gateway Pihak Ketiga</h2>
              <p>
                Seluruh transaksi pembayaran pada Embun App diproses melalui layanan payment gateway
                pihak ketiga. Kegagalan sistem, keterlambatan pemrosesan, atau biaya tambahan yang
                dikenakan oleh bank atau penyedia metode pembayaran Tamu berada di luar kendali dan
                tanggung jawab Embun.
              </p>
              <p>
                Beberapa pengelola campsite dapat mewajibkan uang jaminan (deposit) untuk penyewaan
                tenda atau peralatan di lokasi. Besaran dan ketentuan pengembalian deposit ini
                merupakan hak prerogatif masing-masing pengelola campsite dan ditampilkan pada halaman
                detail campsite.
              </p>

              <h2>6. Batasan Tanggung Jawab Embun</h2>
              <p>
                Embun berkedudukan sebagai platform penghubung (<em>marketplace</em>) antara Tamu
                dan pengelola campsite, dan bukan merupakan pihak yang menyediakan layanan camping secara
                langsung. Layanan camping, termasuk kondisi fisik campsite, fasilitas, keamanan area,
                dan kualitas pelayanan di lokasi, disediakan dan menjadi tanggung jawab penuh
                pengelola campsite yang bersangkutan.
              </p>
              <p>
                Embun berupaya menjaga akurasi informasi yang ditampilkan di Embun App dan Website,
                namun tidak dapat menjamin bahwa seluruh informasi mengenai campsite, ketersediaan,
                maupun harga yang diunggah oleh pengelola campsite selalu bebas dari kesalahan. Embun tidak
                bertanggung jawab atas kerugian, kecelakaan, kehilangan, atau kerusakan yang timbul
                selama Tamu berada di lokasi campsite, kecuali kerugian tersebut secara langsung
                disebabkan oleh kelalaian Embun dalam menjalankan fungsinya sebagai platform.
              </p>
              <p>
                Sengketa yang timbul antara Tamu dan pengelola campsite terkait pelaksanaan layanan camping di
                lokasi, termasuk namun tidak terbatas pada kondisi fasilitas dan keluhan layanan,
                merupakan tanggung jawab Tamu dan pengelola campsite untuk menyelesaikannya, dengan Embun dapat
                berperan sebagai fasilitator komunikasi apabila diperlukan.
              </p>

              <h2>7. Penyelesaian Perselisihan</h2>
              <p>
                Apabila pengguna memiliki keluhan, pertanyaan, atau perselisihan terkait penggunaan
                Embun App atau Website, pengguna dapat menghubungi tim dukungan Embun melalui kanal
                Bantuan &amp; Tiket yang tersedia di dalam Embun App, atau melalui email{' '}
                <a href="mailto:help@embun.app">help@embun.app</a>, untuk mengupayakan penyelesaian
                secara musyawarah dan kekeluargaan terlebih dahulu.
              </p>
              <p>
                Apabila penyelesaian secara musyawarah tidak tercapai dalam jangka waktu yang wajar,
                perselisihan akan diselesaikan sesuai dengan peraturan perundang-undangan yang
                berlaku di Republik Indonesia, dan para pihak sepakat untuk menundukkan diri pada
                yurisdiksi pengadilan yang berwenang di Indonesia.
              </p>

              <h2>8. Perubahan Syarat dan Ketentuan</h2>
              <p>
                Embun dapat mengubah atau memperbarui Syarat dan Ketentuan ini dari waktu ke waktu.
                Perubahan akan berlaku efektif sejak tanggal &quot;Terakhir diperbarui&quot; yang
                tercantum di bagian atas halaman ini. Dengan tetap menggunakan Embun App atau Website
                setelah perubahan berlaku, pengguna dianggap telah menyetujui perubahan tersebut.
              </p>
            </>
          )}
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
