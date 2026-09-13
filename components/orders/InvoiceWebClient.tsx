'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { fetchInvoiceData, API_BASE_URL } from '@/lib/api-client';
import { InvoiceDocument } from '@/components/orders/InvoiceModal';
import { type Language } from '@/lib/account-i18n';

interface InvoiceDataResponse {
  order: any;
  booking: any;
  addonLines: any[];
  nights: number;
  shortCode: string;
  downloadUrl: string;
}

export function InvoiceWebClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [lang, setLang] = useState<Language>('id');
  const [data, setData] = useState<InvoiceDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('embun_lang') as Language;
      if (saved === 'id' || saved === 'en') setLang(saved);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      setError(lang === 'en' ? 'Order ID is required.' : 'ID pesanan tidak valid.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchInvoiceData(orderId)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || (lang === 'en' ? 'Failed to load invoice.' : 'Gagal memuat invoice.'));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, lang]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          {lang === 'en' ? 'Loading invoice...' : 'Memuat invoice...'}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
            {lang === 'en' ? 'Invoice Unavailable' : 'Invoice Tidak Ditemukan'}
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            {error || (lang === 'en' ? 'The requested invoice could not be found.' : 'Data invoice pesanan tidak ditemukan.')}
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/orders"
              className="px-5 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-white transition-all cursor-pointer"
            >
              {lang === 'en' ? 'Go to Orders' : 'Ke Daftar Pesanan'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pdfUrl = `${API_BASE_URL}/orders/${orderId}/invoice.pdf`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 text-neutral-900 print:bg-white print:p-0">
      {/* Top Action Bar (Tokopedia-style web app header) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 shadow-2xs print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/orders/detail?id=${orderId}`}
              className="p-2 -ml-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shrink-0"
              aria-label={lang === 'en' ? 'Back to Order Details' : 'Kembali ke Detail Pesanan'}
            >
              <ArrowLeft size={20} className="stroke-[2.2]" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white tracking-tight">
                  Invoice
                </span>
                <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-md font-bold shrink-0">
                  {data.shortCode}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Clean 'Unduh Invoice' (NO ICON) + 'Cetak' */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Print' : 'Cetak'}
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-4 sm:px-5 py-2 rounded-full bg-[#0841B5] hover:bg-[#073696] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center justify-center"
            >
              {lang === 'en' ? 'Download Invoice' : 'Unduh Invoice'}
            </a>
          </div>
        </div>
      </header>

      {/* Invoice Document Body */}
      <main className="max-w-4xl mx-auto py-6 sm:py-10 px-3 sm:px-6 print:p-0 print:m-0 print:max-w-none">
        <InvoiceDocument
          order={data.order}
          booking={data.booking}
          addonLines={data.addonLines}
          nights={data.nights}
          shortCode={data.shortCode}
          lang={lang}
        />
      </main>
    </div>
  );
}
