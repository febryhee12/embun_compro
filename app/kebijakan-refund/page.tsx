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
 * SEO metadata for the Refund & Cancellation Policy page (Requirements 13.1, 13.2).
 */
export const metadata: Metadata = buildPageMetadata({
  path: '/kebijakan-refund',
  title: 'Kebijakan Refund & Pembatalan — Embun',
  description:
    'Ketahui syarat dan tenggat waktu pembatalan pesanan, mekanisme pengembalian dana, serta skenario dana yang tidak dapat dikembalikan.',
});

/**
 * Refund & Cancellation Policy (`/kebijakan-refund`) (Requirement 10).
 *
 * Server Component composed from `LegalLayout` (title + last-updated line)
 * and `LegalDisclaimer` (fixed draft-content notice, Requirement 10.6),
 * followed by the policy body covering cancellation deadlines, the
 * payment-gateway refund mechanism, and non-refundable scenarios
 * (Requirements 10.2–10.5). The payment processor is referred to generically
 * ("payment gateway resmi") rather than naming a specific vendor, so the
 * copy stays valid if the processor changes.
 */
export default function KebijakanRefundPage() {
  const breadcrumbItems = [
    { label: 'Beranda', href: '/' },
    { label: 'Kebijakan Refund & Pembatalan' },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout title="Kebijakan Refund & Pembatalan" lastUpdated="2026-07-03">
          <LegalDisclaimer />

          <h2>Syarat dan Tenggat Waktu Pembatalan</h2>
          <p>
            Guest dapat mengajukan pembatalan pesanan melalui Embun App sebelum tenggat waktu
            pembatalan yang berlaku untuk pesanan tersebut. Tenggat waktu pembatalan yang
            memenuhi kualifikasi pengembalian dana dihitung mundur dari tanggal check-in yang
            tercantum pada pesanan, dan ditampilkan secara spesifik pada halaman detail pesanan
            Guest di Embun App sebelum pembayaran dikonfirmasi.
          </p>
          <p>
            Pembatalan yang diajukan sebelum tenggat waktu pembatalan yang berlaku untuk pesanan
            yang bersangkutan berhak atas pengembalian dana sesuai dengan ketentuan pada halaman
            ini. Guest disarankan untuk memeriksa tenggat waktu pembatalan pada setiap pesanan,
            karena tenggat waktu dapat berbeda antar campsite tergantung kebijakan masing-masing
            Campsite Owner yang bermitra dengan Embun.
          </p>

          <h2>Mekanisme Pengembalian Dana</h2>
          <p>
            Seluruh pembayaran pada Embun App diproses melalui payment gateway resmi yang
            bekerja sama dengan Embun. Apabila pembatalan pesanan memenuhi syarat pengembalian
            dana, Embun akan mengajukan permintaan refund melalui payment gateway tersebut
            menggunakan metode pembayaran yang sama dengan yang digunakan Guest saat melakukan
            transaksi awal.
          </p>
          <p>
            Estimasi waktu proses pengembalian dana ke rekening atau metode pembayaran Guest
            adalah 3 hingga 14 hari kerja setelah permintaan refund disetujui, tergantung pada
            metode pembayaran yang digunakan (misalnya kartu kredit, transfer bank, atau
            dompet digital) dan waktu proses yang berlaku di masing-masing bank atau penyedia
            metode pembayaran. Embun tidak dapat mempercepat waktu proses di luar kendali
            payment gateway dan bank/penyedia metode pembayaran terkait.
          </p>
          <p>
            Guest akan menerima notifikasi melalui Embun App setelah permintaan refund
            diajukan dan setelah dana berhasil dikembalikan.
          </p>
          <p>
            Pengembalian dana hanya berlaku atas harga sewa campsite. Biaya layanan aplikasi
            (Biaya Admin, Biaya Layanan, dan pajak/PPN terkait) yang dibebankan pada saat
            transaksi bersifat non-refundable dan tidak termasuk dalam perhitungan pengembalian
            dana. Sebagai ilustrasi, untuk sewa Rp200.000 dengan Biaya Admin Rp4.000 dan Biaya
            Layanan Rp2.000 (total Rp206.000), pengembalian dana penuh (100%) mengembalikan
            Rp200.000, bukan Rp206.000. Persentase pengembalian dana yang berlaku dihitung dari
            harga sewa tersebut.
          </p>

          <h2>Pembatalan oleh Campsite Owner atau Force Majeure</h2>
          <p>
            Jika pesanan dibatalkan secara sepihak oleh Campsite Owner, Guest berhak atas
            pengembalian dana penuh (100%), terlepas dari tenggat waktu pembatalan reguler yang
            berlaku pada pesanan tersebut.
          </p>
          <p>
            Ketentuan yang sama juga berlaku apabila terjadi kondisi force majeure, seperti
            bencana alam, cuaca ekstrem, atau penutupan area oleh pihak berwenang, yang
            mengakibatkan campsite tidak dapat beroperasi pada tanggal check-in yang telah
            dipesan.
          </p>

          <h2>Refund Manual untuk Metode Pembayaran Tertentu</h2>
          <p>
            Beberapa metode pembayaran, seperti pembayaran melalui gerai retail atau dompet
            digital tertentu, tidak mendukung pengembalian dana otomatis melalui payment gateway.
            Dalam kondisi tersebut, tim Embun akan menghubungi Guest untuk meminta detail rekening
            bank yang sah guna memproses pengembalian dana secara manual melalui transfer bank.
          </p>

          <h2>Skenario Dana Tidak Dapat Dikembalikan</h2>
          <p>
            Dalam skenario tertentu, dana yang telah dibayarkan tidak dapat dikembalikan.
            Skenario tersebut meliputi, namun tidak terbatas pada:
          </p>
          <ul>
            <li>
              Dana tidak akan dikembalikan jika pembatalan diajukan setelah tenggat waktu
              pembatalan yang berlaku untuk pesanan yang bersangkutan.
            </li>
            <li>
              Dana tidak akan dikembalikan jika Guest tidak hadir (no-show) pada tanggal check-in
              yang telah dipesan tanpa melakukan pembatalan sebelumnya.
            </li>
            <li>
              Dana tidak akan dikembalikan jika pesanan dibatalkan setelah masa menginap dimulai
              (check-in telah dilakukan).
            </li>
          </ul>
          <p>
            Untuk pertanyaan lebih lanjut mengenai status pengembalian dana pada pesanan
            tertentu, Guest dapat menghubungi tim dukungan Embun melalui kanal bantuan yang
            tersedia pada Embun App.
          </p>
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
