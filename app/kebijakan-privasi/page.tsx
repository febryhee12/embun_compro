import type { Metadata } from 'next';
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
 * SEO metadata for the Privacy Policy page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/kebijakan-privasi',
  title: 'Kebijakan Privasi — Embun',
  description:
    'Pelajari data pribadi apa yang dikumpulkan Embun, tujuan penggunaannya, pihak yang dapat mengaksesnya, dan kepatuhan Embun terhadap UU PDP No. 27/2022.',
});

/**
 * Privacy Policy (`/kebijakan-privasi`) — Requirement 8.
 *
 * Composes `LegalLayout` (page title + last-updated line) with
 * `LegalDisclaimer` (draft/legal-review notice) and the policy body itself.
 * The body covers: data types collected (8.2), purpose of collection (8.2),
 * who can access the data (8.2), UU PDP No. 27/2022 compliance (8.3), and a
 * contact section for privacy questions or data-deletion requests (8.5).
 */
export default function KebijakanPrivasiPage() {
  const breadcrumbItems = [{ label: 'Beranda', href: '/' }, { label: 'Kebijakan Privasi' }];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout title="Kebijakan Privasi" lastUpdated="2026-07-03">
          <LegalDisclaimer />

          <h2>Data Pribadi yang Kami Kumpulkan</h2>
          <p>
            Embun mengumpulkan data pribadi yang Anda berikan secara langsung saat mendaftar atau
            menggunakan Embun App maupun Website, termasuk nama lengkap, alamat email, dan nomor
            telepon.
          </p>
          <p>
            Saat Anda mencari atau memesan campsite, Embun juga mengumpulkan data lokasi yang Anda
            bagikan untuk menampilkan campsite terdekat, serta riwayat transaksi seperti detail
            pemesanan, tanggal check-in dan check-out, dan metode pembayaran yang digunakan.
          </p>
          <p>
            Jika Anda mendaftar sebagai Campsite Owner melalui Contact Form pada halaman Mitra,
            Embun juga menyimpan data tambahan seperti nama campsite dan pesan yang Anda kirimkan.
          </p>
          <p>
            Embun juga mengumpulkan data teknis terbatas secara otomatis, seperti alamat IP dan
            jenis peramban atau perangkat yang Anda gunakan, untuk keperluan keamanan sesi login
            (mencegah penyalahgunaan akun) dan untuk memahami pola kunjungan halaman campsite
            secara agregat. Embun App saat ini tidak menggunakan layanan analitik atau pelacakan
            pihak ketiga (seperti Firebase Analytics atau Crashlytics) untuk mengumpulkan data
            perilaku Anda.
          </p>

          <h2>Tujuan Pengumpulan Data</h2>
          <p>
            Embun menggunakan data pribadi Anda untuk memproses pemesanan campsite, mengelola akun
            Anda di Embun App, dan mengirimkan komunikasi terkait status pesanan atau pembayaran.
          </p>
          <p>
            Embun juga menggunakan data pribadi Anda untuk menghubungi calon mitra yang mengisi
            Contact Form, memberikan dukungan pelanggan saat Anda mengajukan pertanyaan, dan
            meningkatkan kualitas layanan Embun App dan Website secara berkelanjutan.
          </p>

          <h2>Masa Penyimpanan Data</h2>
          <p>
            Embun menyimpan data profil dan akun Anda selama akun Anda masih aktif digunakan.
            Data riwayat transaksi dan pembayaran disimpan lebih lama sesuai dengan jangka waktu
            yang diwajibkan oleh peraturan perundang-undangan yang berlaku di Indonesia, termasuk
            ketentuan perpajakan dan pembukuan, sebelum akhirnya dihapus atau dianonimkan.
          </p>
          <p>
            Jika Anda mengajukan penghapusan akun, Embun akan menghapus atau mengaburkan
            (anonymize) data pribadi Anda yang tidak lagi wajib disimpan untuk kepatuhan hukum
            dalam waktu yang wajar setelah permintaan Anda diverifikasi.
          </p>

          <h2>Pihak yang Dapat Mengakses Data Anda</h2>
          <p>
            Data pribadi Anda dapat diakses oleh tim internal Embun yang bertugas mengelola
            operasional platform, layanan pelanggan, dan verifikasi transaksi.
          </p>
          <p>
            Campsite Owner yang menjadi mitra Embun dapat mengakses data pemesanan Guest yang
            relevan dengan reservasi di campsite milik mereka sendiri, seperti nama tamu, tanggal
            menginap, dan jumlah tamu, semata-mata untuk keperluan operasional reservasi tersebut.
          </p>
          <p>
            Embun juga membagikan data transaksi yang diperlukan kepada Midtrans selaku penyedia
            layanan payment gateway, untuk memproses pembayaran Anda secara aman.
          </p>
          <p>
            Embun tidak menjual atau menyewakan data pribadi Anda kepada pihak ketiga untuk tujuan
            pemasaran di luar konteks yang dijelaskan dalam kebijakan ini.
          </p>

          <h2>Kepatuhan terhadap UU Pelindungan Data Pribadi</h2>
          <p>
            Embun berkomitmen untuk mengelola data pribadi Anda sesuai dengan Undang-Undang
            Pelindungan Data Pribadi (UU PDP) No. 27 Tahun 2022 yang berlaku di Indonesia.
          </p>
          <p>
            Sebagai pengendali data pribadi, Embun menerapkan langkah-langkah teknis dan
            organisasi yang wajar untuk melindungi data pribadi Anda dari akses, pengungkapan,
            perubahan, atau penghapusan yang tidak sah, sesuai prinsip-prinsip yang diatur dalam UU
            PDP, termasuk pembatasan tujuan pengumpulan dan pemrosesan data seminimal yang
            diperlukan.
          </p>
          <p>
            Anda memiliki hak-hak yang dijamin oleh UU PDP atas data pribadi Anda, termasuk hak
            untuk mengetahui data apa yang dikumpulkan, hak untuk memperbaiki data yang tidak
            akurat, dan hak untuk meminta penghapusan data pribadi Anda sesuai dengan ketentuan yang
            berlaku.
          </p>

          <h2>Batasan Usia Pengguna</h2>
          <p>
            Embun App dan Website ditujukan bagi pengguna yang telah memenuhi batas usia legal
            untuk melakukan transaksi elektronik secara mandiri di Indonesia. Embun tidak
            dengan sengaja mengumpulkan data pribadi dari anak-anak di bawah umur. Jika Embun
            mengetahui bahwa data pribadi anak di bawah umur telah terkumpul tanpa persetujuan
            orang tua/wali yang sah, Embun akan menghapus data tersebut sesegera mungkin.
          </p>

          <h2>Hubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau ingin mengajukan
            permintaan penghapusan data pribadi Anda, silakan hubungi tim Embun melalui email{' '}
            <a href="mailto:help@embun.app">help@embun.app</a>
            .
          </p>
          <p>
            Embun akan menanggapi permintaan Anda terkait data pribadi dalam waktu yang wajar sesuai
            dengan ketentuan UU PDP yang berlaku.
          </p>
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
