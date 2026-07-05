import type { PartnerDirectoryItem } from './types';

/**
 * Statically bundled fallback partner list, used only when the build-time
 * fetch to the public campsites endpoint fails (network error, non-2xx
 * response, or malformed body). May be an empty array if no curated
 * fallback data exists yet — in that case the Partner Directory renders
 * `PartnerDirectoryEmptyState` instead of an empty grid.
 */
export const FALLBACK_PARTNERS: PartnerDirectoryItem[] = [];
