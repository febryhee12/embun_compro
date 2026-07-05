import type { CSSProperties } from 'react';

export type StoreKind = 'apple' | 'google';

export interface StoreBadgeProps {
  store: StoreKind;
  /** Optional style override for the wrapper (e.g. width on mobile). */
  style?: CSSProperties;
  className?: string;
}

/**
 * Official-style Apple logo glyph, drawn as an inline SVG so it renders
 * crisply at any size without an image asset. `currentColor` lets the badge
 * control the fill.
 */
function AppleGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d="M17.05 12.53c-.02-2.02 1.65-2.99 1.72-3.04-.94-1.37-2.4-1.56-2.92-1.58-1.24-.13-2.42.73-3.05.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.4 2.43-.36 6.02 1.01 7.99.67.96 1.47 2.04 2.51 2 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.63.63 1.09-.02 1.78-.98 2.44-1.95.77-1.12 1.09-2.2 1.11-2.26-.02-.01-2.13-.82-2.15-3.24zM15.04 6.34c.56-.68.94-1.62.83-2.56-.81.03-1.79.54-2.37 1.21-.52.6-.97 1.56-.85 2.48.9.07 1.83-.46 2.39-1.13z" />
    </svg>
  );
}

/**
 * Official-style Google Play triangle glyph, drawn as an inline SVG with the
 * four brand-colored facets.
 */
function GooglePlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
      <path d="M3.6 2.3c-.24.25-.38.63-.38 1.13v17.14c0 .5.14.88.38 1.13l.06.05L13 12.06v-.12L3.66 2.25l-.06.05z" fill="#00D0FF" />
      <path d="M16.5 15.56 13 12.06v-.12l3.5-3.5.08.05 4.15 2.36c1.18.67 1.18 1.77 0 2.45l-4.15 2.36-.08.05z" fill="#FFCE00" />
      <path d="M16.58 15.51 13 12l-9.4 9.4c.39.41 1.03.46 1.76.05l11.22-6.44" fill="#FF3D44" />
      <path d="M16.58 8.49 5.36 2.05C4.63 1.64 3.99 1.69 3.6 2.1L13 11.5l3.58-3.01z" fill="#00F076" />
    </svg>
  );
}

/**
 * StoreBadge — presentational app-store download badge (App Store / Google
 * Play) in the official two-line lockup style: brand glyph on the left, a
 * small "Unduh di" / "Dapatkan di" lead-in above the large store name, on a
 * solid dark rounded button. Purely visual — the caller wraps it in the
 * appropriate `<a>`/interactive element so this stays reusable across the
 * Hero (plain anchor) and the DownloadCta (client anchor with error handling).
 */
export function StoreBadge({ store, style, className }: StoreBadgeProps) {
  const isApple = store === 'apple';
  const lead = isApple ? 'Unduh di' : 'Dapatkan di';
  const name = isApple ? 'App Store' : 'Google Play';

  return (
    <span
      style={style}
      className={[
        'inline-flex items-center gap-3 rounded-md bg-foreground px-4 py-2.5 text-background',
        'transition-colors duration-200 hover:opacity-80',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="shrink-0 text-background">
        {isApple ? <AppleGlyph /> : <GooglePlayGlyph />}
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[0.625rem] font-normal tracking-wide">{lead}</span>
        <span className="mt-0.5 font-semibold leading-tight">{name}</span>
      </span>
    </span>
  );
}

export default StoreBadge;
