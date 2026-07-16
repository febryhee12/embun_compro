'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface MockupImageProps {
  src: string;
  alt: string;
  /** Aspect variant of the placeholder art: phone (9:16) or wide card (4:3). */
  variant?: 'phone' | 'wide';
  sizes?: string;
  priority?: boolean;
  /** Short label shown inside the placeholder screen (e.g. feature name). */
  label?: string;
}

/**
 * MockupImage — drop-in replacement for the raw `next/image` usages on the
 * App Landing Page (Hero, Features, Screenshots).
 *
 * Tries to load the real asset at `src`; while missing (404) it renders a
 * branded, intentional-looking phone mockup placeholder instead of a broken
 * white box: a device frame with a gradient screen, the Embun logogram, and
 * a skeleton UI (search bar + cards). When the real screenshots are added
 * at the same paths later, they will render automatically — no code change.
 */
export function MockupImage({
  src,
  alt,
  variant = 'phone',
  sizes,
  priority,
  label,
}: MockupImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if image exists by attempting to fetch it
  useEffect(() => {
    if (hasError) return;

    const checkImageExists = async () => {
      try {
        const response = await fetch(src, { method: 'HEAD' });
        if (response.status === 404) {
          setHasError(true);
        }
      } catch {
        // Network error or CORS issue, assume image doesn't exist
        setHasError(true);
      }
    };

    checkImageExists();
  }, [src, hasError]);

  if (!hasError && isLoaded) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes={sizes}
        className="object-cover"
      />
    );
  }

  if (!hasError && !isLoaded) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        sizes={sizes}
        className="object-cover"
        onLoadingComplete={(result) => {
          if (result.naturalWidth > 0 && result.naturalHeight > 0) {
            setIsLoaded(true);
          } else {
            setHasError(true);
          }
        }}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--brand-blue)] via-[#0a3ba0] to-[#062f8a] p-6"
    >
      {/* Phone device frame */}
      <div
        className={[
          'relative flex flex-col overflow-hidden rounded-[1.75rem] border-[6px] border-black/70 bg-[#f6f8fc] shadow-2xl',
          variant === 'phone'
            ? 'h-[86%] aspect-[9/19]'
            : 'h-[80%] aspect-[9/19]',
        ].join(' ')}
      >
        {/* Notch */}
        <div className="mx-auto mt-2 h-1.5 w-14 shrink-0 rounded-full bg-black/20" />

        {/* Skeleton app UI */}
        <div className="flex flex-1 flex-col gap-2.5 p-3">
          {/* Search bar */}
          <div className="flex h-7 items-center gap-1.5 rounded-full bg-white px-2.5 shadow-sm">
            <div className="h-2.5 w-2.5 rounded-full border-[1.5px] border-[var(--brand-blue)]" />
            <div className="h-1.5 w-2/3 rounded-full bg-black/10" />
          </div>

          {/* Hero card with lime accent badge */}
          <div className="relative flex-[2] rounded-xl bg-gradient-to-br from-emerald-200 to-emerald-400">
            <div className="absolute left-2 top-2 h-3 w-10 rounded-full bg-[var(--brand-lime)]" />
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              <div className="h-1.5 w-3/4 rounded-full bg-white/80" />
              <div className="h-1.5 w-1/2 rounded-full bg-white/60" />
            </div>
          </div>

          {/* Two smaller cards */}
          <div className="flex flex-1 gap-2">
            <div className="flex-1 rounded-lg bg-gradient-to-br from-sky-200 to-sky-300" />
            <div className="flex-1 rounded-lg bg-gradient-to-br from-amber-200 to-amber-300" />
          </div>

          {/* Text lines */}
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-black/10" />
            <div className="h-1.5 w-2/3 rounded-full bg-black/10" />
          </div>

          {/* Bottom nav */}
          <div className="mt-auto flex h-7 items-center justify-around rounded-full bg-white shadow-sm">
            <div className="h-2 w-2 rounded-full bg-[var(--brand-blue)]" />
            <div className="h-2 w-2 rounded-full bg-black/15" />
            <div className="h-2 w-2 rounded-full bg-black/15" />
            <div className="h-2 w-2 rounded-full bg-black/15" />
          </div>
        </div>
      </div>

      {/* Label chip (optional) */}
      {label && (
        <span className="absolute bottom-4 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}

export default MockupImage;
