import type { CSSProperties, ReactNode } from 'react';

export interface SectionProps {
  children: ReactNode;
  /** Visual background variant. */
  variant?: 'default' | 'muted' | 'dark';
  /** Anchor id for in-page navigation. */
  id?: string;
  className?: string;
  style?: CSSProperties;
  compactTop?: boolean;
}

const FULL_BLOCK_PADDING = 'clamp(6rem, 12vw, 12rem)';
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

export default function Section({
  children,
  variant = 'default',
  id,
  className,
  style,
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
        ...style,
      }}
    >
      {children}
    </section>
  );
}
