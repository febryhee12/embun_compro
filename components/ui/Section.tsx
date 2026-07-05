import type { CSSProperties, ReactNode } from 'react';

export interface SectionProps {
  children: ReactNode;
  /** Visual background variant. */
  variant?: 'default' | 'muted' | 'dark';
  /** Anchor id for in-page navigation. */
  id?: string;
  className?: string;
  /**
   * When true, uses a smaller top padding for the FIRST section of a page —
   * i.e. the one sitting directly under the sticky global header. The full
   * hero-sized top rhythm leaves an awkwardly large gap below the nav, while
   * too little leaves the content feeling cramped against the header. This
   * value is tuned to clear the 80px (`h-20`) sticky header with comfortable,
   * viewport-responsive breathing room (Requirements 1.7, 10.6).
   */
  compactTop?: boolean;
}

const FULL_BLOCK_PADDING = 'clamp(6rem, 12vw, 12rem)';
// Comfortable, responsive gap under the sticky header for a page's first
// section. Min 3rem on small screens (never cramped against the nav), scaling
// up to 5rem on wide viewports (never an awkward void).
const COMPACT_TOP_PADDING = 'clamp(3rem, 6vw, 5rem)';

const VARIANT_STYLE: Record<NonNullable<SectionProps['variant']>, CSSProperties> = {
  default: {
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
  },
  muted: {
    backgroundColor: 'var(--surface)',
    color: 'var(--foreground)',
  },
  dark: {
    backgroundColor: 'var(--surface-dark)',
    color: 'var(--foreground-on-dark)',
  },
};

/**
 * Section — vertical rhythm primitive.
 *
 * Applies generous, viewport-responsive block padding (`clamp(6rem, 12vw, 12rem)`)
 * so marketing sections get consistent "breathing room" between each other on
 * every viewport (Requirements 1.7, 10.6). `variant` controls the background/
 * foreground pairing, and `id` allows in-page anchor navigation (e.g. `#contact`).
 */
export default function Section({
  children,
  variant = 'default',
  id,
  className,
  compactTop = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={className}
      style={{
        paddingTop: compactTop ? COMPACT_TOP_PADDING : FULL_BLOCK_PADDING,
        paddingBottom: FULL_BLOCK_PADDING,
        ...VARIANT_STYLE[variant],
      }}
    >
      {children}
    </section>
  );
}
