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
 * SEO metadata for the Kebijakan Kemitraan page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/kebijakan-mitra',
  title: 'Kebijakan Kemitraan — Embun',
  description:
    'Pelajari struktur komisi, kewajiban Campsite Owner, dan syarat pemutusan kemitraan dengan Embun.',
});

/**
 * Kebijakan Kemitraan (`/kebijakan-mitra`) (Requirement 11).
 *
 * Server Component composed from `LegalLayout` (title + last-updated line)
 * and `LegalDisclaimer` (fixed draft-content notice, Requirement 11.7),
 * followed by the policy body covering the commission structure, Campsite
 * Owner obligations, partnership termination terms, and a cross-link to
 * `/kebijakan-refund` for Guest refund context (Requirements 11.2–11.5).
 */
export default function KebijakanMitraPage() {
  const breadcrumbItems = [{ label: 'Beranda', href: '/' }, { label: 'Kebijakan Kemitraan' }];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout title="Kebijakan Kemitraan" lastUpdated="2026-07-03">
          <LegalDisclaimer />

          <h2>Struktur Komisi</h2>
          <p>
            Embun mengambil komisi dari setiap transaksi pemesanan yang berhasil diselesaikan
            oleh Guest melalui Embun App pada campsite milik Campsite Owner yang bermitra.
            Persentase komisi disepakati secara tertulis antara Embun dan Campsite Owner pada
            saat proses pendaftaran kemitraan, dan dapat berbeda tergantung jenis layanan atau
            paket yang ditawarkan oleh masing-masing campsite.
          </p>
          <p>
            Komisi dipotong secara otomatis dari total pembayaran yang diterima dari Guest
            sebelum sisa dana disetorkan (settlement) kepada Campsite Owner. Rincian komisi
            untuk setiap transaksi dapat dipantau oleh Campsite Owner melalui dashboard
            backoffice Embun.
          </p>
          <p>
            Perubahan struktur komisi di masa mendatang akan diinformasikan terlebih dahulu
            kepada Campsite Owner melalui kanal komunikasi resmi Embun sebelum berlaku efektif.
          </p>

          <h2>Jadwal Pencairan Dana (Settlement)</h2>
          <p>
            Dana milik Campsite Owner untuk suatu periode transaksi akan berstatus &quot;Siap
            Dicairkan&quot; setelah tenggat waktu pembatalan (Refund_Window) pada seluruh
            transaksi terkait periode tersebut berakhir, sesuai dengan kebijakan refund yang
            berlaku pada masing-masing transaksi. Pencairan dapat dilakukan secara sebagian
            (partial settlement) sesuai dengan dana yang telah siap dicairkan.
          </p>
          <p>
            Status kesiapan dana dan riwayat setiap transfer dana yang telah dilakukan dapat
            dipantau secara real-time oleh Campsite Owner melalui dashboard backoffice Embun.
          </p>

          <h2>Kewajiban Campsite Owner</h2>
          <p>
            Sebagai mitra Embun, Campsite Owner bertanggung jawab untuk menjaga keakuratan data
            ketersediaan (kalender, kuota spot, dan status blok) pada dashboard backoffice
            sehingga Guest tidak menerima informasi yang menyesatkan saat melakukan pemesanan.
          </p>
          <p>
            Campsite Owner juga bertanggung jawab untuk menjaga kualitas layanan yang diberikan
            kepada Guest sesuai dengan deskripsi, fasilitas, dan harga yang tercantum pada
            profil campsite di Embun App, termasuk memastikan kesiapan lokasi pada tanggal
            check-in yang telah dipesan.
          </p>
          <p>
            Campsite Owner wajib mematuhi seluruh kebijakan platform Embun yang berlaku,
            termasuk namun tidak terbatas pada kebijakan penetapan harga, kebijakan pembatalan
            dan refund sebagaimana dijelaskan pada{' '}
            <Link href="/kebijakan-refund">Kebijakan Refund &amp; Pembatalan</Link>, serta
            standar komunikasi dan respons terhadap pertanyaan Guest.
          </p>
          <p>
            Apabila terjadi pembatalan pesanan akibat kelalaian Campsite Owner, misalnya
            campsite tidak tersedia pada tanggal check-in padahal ditampilkan tersedia di Embun
            App (overbooking), Campsite Owner bertanggung jawab untuk mengupayakan lokasi
            pengganti yang setara bagi Guest. Guest yang terdampak berhak atas pengembalian dana
            penuh (100%) sebagaimana dijelaskan pada{' '}
            <Link href="/kebijakan-refund">Kebijakan Refund &amp; Pembatalan</Link>, dan Embun
            berhak mengenakan penalti kepada Campsite Owner atas biaya yang timbul akibat
            pembatalan tersebut, termasuk namun tidak terbatas pada biaya transaksi payment
            gateway yang tidak dapat dikembalikan.
          </p>
          <p>
            Campsite Owner setuju untuk tidak menetapkan harga sewa di Embun App yang lebih
            tinggi daripada harga jual langsung (walk-in) di lokasi campsite untuk jenis layanan
            dan periode waktu yang sama.
          </p>
          <p>
            Campsite Owner sepakat untuk melepaskan dan membebaskan Embun dari segala tuntutan
            hukum, ganti rugi, atau klaim dari Guest maupun pihak ketiga lainnya yang timbul
            akibat kelalaian Campsite Owner, kondisi keamanan lokasi, kecelakaan, atau kerusakan
            fasilitas selama Guest berada di area campsite.
          </p>

          <h2>Syarat dan Mekanisme Pemutusan Kemitraan</h2>
          <p>
            Baik Embun maupun Campsite Owner dapat mengajukan pemutusan kemitraan dengan
            menyampaikan pemberitahuan tertulis melalui kanal komunikasi resmi kepada pihak
            lainnya, disertai alasan pemutusan dan periode pemberitahuan sebagaimana disepakati
            pada perjanjian kemitraan awal.
          </p>
          <p>
            Embun berhak menghentikan kemitraan sewaktu-waktu apabila Campsite Owner terbukti
            melanggar kewajiban yang dijelaskan pada halaman ini, termasuk memberikan data
            ketersediaan yang tidak akurat secara berulang, kualitas layanan yang secara
            konsisten tidak sesuai standar, atau pelanggaran terhadap kebijakan platform lainnya.
          </p>
          <p>
            Setelah pemutusan kemitraan disepakati atau berlaku efektif, transaksi Guest yang
            sudah berjalan sebelum tanggal efektif pemutusan tetap diselesaikan sesuai dengan
            ketentuan yang berlaku, termasuk penanganan dana terkait transaksi Guest yang
            dijelaskan pada{' '}
            <Link href="/kebijakan-refund">Kebijakan Refund &amp; Pembatalan</Link>. Campsite
            baru tidak dapat menerima pemesanan Guest setelah tanggal efektif pemutusan
            kemitraan.
          </p>
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
