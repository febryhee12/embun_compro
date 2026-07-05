'use client';

import { useState } from 'react';
import { BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS } from '@/components/ui/Button';

export interface CTAButtonProps {
  href: string; // e.g. '#contact'
  label: string;
  className?: string;
}

/**
 * Focus-visible override for CTAButton (Requirement 8.7).
 *
 * CTAButton only ever renders inside `CallToAction`, on the Embun Black
 * (`--surface-dark`) section background. The global focus ring
 * (`app/globals.css`) defaults to Embun Blue, which doesn't meet the WCAG
 * 2.1 non-text 3:1 contrast minimum against Embun Black — so this local
 * override swaps the ring color to `--brand-lime`, mirroring the same
 * dark-context override already used by `SiteHeader`/`SiteFooter`.
 */
const FOCUS_VISIBLE_CLASS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2';

/**
 * CTAButton — small Client Component wrapper around the CTA anchor used by
 * `CallToAction.tsx` (a Server Component).
 *
 * Renders a plain `<a href="#contact">` that still works with zero JS
 * (progressive enhancement, relying on the global
 * `html { scroll-behavior: smooth }` rule — see `app/globals.css`). On top
 * of that, an `onClick` handler resolves the target section via
 * `document.getElementById` and calls `scrollIntoView` directly. If the
 * target section cannot be found in the DOM (a genuine, testable
 * "navigation failure" per Requirement 6.6), the click is prevented and an
 * inline, informative error notice is shown next to the button instead of
 * silently doing nothing.
 */
export function CTAButton({ href, label, className }: CTAButtonProps) {
  const [navigationError, setNavigationError] = useState(false);

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const targetId = href.startsWith('#') ? href.slice(1) : href;
    const target = document.getElementById(targetId);

    if (!target) {
      event.preventDefault();
      setNavigationError(true);
      return;
    }

    setNavigationError(false);
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div>
      <a
        href={href}
        onClick={handleClick}
        className={[
          BUTTON_BASE_CLASS,
          BUTTON_VARIANT_CLASS.primary,
          FOCUS_VISIBLE_CLASS,
          className ?? '',
        ].join(' ')}
      >
        {label}
      </a>
      {navigationError ? (
        // CTAButton renders on the Embun Black (`--surface-dark`) section
        // background (see CallToAction), where the base `--error` red falls
        // below the WCAG 2.1 AA 4.5:1 text contrast minimum — so this uses
        // the lightened `--error-on-dark` token instead (Requirement 8.5).
        <p role="alert" aria-live="polite" className="mt-3 text-sm text-error-on-dark">
          Maaf, terjadi kesalahan navigasi. Silakan gunakan menu di atas.
        </p>
      ) : null}
    </div>
  );
}

export default CTAButton;
