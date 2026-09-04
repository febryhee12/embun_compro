'use client';

import React from 'react';
import Link from 'next/link';

export function ExploreFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface py-8 text-xs text-foreground-muted mt-auto">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg text-brand-blue tracking-tight">
            embun
          </span>
          <span>© {currentYear} PT Alam Kelana Digital. Hak Cipta Dilindungi.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/id/kebijakan-privasi/" className="hover:underline hover:text-foreground transition-colors">
            Privasi
          </Link>
          <Link href="/id/syarat-ketentuan/" className="hover:underline hover:text-foreground transition-colors">
            Syarat & Ketentuan
          </Link>
          <Link href="/id/mitra/" className="hover:underline hover:text-foreground transition-colors">
            Mitra Camp
          </Link>
        </div>
      </div>
    </footer>
  );
}
