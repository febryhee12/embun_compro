'use client';

import { useEffect, useRef, useState } from 'react';

export interface UseScrollRevealOptions {
  /** px translate before reveal (used by the consuming Reveal component). */
  offset?: number;
  /** IntersectionObserver threshold. */
  threshold?: number;
  /** Reveal only once; observer disconnects after the first reveal. */
  once?: boolean;
}

export interface UseScrollRevealResult {
  ref: React.RefObject<HTMLElement | null>;
  revealed: boolean;
}

const DEFAULT_THRESHOLD = 0.15;
const DEFAULT_ONCE = true;

/**
 * Synchronously determines whether an element should be considered
 * "revealed" from the very first render, without waiting on an observer:
 * `prefers-reduced-motion: reduce`, or a missing IntersectionObserver
 * implementation, both mean there is nothing to observe (Property 7).
 */
function computeInitialRevealed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return true;
  }

  return typeof IntersectionObserver === 'undefined';
}

/**
 * useScrollReveal — tracks whether an element has scrolled into the
 * viewport, for use by scroll-in-reveal animations (Requirement 1.4).
 *
 * Preconditions: client-only (`'use client'`); guards for missing
 * IntersectionObserver support and `prefers-reduced-motion: reduce`.
 *
 * Postconditions:
 * - `revealed` starts `false` and becomes `true` once the element
 *   intersects the viewport at `threshold`.
 * - When `once` is `true` (default), `revealed` never returns to `false`
 *   after becoming `true`, and the observer disconnects immediately after
 *   the first reveal (Property 6).
 * - When `prefers-reduced-motion: reduce` is set, or when
 *   IntersectionObserver is unavailable, `revealed` is `true` immediately
 *   and no observer is created (Property 7).
 * - The observer is always disconnected on unmount.
 *
 * Note: `offset` is not used internally — it is surfaced purely as an
 * input option for consuming components (e.g. `Reveal`) to compute their
 * own transform/translate styling.
 */
export function useScrollReveal(
  options?: UseScrollRevealOptions
): UseScrollRevealResult {
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
  const once = options?.once ?? DEFAULT_ONCE;

  const ref = useRef<HTMLElement | null>(null);
  // Lazy initializer: reduced-motion / no-IntersectionObserver cases are
  // resolved synchronously up front, so the effect below never needs to
  // call `setRevealed` synchronously on mount for those cases (avoiding
  // cascading renders) — it only sets state in response to later
  // observer callbacks. `resolvedStatically` mirrors that same initial
  // computation in a ref (rather than reading `revealed` state) purely so
  // the effect doesn't need to depend on `revealed` itself.
  const [revealed, setRevealed] = useState(computeInitialRevealed);
  const resolvedStatically = useRef(revealed);

  useEffect(() => {
    if (resolvedStatically.current) {
      // Already resolved via the lazy initializer (reduced-motion or no
      // IntersectionObserver support) — nothing left to observe.
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            setRevealed(false);
          }
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  return { ref, revealed };
}

export default useScrollReveal;
