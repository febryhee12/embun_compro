import type { PartnerDirectoryItem } from './types';
import { PUBLIC_CAMPSITES_ENDPOINT } from './config';
import { FALLBACK_PARTNERS } from './fallback';

/**
 * Defensively maps a raw backend campsite record (unknown shape) to a
 * `PartnerDirectoryItem`. Returns `null` when the record lacks a usable
 * `id`/`name`, since a partner without a name can't be rendered.
 */
function mapItem(raw: unknown): PartnerDirectoryItem | null {
  if (raw === null || typeof raw !== 'object') return null;

  const rec = raw as Record<string, unknown>;

  const idRaw = rec.id;
  const id =
    typeof idRaw === 'string' ? idRaw : typeof idRaw === 'number' ? String(idRaw) : null;
  if (id === null) return null;

  const name = typeof rec.name === 'string' ? rec.name : null;
  if (name === null || name.length === 0) return null;

  const logoSrcRaw = rec.logoUrl ?? rec.logo ?? rec.logoSrc;
  const logoSrc = typeof logoSrcRaw === 'string' ? logoSrcRaw : undefined;

  const logoAltRaw = rec.logoAlt;
  const logoAlt = typeof logoAltRaw === 'string' && logoAltRaw.length > 0 ? logoAltRaw : name;

  const hrefRaw = rec.slug ?? rec.href;
  const href = typeof hrefRaw === 'string' ? hrefRaw : undefined;

  return {
    id,
    name,
    ...(logoSrc ? { logoSrc } : {}),
    logoAlt,
    ...(href ? { href } : {}),
  };
}

/**
 * Maps a raw JSON body to `PartnerDirectoryItem[]`. Returns `null` when
 * `raw` isn't an array (malformed body) — an empty array from an empty
 * `raw` array is a legitimate success case, not a failure.
 */
function mapToPartnerDirectoryItems(raw: unknown): PartnerDirectoryItem[] | null {
  if (!Array.isArray(raw)) return null;

  const items: PartnerDirectoryItem[] = [];
  for (const entry of raw) {
    const mapped = mapItem(entry);
    if (mapped !== null) items.push(mapped);
  }
  return items;
}

/**
 * Fetches the public campsite directory at build time and maps it to
 * `PartnerDirectoryItem[]`.
 *
 * Never throws — any failure (network error, non-2xx response, unparseable
 * body, or malformed/non-array data) resolves to `FALLBACK_PARTNERS`
 * instead.
 */
export async function fetchPartners(deps?: {
  fetch?: typeof fetch;
  endpoint?: string;
}): Promise<PartnerDirectoryItem[]> {
  const doFetch = deps?.fetch ?? fetch;
  const endpoint = deps?.endpoint ?? PUBLIC_CAMPSITES_ENDPOINT;

  try {
    const res = await doFetch(endpoint);

    if (res.status >= 200 && res.status <= 299) {
      const raw: unknown = await res.json().catch(() => null);
      const items = mapToPartnerDirectoryItems(raw);
      if (items !== null) {
        return items;
      }
    }

    return FALLBACK_PARTNERS;
  } catch {
    return FALLBACK_PARTNERS;
  }
}

export default fetchPartners;
