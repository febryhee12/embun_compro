import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { LegalLayout } from '@/components/sections/legal/LegalLayout';
import { LegalDisclaimer } from '@/components/sections/legal/LegalDisclaimer';
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
 * Composes `LegalLayout` (title + last-updated) with `LegalDisclaimer`
 * (draft-content notice) and the policy body covering usage rules,
 * limitation of liability, and dispute resolution.
 */
export default function SyaratKetentuanPage() {
  const breadcrumbItems = [{ label: 'Beranda', href: '/' }, { label: 'Syarat & Ketentuan' }];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout title="Syarat & Ketentuan" lastUpdated="2026-07-03">
          <LegalDisclaimer />

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
            <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>,{' '}
            <Link href="/kebijakan-refund">Kebijakan Refund &amp; Pembatalan</Link>, dan{' '}
            <Link href="/kebijakan-mitra">Kebijakan Kemitraan</Link> Embun. Dengan menyetujui
            Syarat dan Ketentuan ini, Anda juga dianggap telah menyetujui seluruh ketentuan pada
            dokumen-dokumen tersebut.
          </p>

          <h2>2. Aturan Penggunaan Embun App dan Website</h2>
          <p>
            Embun App dan Website disediakan untuk membantu Guest menemukan dan memesan spot
            camping, serta membantu Campsite Owner (&quot;Partner&quot;) mengelola ketersediaan dan
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
              Pengguna dilarang mengakses, mengubah, atau merusak data pengguna lain, data
              Partner, maupun sistem Embun tanpa izin.
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
            melalui email <a href="mailto:help@embun.app">help@embun.app</a> apabila Anda
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
            Guest dapat memberikan ulasan (review) dan penilaian (rating) atas campsite setelah
            menyelesaikan masa menginap. Ulasan harus didasarkan pada pengalaman aktual, bersifat
            objektif, dan menggunakan bahasa yang pantas.
          </p>
          <p>
            Pengguna dilarang mengunggah ulasan atau konten lain yang mengandung unsur SARA
            (Suku, Agama, Ras, dan Antargolongan), ujaran kebencian, kata-kata kasar, pelecehan,
            spam, atau konten yang bertujuan menjatuhkan reputasi Campsite Owner maupun Embun
            secara tidak sah.
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
            dikenakan oleh bank atau penyedia metode pembayaran Guest berada di luar kendali dan
            tanggung jawab Embun.
          </p>
          <p>
            Beberapa Campsite Owner dapat mewajibkan uang jaminan (deposit) untuk penyewaan
            peralatan atau jaminan kebersihan lokasi. Ketentuan penahanan dan pengembalian deposit
            merupakan hak prerogatif masing-masing Campsite Owner dan ditampilkan pada halaman
            detail campsite atau ringkasan pesanan sebelum pembayaran dikonfirmasi.
          </p>

          <h2>6. Batasan Tanggung Jawab Embun</h2>
          <p>
            Embun berkedudukan sebagai platform penghubung (<em>marketplace</em>) antara Guest
            dan Partner, dan bukan merupakan pihak yang menyediakan layanan camping secara
            langsung. Layanan camping, termasuk kondisi fisik campsite, fasilitas, keamanan area,
            dan kualitas pelayanan di lokasi, disediakan dan menjadi tanggung jawab penuh Partner
            selaku pemilik atau pengelola campsite yang bersangkutan.
          </p>
          <p>
            Embun berupaya menjaga akurasi informasi yang ditampilkan di Embun App dan Website,
            namun tidak dapat menjamin bahwa seluruh informasi mengenai campsite, ketersediaan,
            maupun harga yang diunggah oleh Partner selalu bebas dari kesalahan. Embun tidak
            bertanggung jawab atas kerugian, kecelakaan, kehilangan, atau kerusakan yang timbul
            selama Guest berada di lokasi campsite, kecuali kerugian tersebut secara langsung
            disebabkan oleh kelalaian Embun dalam menjalankan fungsinya sebagai platform.
          </p>
          <p>
            Sengketa yang timbul antara Guest dan Partner terkait pelaksanaan layanan camping di
            lokasi, termasuk namun tidak terbatas pada kondisi fasilitas dan keluhan layanan,
            merupakan tanggung jawab Guest dan Partner untuk menyelesaikannya, dengan Embun dapat
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
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
