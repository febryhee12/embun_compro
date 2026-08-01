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
          lastUpdated="2026-07-30"
          isEn={isEn}
        >
          {isEn ? (
            <>
              <h2>Terms and Cancellation Deadlines</h2>
              <p>
                Guests can request an order cancellation via the Embun App at any time before the check-in date. The refund amount the Guest is entitled to receive is determined based on the distance between the time of the cancellation request and the check-in date listed on the order, with the following provisions:
              </p>
              
              <div className="overflow-x-auto my-6">
                <table className="w-full text-left border-collapse border border-[var(--border)]">
                  <thead>
                    <tr className="bg-[var(--surface)]">
                      <th className="border border-[var(--border)] p-3 font-semibold">Cancellation Time</th>
                      <th className="border border-[var(--border)] p-3 font-semibold">Refund Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[var(--border)] p-3">D-7 or more before check-in</td>
                      <td className="border border-[var(--border)] p-3">100% of rental price</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--border)] p-3">D-3 up to less than D-7 before check-in</td>
                      <td className="border border-[var(--border)] p-3">50% of rental price</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--border)] p-3">Less than D-3 before check-in (including D-0)</td>
                      <td className="border border-[var(--border)] p-3">0% (no refund)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                This provision applies centrally and uniformly to all campsites partnering with Embun, except for certain campsites marked as <strong>&quot;Non-Refundable&quot;</strong> by the Campsite Management. For campsites with this status, orders are not eligible for a refund under any scenario, except in the event of cancellation by the Campsite Management or force majeure (see the relevant section). The &quot;Non-Refundable&quot; status is clearly displayed on the campsite details page before the Guest places an order.
              </p>
              <p>
                Guests are advised to check the applicable refund percentage on each order before making a payment, as deadlines and refundability status may vary between campsites depending on the policy of each Campsite Management partnering with Embun.
              </p>

              <h2>Refund Mechanism</h2>
              <p>
                All payments on the Embun App are processed through official payment gateways working with Embun. If an order cancellation meets the refund criteria, Embun will submit a refund request via the payment gateway using the same payment method used by the Guest during the initial transaction.
              </p>
              <p>
                The estimated processing time for funds to be returned to the Guest&apos;s account or payment method is 3 to 14 business days after the refund request is approved, depending on the payment method used (e.g., credit card, bank transfer, or digital wallet) and the processing time applicable at the respective bank or payment method provider. Embun cannot expedite the processing time outside the control of the payment gateway and the related bank/provider.
              </p>
              <p>
                Guests will receive a notification via the Embun App once the refund request has been submitted and once the funds have been successfully returned.
              </p>
              <p>
                Refunds only apply to the campsite rental price. Application service fees (Admin Fee, Service Fee, and related taxes/VAT) charged at the time of the transaction are non-refundable and are not included in the refund calculation, regardless of the refund percentage.
              </p>
              <p>
                As an illustration, for a rental of Rp200,000 with an Admin Fee of Rp4,000 and a Service Fee of Rp2,000 (total Rp206,000):
              </p>
              <ul>
                <li>A 100% refund returns Rp200,000, not Rp206,000.</li>
                <li>A 50% refund returns Rp100,000, not Rp103,000.</li>
              </ul>
              <p>
                The applicable refund percentage is calculated from this rental price.
              </p>

              <h2>Refund Processing Fees</h2>
              <p>
                For cancellations submitted by the Guest, if the payment gateway charges a refund processing fee (cancellation fee), such fee shall be borne by the Guest and will be deducted from the refund amount before the funds are transferred, separate from the applicable refund percentage (100% or 50%). As an illustration, for a 100% refund on a rental price of Rp200,000 with a refund processing fee of Rp2,000, the amount received by the Guest will be Rp200,000 − Rp2,000 (total Rp198,000).
              </p>
              <p>
                This provision does not apply to cancellations by the Campsite Management or in force majeure conditions (see the relevant section).
              </p>

              <h2>Cancellation by Campsite Management or Force Majeure</h2>
              <p>
                If an order is unilaterally canceled by the Campsite Management, the Guest is entitled to a full refund (100%), regardless of the regular cancellation deadline or the &quot;Non-Refundable&quot; status applicable to that order.
              </p>
              <p>
                The same provision also applies in the event of force majeure conditions, such as natural disasters, extreme weather, or area closures by authorities, which result in the campsite being unable to operate on the booked check-in date.
              </p>

              <h2>Non-Refundable Scenarios</h2>
              <p>
                In certain scenarios, paid funds cannot be refunded. These scenarios include, but are not limited to:
              </p>
              <ul>
                <li>
                  Funds will not be refunded if the cancellation is submitted less than D-3 before the applicable check-in date for the respective order.
                </li>
                <li>
                  Funds will not be refunded if the order is placed at a campsite marked with a &quot;Non-Refundable&quot; status, regardless of when the cancellation is submitted.
                </li>
                <li>
                  Funds will not be refunded if the Guest fails to show up (no-show) on the booked check-in date without prior cancellation.
                </li>
                <li>
                  Funds will not be refunded if the order is canceled after the stay has commenced (check-in has been completed).
                </li>
              </ul>
              <p>
                For further inquiries regarding the refund status of a specific order, Guests can contact the Embun support team via the help channels available on the Embun App.
              </p>
            </>
          ) : (
            <>
              <h2>Syarat dan Tenggat Waktu Pembatalan</h2>
              <p>
                Tamu dapat mengajukan pembatalan pesanan melalui Embun App kapan saja sebelum tanggal check-in. Besaran pengembalian dana yang berhak diterima Tamu ditentukan berdasarkan jarak antara waktu pengajuan pembatalan dan tanggal check-in yang tercantum pada pesanan, dengan ketentuan sebagai berikut:
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full text-left border-collapse border border-[var(--border)]">
                  <thead>
                    <tr className="bg-[var(--surface)]">
                      <th className="border border-[var(--border)] p-3 font-semibold">Waktu Pembatalan</th>
                      <th className="border border-[var(--border)] p-3 font-semibold">Persentase Pengembalian Dana</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[var(--border)] p-3">H-7 atau lebih sebelum check-in</td>
                      <td className="border border-[var(--border)] p-3">100% dari harga sewa</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--border)] p-3">H-3 sampai dengan kurang dari H-7 sebelum check-in</td>
                      <td className="border border-[var(--border)] p-3">50% dari harga sewa</td>
                    </tr>
                    <tr>
                      <td className="border border-[var(--border)] p-3">Kurang dari H-3 sebelum check-in (termasuk H-0)</td>
                      <td className="border border-[var(--border)] p-3">0% (tidak ada pengembalian dana)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                Ketentuan ini berlaku secara terpusat dan seragam untuk seluruh campsite yang bermitra dengan Embun, kecuali pada campsite tertentu yang ditandai sebagai <strong>&quot;Tidak Dapat Direfund&quot;</strong> oleh pengelola campsite. Untuk campsite dengan status tersebut, pesanan tidak memenuhi syarat pengembalian dana dalam skenario apa pun, kecuali pada kondisi pembatalan oleh pengelola campsite atau force majeure (lihat bagian terkait). Status &quot;Tidak Dapat Direfund&quot; ditampilkan secara jelas pada halaman detail campsite sebelum Tamu melakukan pemesanan.
              </p>
              <p>
                Tamu disarankan untuk memeriksa persentase pengembalian dana yang berlaku pada setiap pesanan sebelum melakukan pembayaran, karena tenggat waktu dan status refundability dapat berbeda antar campsite tergantung kebijakan masing-masing pengelola campsite yang bermitra dengan Embun.
              </p>

              <h2>Mekanisme Pengembalian Dana</h2>
              <p>
                Seluruh pembayaran pada Embun App diproses melalui payment gateway resmi yang bekerja sama dengan Embun. Apabila pembatalan pesanan memenuhi syarat pengembalian dana, Embun akan mengajukan permintaan refund melalui payment gateway tersebut menggunakan metode pembayaran yang sama dengan yang digunakan Tamu saat melakukan transaksi awal.
              </p>
              <p>
                Estimasi waktu proses pengembalian dana ke rekening atau metode pembayaran Tamu adalah 3 hingga 14 hari kerja setelah permintaan refund disetujui, tergantung pada metode pembayaran yang digunakan (misalnya kartu kredit, transfer bank, atau dompet digital) dan waktu proses yang berlaku di masing-masing bank atau penyedia metode pembayaran. Embun tidak dapat mempercepat waktu proses di luar kendali payment gateway dan bank/penyedia metode pembayaran terkait.
              </p>
              <p>
                Tamu akan menerima notifikasi melalui Embun App setelah permintaan refund diajukan dan setelah dana berhasil dikembalikan.
              </p>
              <p>
                Pengembalian dana hanya berlaku atas harga sewa campsite. Biaya layanan aplikasi (Biaya Admin, Biaya Layanan, dan pajak/PPN terkait) yang dibebankan pada saat transaksi bersifat non-refundable dan tidak termasuk dalam perhitungan pengembalian dana, pada persentase pengembalian dana berapa pun.
              </p>
              <p>
                Sebagai ilustrasi, untuk sewa Rp200.000 dengan Biaya Admin Rp4.000 dan Biaya Layanan Rp2.000 (total Rp206.000):
              </p>
              <ul>
                <li>Pengembalian dana 100% mengembalikan Rp200.000, bukan Rp206.000.</li>
                <li>Pengembalian dana 50% mengembalikan Rp100.000, bukan Rp103.000.</li>
              </ul>
              <p>
                Persentase pengembalian dana yang berlaku dihitung dari harga sewa tersebut.
              </p>

              <h2>Biaya Pemrosesan Pengembalian Dana</h2>
              <p>
                Untuk pembatalan yang diajukan oleh Tamu, apabila payment gateway membebankan biaya pemrosesan pengembalian dana (biaya pembatalan), biaya tersebut menjadi tanggungan Tamu dan akan dikurangkan dari nominal pengembalian dana sebelum dana ditransfer, di luar persentase pengembalian dana yang berlaku (100% atau 50%). Sebagai ilustrasi, untuk pengembalian dana 100% atas harga sewa Rp200.000 dengan biaya pemrosesan pengembalian dana sebesar Rp2.000, maka nominal yang diterima Tamu adalah Rp200.000 − Rp2.000 (total Rp198.000).
              </p>
              <p>
                Ketentuan ini tidak berlaku pada pembatalan oleh pengelola campsite atau force majeure (lihat bagian terkait).
              </p>

              <h2>Pembatalan oleh Pengelola Campsite atau Force Majeure</h2>
              <p>
                Jika pesanan dibatalkan secara sepihak oleh pengelola campsite, Tamu berhak atas pengembalian dana penuh (100%), terlepas dari tenggat waktu pembatalan reguler atau status &quot;Tidak Dapat Direfund&quot; yang berlaku pada pesanan tersebut.
              </p>
              <p>
                Ketentuan yang sama juga berlaku apabila terjadi kondisi force majeure, seperti bencana alam, cuaca ekstrem, atau penutupan area oleh pihak berwenang, yang mengakibatkan campsite tidak dapat beroperasi pada tanggal check-in yang telah dipesan.
              </p>

              <h2>Skenario Dana Tidak Dapat Dikembalikan</h2>
              <p>
                Dalam skenario tertentu, dana yang telah dibayarkan tidak dapat dikembalikan. Skenario tersebut meliputi, namun tidak terbatas pada:
              </p>
              <ul>
                <li>
                  Dana tidak akan dikembalikan jika pembatalan diajukan kurang dari H-3 sebelum tanggal check-in yang berlaku untuk pesanan yang bersangkutan.
                </li>
                <li>
                  Dana tidak akan dikembalikan jika pesanan dilakukan pada campsite yang ditandai berstatus &quot;Tidak Dapat Direfund&quot;, tanpa memandang kapan pembatalan diajukan.
                </li>
                <li>
                  Dana tidak akan dikembalikan jika Tamu tidak hadir (no-show) pada tanggal check-in yang telah dipesan tanpa melakukan pembatalan sebelumnya.
                </li>
                <li>
                  Dana tidak akan dikembalikan jika pesanan dibatalkan setelah masa menginap dimulai (check-in telah dilakukan).
                </li>
              </ul>
              <p>
                Untuk pertanyaan lebih lanjut mengenai status pengembalian dana pada pesanan tertentu, Tamu dapat menghubungi tim dukungan Embun melalui kanal bantuan yang tersedia pada Embun App.
              </p>
            </>
          )}
        </LegalLayout>
      </main>
      <SiteFooter />
    </>
  );
}
