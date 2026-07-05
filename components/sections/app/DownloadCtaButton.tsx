'use client';

import { useState } from 'react';
import { StoreBadge, type StoreKind } from '@/components/ui/StoreBadge';

export interface DownloadCtaButtonProps {
  href: string; // external app store URL, e.g. 'https://apps.apple.com/...'
  store: StoreKind;
  className?: string;
}

/** Focus-visible ring for the store-badge anchor on the dark section background (Requirement 8.7). */
const FOCUS_VISIBLE_CLASS =
  'rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2';

const STORE_LABEL: Record<StoreKind, string> = {
  apple: 'Unduh Embun App di App Store',
  google: 'Dapatkan Embun App di Google Play',
};

/**
 * DownloadCtaButton — small Client Component wrapper around a single
 * external app-store badge anchor used by `DownloadCta.tsx` (a Server
 * Component).
 *
 * Renders the official-style `StoreBadge` inside a real external link
 * (`target="_blank" rel="noopener noreferrer"`). The "navigation failure"
 * case detected is a missing/empty `href` (a genuine, testable failure
 * mode): when `href` is falsy, the click is prevented and an inline,
 * informative error notice is shown (Requirement 4.4); otherwise the native
 * anchor behavior proceeds normally, opening the store link in a new tab.
 */
export function DownloadCtaButton({ href, store, className }: DownloadCtaButtonProps) {
  const [navigationError, setNavigationError] = useState(false);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!href) {
      event.preventDefault();
      setNavigationError(true);
      return;
    }

    setNavigationError(false);
    // Let the native <a target="_blank"> behavior proceed normally.
  }

  return (
    <div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={STORE_LABEL[store]}
        onClick={handleClick}
        className={[FOCUS_VISIBLE_CLASS, 'inline-block', className ?? ''].filter(Boolean).join(' ')}
      >
        <StoreBadge store={store} />
      </a>
      {navigationError ? (
        // Renders on the Embun Black (`--surface-dark`) section background
        // (see DownloadCta), where the base `--error` red falls below the
        // WCAG 2.1 AA 4.5:1 text contrast minimum — so this uses the
        // lightened `--error-on-dark` token instead (Requirement 8.5).
        <p role="alert" aria-live="polite" className="mt-3 text-sm text-error-on-dark">
          Maaf, tautan unduhan tidak tersedia saat ini. Silakan coba lagi nanti.
        </p>
      ) : null}
    </div>
  );
}

export default DownloadCtaButton;
