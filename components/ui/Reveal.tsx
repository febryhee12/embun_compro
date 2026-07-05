'use client';

import type { CSSProperties, JSX, ReactNode } from 'react';

import { useScrollReveal } from '@/lib/hooks/useScrollReveal';

export interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms (for sequenced reveals). */
  delay?: number;
  /** Translate distance in px before reveal (default 24). */
  offset?: number;
  /** Element tag to render. Defaults to 'div'. */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

const DEFAULT_OFFSET = 24;
const DEFAULT_DELAY = 0;
const DURATION_MS = 1000;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Reveal — slow scroll-in fade/translate wrapper (Requirement 1.4, 9.5).
 *
 * Wraps `children` in the element specified by `as` (default 'div'),
 * attaching the ref from `useScrollReveal`. Before the element is
 * revealed it sits at `opacity: 0` and `translateY({offset}px)`; once
 * revealed it transitions to `opacity: 1` and `translateY(0)` over
 * `DURATION_MS` (within the 800–1200ms brand range) using the mist-like
 * ease-out easing `cubic-bezier(0.22, 1, 0.36, 1)`. `delay` staggers the
 * transition start for sequenced reveals (e.g. headline before sub-copy).
 *
 * `prefers-reduced-motion: reduce` is handled entirely by
 * `useScrollReveal`, which reports `revealed: true` on first render in
 * that case — so this component naturally renders in its final state
 * with no perceptible transform, without any extra media-query logic
 * here.
 */
export function Reveal({
  children,
  delay = DEFAULT_DELAY,
  offset = DEFAULT_OFFSET,
  as = 'div',
  className,
}: RevealProps) {
  const { ref, revealed } = useScrollReveal({ offset });

  const style: CSSProperties = {
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : `translateY(${offset}px)`,
    transitionProperty: 'opacity, transform',
    transitionDuration: `${DURATION_MS}ms`,
    transitionTimingFunction: EASING,
    transitionDelay: `${delay}ms`,
  };

  const Tag = as as React.ElementType;

  return (
    <Tag ref={ref} style={style} className={className}>
      {children}
    </Tag>
  );
}

export default Reveal;
