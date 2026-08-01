'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface HeroImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

/**
 * HeroImage — small Client Component wrapper around `next/image`.
 *
 * Isolated from `Hero.tsx` (a Server Component) solely because the
 * broken-image fallback (Requirement 2.5) needs an `onError` event handler,
 * which requires client-side JS. When the image fails to load or renders
 * corrupted, the `<img>` is hidden immediately and replaced with a
 * `#f4f4f4` placeholder block instead of showing a broken-image icon.
 */
export function HeroImage({ src, alt, width, height, priority, className }: HeroImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{ backgroundColor: '#f4f4f4', width: '100%', height: '100%' }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
      onError={() => setHasError(true)}
    />
  );
}

export default HeroImage;
