'use client';

import { useEffect, useState } from 'react';

const APP_STORE_HREF = 'https://apps.apple.com/app/embun';
const GOOGLE_PLAY_HREF =
  'https://play.google.com/store/apps/details?id=app.embun';
const WEBSITE_HREF = 'https://embun.app';

/** Delay before the fallback UI is shown, giving the OS a chance to hand off to the installed app. */
const FALLBACK_DELAY_MS = 1500;

function resolveBlockId(pathname: string): string | null {
  // pathname is the real browser URL (e.g. "/spot/<id>/"), which Firebase
  // Hosting rewrites here while keeping the address bar unchanged.
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2 || segments[0] !== 'spot') return null;
  return segments[1] || null;
}

/**
 * SpotRedirectClient — Universal Link (iOS) / App Link (Android) fallback for
 * `https://link.embun.app/spot/<id>`.
 *
 * The OS intercepts this URL before it ever reaches a browser when the Embun
 * App is installed and the link is verified (`.well-known/assetlinks.json` /
 * `apple-app-site-association`). This page only renders when that hand-off
 * doesn't happen — app not installed, verification not yet propagated, or the
 * Guest opened the link explicitly in a browser — and gives them a way
 * forward instead of a dead page.
 *
 * Reads `window.location.pathname` directly (rather than `usePathname`)
 * because Firebase Hosting serves this static file via a rewrite while
 * keeping the original `/spot/<id>` URL in the address bar; the Next.js
 * router's build-time path for this route is `/spot-landing`, not the
 * rewritten one. The id-dependent UI is only computed client-side in
 * `useEffect` so the server/first-client render stay identical (no hydration
 * mismatch).
 */
export function SpotRedirectClient() {
  const [showFallback, setShowFallback] = useState(false);
  const [blockId, setBlockId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const id = resolveBlockId(window.location.pathname);
    setBlockId(id);

    if (!id) {
      setShowFallback(true);
      return;
    }

    // Best-effort attempt to hand off to the app via its custom scheme, in
    // case the OS-level Universal/App Link hand-off didn't already happen.
    window.location.href = `embun://spot?blockId=${encodeURIComponent(id)}`;

    const timer = window.setTimeout(
      () => setShowFallback(true),
      FALLBACK_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface-dark px-6 text-center text-white">
      <h1 className="font-serif text-2xl font-semibold">Membuka Embun App…</h1>
      <p className="max-w-sm text-sm text-white/70">
        {blockId === null
          ? 'Tautan ini tidak valid.'
          : 'Jika aplikasi tidak terbuka otomatis, unduh Embun App atau kunjungi situs kami.'}
      </p>
      {showFallback ? (
        <div className="flex flex-col items-center gap-3">
          <a
            href={APP_STORE_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black"
          >
            Unduh di App Store
          </a>
          <a
            href={GOOGLE_PLAY_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-6 py-2 text-sm font-semibold text-black"
          >
            Dapatkan di Google Play
          </a>
          <a href={WEBSITE_HREF} className="text-sm text-white/70 underline">
            Kunjungi embun.app
          </a>
        </div>
      ) : null}
    </main>
  );
}
