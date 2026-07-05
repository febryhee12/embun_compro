'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { PartnerDirectoryItem } from '@/lib/partners/types';

export interface PartnerCardProps {
  item: PartnerDirectoryItem;
}

/**
 * Derives up to two-letter initials from a partner name, e.g.
 * "Embun Camp" -> "EC", "Sawarna" -> "S".
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = words[0]?.[0] ?? '';
  const second = words[1]?.[0] ?? '';
  return `${first}${second}`.toUpperCase();
}

/**
 * PartnerCard — small Client Component wrapper for a single Partner
 * Directory entry (logo/photo + name).
 *
 * Isolated as a Client Component solely because the broken-image fallback
 * (Requirement 6.6) needs an `onError` event handler. When `item.logoSrc` is
 * absent, or the image fails to load, the broken `<img>` is hidden
 * immediately and replaced with a placeholder: the partner's initials over a
 * `#e8e6e0` background, so a broken-image icon never becomes visible to the
 * Visitor.
 */
export default function PartnerCard({ item }: PartnerCardProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(item.logoSrc) && !hasError;

  const card = (
    <div className="flex h-full flex-col items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-6 text-center transition-shadow hover:shadow-[var(--shadow-soft)]">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {showImage ? (
          <Image
            src={item.logoSrc as string}
            alt={item.logoAlt}
            fill
            sizes="80px"
            style={{ objectFit: 'contain' }}
            loading="lazy"
            onError={() => setHasError(true)}
          />
        ) : (
          <div
            role="img"
            aria-label={item.logoAlt}
            className="flex h-full w-full items-center justify-center rounded-sm font-sans text-lg font-semibold"
            style={{ backgroundColor: '#e8e6e0', color: 'var(--foreground)' }}
          >
            {getInitials(item.name)}
          </div>
        )}
      </div>
      <span className="text-sm font-medium text-[var(--foreground)]">{item.name}</span>
    </div>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {card}
      </a>
    );
  }

  return card;
}
