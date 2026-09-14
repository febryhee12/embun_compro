import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InvoiceWebClient } from '@/components/orders/InvoiceWebClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Invoice | Embun',
  description: 'Invoice resmi reservasi dan pemesanan Embun.',
  robots: { index: false, follow: false },
};

export default function OrderInvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 border-3 border-[#0841B5]/20 border-t-[#0841B5] rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            Memuat invoice...
          </p>
        </div>
      }
    >
      <InvoiceWebClient />
    </Suspense>
  );
}
