import type { ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  /** When true, removes the max-width to allow full-bleed media. */
  bleed?: boolean;
}

/**
 * Container — max-width 1200px layout primitive with responsive gutters.
 *
 * Centers content horizontally and applies consistent horizontal padding
 * that scales from mobile to desktop. Pass `bleed` to opt out of the
 * max-width constraint for full-bleed media (e.g. edge-to-edge images).
 */
export function Container({ children, className, bleed = false }: ContainerProps) {
  const classes = [
    'mx-auto w-full px-6 sm:px-8 lg:px-10',
    bleed ? '' : 'max-w-[1200px]',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
