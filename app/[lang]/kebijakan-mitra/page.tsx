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
export default async function KebijakanMitraPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isEn = lang === 'en';
  const breadcrumbItems = [
    { label: isEn ? 'Home' : 'Beranda', href: `/${lang}` }, 
    { label: isEn ? 'Partner Policy' : 'Kebijakan Kemitraan' }
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout 
          title={isEn ? "Partner Policy" : "Kebijakan Kemitraan"} 
          lastUpdated="2026-07-03"
        >
          <LegalDisclaimer lang={lang} />

          {isEn ? (
            <>
              <h2>Commission Structure</h2>
              <p>
                Embun takes a commission from every booking transaction successfully completed
                by a Guest via the Embun App at a Campsite Management's campsite.
                The commission percentage is agreed upon in writing between Embun and the Campsite Management during
                the partnership registration process, and may vary depending on the types of services or
                packages offered by each campsite.
              </p>
              <p>
                The commission is automatically deducted from the total payment received from the Guest
                before the remaining funds are disbursed (settled) to the Campsite Management. Details of the commission
                for each transaction can be monitored by the Campsite Management via the Embun backoffice dashboard.
              </p>
              <p>
                Embun reserves the right to change the commission structure in the future with prior notice
                to Campsite Managements via Embun's official communication channels before they take effect.
              </p>

              <h2>Settlement Schedule</h2>
              <p>
                Campsite Management funds for a given transaction period will be marked as &quot;Ready to Disburse&quot; 
                after the Guest has successfully checked out. Disbursement of funds (settlement) is carried out periodically 
                according to the schedule chosen or assigned during registration (e.g., weekly or bi-weekly) to the 
                bank account registered in the system.
              </p>
              <p>
                Embun strives to ensure settlements run on time, but delays may occur due to constraints 
                on the payment gateway or destination bank. The history of all disbursements and outstanding balances can be monitored 
                by Campsite Managements via the Embun backoffice dashboard.
              </p>

              <h2>Campsite Management Obligations</h2>
              <p>
                As an Embun partner, the Campsite Management is responsible for maintaining the accuracy of availability data
                (calendar, spot quota, and blocked status) on the backoffice dashboard so that Guests do not receive
                misleading information when making a booking.
              </p>
              <p>
                The Campsite Management is also responsible for maintaining the quality of service provided to Guests 
                in accordance with the descriptions, facilities, and prices listed on the campsite profile in the Embun App, 
                including ensuring the location is ready on the booked check-in date.
              </p>
              <p>
                Campsite Managements must comply with all applicable Embun platform policies, including but not limited to
                pricing policies, cancellation and refund policies as detailed in the{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Refund &amp; Cancellation Policy</Link>, and standards for 
                communication and response to Guest inquiries.
              </p>
              <p>
                In the event of an order cancellation due to Campsite Management negligence, for example, the campsite is 
                unavailable on the check-in date even though it was listed as available on the Embun App (overbooking), 
                the Campsite Management is responsible for arranging an equivalent alternative location for the Guest. Affected Guests 
                are entitled to a full refund (100%) as detailed in the{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Refund &amp; Cancellation Policy</Link>, and Embun reserves 
                the right to impose a penalty on the Campsite Management for costs arising from the cancellation, including but not 
                limited to the deduction of commissions or temporary suspension of the account.
              </p>
              <p>
                The Campsite Management agrees not to set rental prices on the Embun App higher than the direct selling price (walk-in) 
                or prices on other platforms for the same service (price parity), unless there is a separate promotional agreement.
              </p>
              <p>
                The Campsite Management agrees to release and hold Embun harmless from any legal claims, damages, or claims 
                from Guests or other third parties arising from Campsite Management negligence, location safety conditions, 
                accidents, or damage to facilities while Guests are in the campsite area.
              </p>

              <h2>Terms and Mechanisms for Partnership Termination</h2>
              <p>
                Both Embun and the Campsite Management may request termination of the partnership by submitting a written notice 
                at least 30 days prior to the desired effective date of termination.
              </p>
              <p>
                Embun reserves the right to terminate the partnership at any time if the Campsite Management is found to have violated 
                the provisions of this policy, including but not limited to price manipulation, service quality that is 
                consistently below standard, or violations of other platform policies.
              </p>
              <p>
                Once the termination of the partnership is agreed upon or takes effect, Guest transactions that are already 
                underway before the effective date of termination will still be completed in accordance with the applicable provisions, 
                including the handling of funds related to Guest transactions as described in the{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Refund &amp; Cancellation Policy</Link>. The Campsite Management cannot 
                accept new Guest bookings after the effective date of partnership termination.
              </p>
            </>
          ) : (
            <>
              <h2>Struktur Komisi</h2>
              <p>
                Embun mengambil komisi dari setiap transaksi pemesanan yang berhasil diselesaikan
                oleh Tamu melalui Embun App pada campsite milik Mitra.
                Persentase komisi disepakati secara tertulis antara Embun dan Mitra pada
                saat proses pendaftaran kemitraan, dan dapat berbeda tergantung jenis layanan atau
                paket yang ditawarkan oleh masing-masing campsite.
              </p>
              <p>
                Komisi dipotong secara otomatis dari total pembayaran yang diterima dari Tamu
                sebelum sisa dana disetorkan (settlement) kepada Mitra. Rincian komisi
                untuk setiap transaksi dapat dipantau oleh Mitra melalui dashboard
                backoffice Embun.
              </p>
              <p>
                Perubahan struktur komisi di masa mendatang akan diinformasikan terlebih dahulu
                kepada Mitra melalui kanal komunikasi resmi Embun sebelum berlaku efektif.
              </p>

              <h2>Jadwal Pencairan Dana (Settlement)</h2>
              <p>
                Dana milik Mitra untuk suatu periode transaksi akan berstatus &quot;Siap
                Dicairkan&quot; setelah tenggat waktu pembatalan (Refund_Window) pada seluruh
                transaksi terkait periode tersebut berakhir, sesuai dengan kebijakan refund yang
                berlaku pada masing-masing transaksi. Pencairan dapat dilakukan secara sebagian
                (partial settlement) sesuai dengan dana yang telah siap dicairkan.
              </p>
              <p>
                Status kesiapan dana dan riwayat setiap transfer dana yang telah dilakukan dapat
                dipantau secara real-time oleh Mitra melalui dashboard backoffice Embun.
              </p>

              <h2>Kewajiban Pengelola Campsite</h2>
              <p>
                Sebagai mitra Embun, pengelola campsite bertanggung jawab untuk menjaga keakuratan data
                ketersediaan (kalender, kuota spot, dan status blok) pada dashboard backoffice
                sehingga Tamu tidak menerima informasi yang menyesatkan saat melakukan pemesanan.
              </p>
              <p>
                Mitra juga bertanggung jawab untuk menjaga kualitas layanan yang diberikan
                kepada Tamu sesuai dengan deskripsi, fasilitas, dan harga yang tercantum pada
                profil campsite di Embun App, termasuk memastikan kesiapan lokasi pada tanggal
                check-in yang telah dipesan.
              </p>
              <p>
                Mitra wajib mematuhi seluruh kebijakan platform Embun yang berlaku,
                termasuk namun tidak terbatas pada kebijakan penetapan harga, kebijakan pembatalan
                dan refund sebagaimana dijelaskan pada{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Kebijakan Refund &amp; Pembatalan</Link>, serta
                standar komunikasi dan respons terhadap pertanyaan Tamu.
              </p>
              <p>
                Apabila terjadi pembatalan pesanan akibat kelalaian Mitra, misalnya
                campsite tidak tersedia pada tanggal check-in padahal ditampilkan tersedia di Embun
                App (overbooking), Mitra bertanggung jawab untuk mengupayakan lokasi
                pengganti yang setara bagi Tamu. Tamu yang terdampak berhak atas pengembalian dana
                penuh (100%) sebagaimana dijelaskan pada{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Kebijakan Refund &amp; Pembatalan</Link>, dan Embun
                berhak mengenakan penalti kepada Mitra atas biaya yang timbul akibat
                pembatalan tersebut, termasuk namun tidak terbatas pada biaya transaksi payment
                gateway yang tidak dapat dikembalikan.
              </p>
              <p>
                Mitra setuju untuk tidak menetapkan harga sewa di Embun App yang lebih
                tinggi daripada harga jual langsung (walk-in) di lokasi campsite untuk jenis layanan
                dan periode waktu yang sama.
              </p>
              <p>
                Mitra sepakat untuk melepaskan dan membebaskan Embun dari segala tuntutan
                hukum, ganti rugi, atau klaim dari Tamu maupun pihak ketiga lainnya yang timbul
                akibat kelalaian Mitra, kondisi keamanan lokasi, kecelakaan, atau kerusakan
                fasilitas selama Tamu berada di area campsite.
              </p>

              <h2>Syarat dan Mekanisme Pemutusan Kemitraan</h2>
              <p>
                Baik Embun maupun Mitra dapat mengajukan pemutusan kemitraan dengan
                menyampaikan pemberitahuan tertulis melalui kanal komunikasi resmi kepada pihak
                lainnya, disertai alasan pemutusan dan periode pemberitahuan sebagaimana disepakati
                pada perjanjian kemitraan awal.
              </p>
              <p>
                Embun berhak menghentikan kemitraan sewaktu-waktu apabila Mitra terbukti
                melanggar kewajiban yang dijelaskan pada halaman ini, termasuk memberikan data
                ketersediaan yang tidak akurat secara berulang, kualitas layanan yang secara
                konsisten tidak sesuai standar, atau pelanggaran terhadap kebijakan platform lainnya.
              </p>
              <p>
                Setelah pemutusan kemitraan disepakati atau berlaku efektif, transaksi Tamu yang
                sudah berjalan sebelum tanggal efektif pemutusan tetap diselesaikan sesuai dengan
                ketentuan yang berlaku, termasuk penanganan dana terkait transaksi Tamu yang
                dijelaskan pada{' '}
                <Link href={`/${lang}/kebijakan-refund`}>Kebijakan Refund &amp; Pembatalan</Link>. Campsite
                baru tidak dapat menerima pemesanan Tamu setelah tanggal efektif pemutusan
                kemitraan.
              </p>
            </>
          )}
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
