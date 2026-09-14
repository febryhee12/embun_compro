'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#08090B] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-lime mb-4">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-lg font-bold text-white mb-2">
        Terjadi Kendala Memuat Halaman
      </h2>
      <p className="text-xs text-neutral-400 max-w-sm mb-6 leading-relaxed">
        Halaman tidak dapat dimuat saat ini. Silakan coba muat ulang atau kembali ke halaman utama Explore.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Muat Ulang</span>
        </button>
        <Link
          href="/explore"
          className="px-5 py-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-all"
        >
          Kembali ke Explore
        </Link>
      </div>
    </div>
  );
}
