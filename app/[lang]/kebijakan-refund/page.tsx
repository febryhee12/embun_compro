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
export default async function KebijakanRefundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isEn = lang === 'en';
  const breadcrumbItems = [
    { label: isEn ? 'Home' : 'Beranda', href: `/${lang}` },
    { label: isEn ? 'Refund & Cancellation Policy' : 'Kebijakan Refund & Pembatalan' },
  ];

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <LegalLayout 
          title={isEn ? "Refund & Cancellation Policy" : "Kebijakan Refund & Pembatalan"} 
          lastUpdated="2026-07-03"
        >
          <LegalDisclaimer lang={lang} />

          {isEn ? (
            <>
              <h2>Terms and Cancellation Deadlines</h2>
              <p>
                Guests can request an order cancellation via the Embun App before the cancellation deadline 
                applicable to that order. The cancellation deadline that qualifies for a refund is counted down 
                from the check-in date listed on the order, and is specifically displayed on the Guest's order 
                details page in the Embun App before the payment is confirmed.
              </p>
              <p>
                Cancellations submitted before the applicable cancellation deadline for the respective order are 
                entitled to a refund in accordance with the provisions on this page. Guests are advised to check 
                the cancellation deadline on each order, as deadlines may vary between campsites depending on the 
                policy of each Partner (Mitra) affiliated with Embun.
              </p>

              <h2>Refund Mechanism</h2>
              <p>
                All payments on the Embun App are processed through official payment gateways working with Embun. 
                If an order cancellation meets the refund criteria, Embun will submit a refund request via the 
                payment gateway using the same payment method used by the Guest during the initial transaction.
              </p>
              <p>
                The estimated processing time for funds to be returned to the Guest's account or payment method is 
                3 to 14 business days after the refund request is approved, depending on the payment method used 
                (e.g., credit card, bank transfer, or digital wallet) and the processing time applicable at the 
                respective bank or payment method provider. Embun cannot expedite the processing time outside the 
                control of the payment gateway and the related bank/provider.
              </p>
              <p>
                Guests will receive a notification via the Embun App once the refund request has been submitted 
                and once the funds have been successfully returned.
              </p>
              <p>
                Refunds only apply to the campsite rental price. Application service fees (Admin Fee, Service Fee, 
                and related taxes/VAT) charged at the time of the transaction are non-refundable and are not included 
                in the refund calculation. For example, for a rental of Rp200,000 with an Admin Fee of Rp4,000 and a 
                Service Fee of Rp2,000 (total Rp206,000), a full refund (100%) will return Rp200,000, not Rp206,000. 
                The applicable refund percentage is calculated from the rental price.
              </p>

              <h2>Cancellation by Partner or Force Majeure</h2>
              <p>
                If an order is unilaterally canceled by the Partner, the Guest is entitled to a full refund (100%), 
                regardless of the regular cancellation deadline applicable to that order.
              </p>
              <p>
                The same provision also applies in the event of force majeure conditions, such as natural disasters, 
                extreme weather, or area closures by authorities, which result in the campsite being unable to operate 
                on the booked check-in date.
              </p>

              <h2>Manual Refund for Certain Payment Methods</h2>
              <p>
                Some payment methods, such as payments via retail outlets or certain digital wallets, do not support 
                automatic refunds via the payment gateway. In such conditions, the Embun team will contact the Guest 
                to request valid bank account details to process the refund manually via bank transfer.
              </p>

              <h2>Non-Refundable Scenarios</h2>
              <p>
                In certain scenarios, paid funds cannot be refunded. These scenarios include, but are not limited to:
              </p>
              <ul>
                <li>
                  Funds will not be refunded if the cancellation is submitted after the cancellation deadline 
                  applicable to the respective order.
                </li>
                <li>
                  Funds will not be refunded if the Guest fails to show up (no-show) on the booked check-in date 
                  without prior cancellation.
                </li>
                <li>
                  Funds will not be refunded if the order is canceled after the stay has commenced 
                  (check-in has been completed).
                </li>
              </ul>
              <p>
                For further inquiries regarding the refund status of a specific order, Guests can contact the Embun 
                support team via the help channels available on the Embun App.
              </p>
            </>
          ) : (
            <>
              <h2>Syarat dan Tenggat Waktu Pembatalan</h2>
              <p>
                Tamu dapat mengajukan pembatalan pesanan melalui Embun App sebelum tenggat waktu
                pembatalan yang berlaku untuk pesanan tersebut. Tenggat waktu pembatalan yang
                memenuhi kualifikasi pengembalian dana dihitung mundur dari tanggal check-in yang
                tercantum pada pesanan, dan ditampilkan secara spesifik pada halaman detail pesanan
                Tamu di Embun App sebelum pembayaran dikonfirmasi.
              </p>
              <p>
                Pembatalan yang diajukan sebelum tenggat waktu pembatalan yang berlaku untuk pesanan
                yang bersangkutan berhak atas pengembalian dana sesuai dengan ketentuan pada halaman
                ini. Tamu disarankan untuk memeriksa tenggat waktu pembatalan pada setiap pesanan,
                karena tenggat waktu dapat berbeda antar campsite tergantung kebijakan masing-masing
                pengelola campsite (Mitra) yang bermitra dengan Embun.
              </p>

              <h2>Mekanisme Pengembalian Dana</h2>
              <p>
                Seluruh pembayaran pada Embun App diproses melalui payment gateway resmi yang
                bekerja sama dengan Embun. Apabila pembatalan pesanan memenuhi syarat pengembalian
                dana, Embun akan mengajukan permintaan refund melalui payment gateway tersebut
                menggunakan metode pembayaran yang sama dengan yang digunakan Tamu saat melakukan
                transaksi awal.
              </p>
              <p>
                Estimasi waktu proses pengembalian dana ke rekening atau metode pembayaran Tamu
                adalah 3 hingga 14 hari kerja setelah permintaan refund disetujui, tergantung pada
                metode pembayaran yang digunakan (misalnya kartu kredit, transfer bank, atau
                dompet digital) dan waktu proses yang berlaku di masing-masing bank atau penyedia
                metode pembayaran. Embun tidak dapat mempercepat waktu proses di luar kendali
                payment gateway dan bank/penyedia metode pembayaran terkait.
              </p>
              <p>
                Tamu akan menerima notifikasi melalui Embun App setelah permintaan refund
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

              <h2>Pembatalan oleh Pengelola Campsite (Mitra) atau Force Majeure</h2>
              <p>
                Jika pesanan dibatalkan secara sepihak oleh pengelola campsite (Mitra), Tamu berhak atas
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
                Dalam kondisi tersebut, tim Embun akan menghubungi Tamu untuk meminta detail rekening
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
                  Dana tidak akan dikembalikan jika Tamu tidak hadir (no-show) pada tanggal check-in
                  yang telah dipesan tanpa melakukan pembatalan sebelumnya.
                </li>
                <li>
                  Dana tidak akan dikembalikan jika pesanan dibatalkan setelah masa menginap dimulai
                  (check-in telah dilakukan).
                </li>
              </ul>
              <p>
                Untuk pertanyaan lebih lanjut mengenai status pengembalian dana pada pesanan
                tertentu, Tamu dapat menghubungi tim dukungan Embun melalui kanal bantuan yang
                tersedia pada Embun App.
              </p>
            </>
          )}
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
