import { getDistance } from 'geolib';

export function orderDiscovery<T>(
  items: readonly T[],
  idOf: (item: T) => string,
  campsiteIdOf: (item: T) => string,
  now = new Date(),
  salt = 0,
): T[] {
  const day = Math.floor(now.getTime() / 86400000);
  const groups = new Map<string, T[]>();
  const seen = new Set<string>();
  for (const item of items) {
    const id = idOf(item);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const key = campsiteIdOf(item) || id;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  const rotate = <Value>(values: Value[]): Value[] => {
    if (!values.length) return values;
    const offset =
      (((day + salt) % values.length) + values.length) % values.length;
    return [...values.slice(offset), ...values.slice(0, offset)];
  };
  const keys = rotate([...groups.keys()].sort());
  for (const key of keys) {
    const group = groups.get(key)!;
    group.sort((first, second) =>
      idOf(first) < idOf(second) ? -1 : idOf(first) > idOf(second) ? 1 : 0,
    );
    groups.set(key, rotate(group));
  }
  const result: T[] = [];
  for (let round = 0; result.length < seen.size; round++) {
    for (const key of keys) {
      const group = groups.get(key)!;
      if (round < group.length) result.push(group[round]);
    }
  }
  return result;
}

export function matchesSpotSearch(
  spot: Record<string, unknown>,
  campsite: Record<string, unknown>,
  query: string,
): boolean {
  if (!query.trim()) return true;
  const values: string[] = [];
  const collect = (value: unknown) => {
    if (typeof value === 'string') values.push(value.toLowerCase());
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      collect(record.name);
      collect(record.label);
      collect(record.facility);
    }
  };
  [
    'name',
    'blockNumber',
    'tentType',
    'category',
    'bedType',
    'facilities',
    'viewOptions',
    'view_options',
  ].forEach((field) => collect(spot[field]));
  ['name', 'address', 'city', 'province', 'facilities'].forEach((field) =>
    collect(campsite[field]),
  );
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .every((term) => values.some((value) => value.includes(term)));
}

export function spotSearchRelevance(
  spotName: string,
  campsiteName: string,
  query: string,
): number {
  const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
  if (!normalized) return 0;
  const names = [spotName, campsiteName].map((name) =>
    name.toLowerCase().trim().replace(/\s+/g, ' '),
  );
  if (names.includes(normalized)) return 2;
  return names.some((name) => name.startsWith(normalized)) ? 1 : 0;
}

export function publishedBlockIds(
  campsite: Record<string, unknown>,
): Set<string> {
  const ids = new Set<string>();
  const collect = (markers: unknown) => {
    if (!Array.isArray(markers)) return;
    for (const marker of markers) {
      if (marker?.blockId) ids.add(String(marker.blockId));
    }
  };
  if (Array.isArray(campsite.maps) && campsite.maps.length) {
    campsite.maps.forEach((area) => collect(area?.markers));
  } else collect(campsite.mapMarkers);
  return ids;
}

export type DiscoveryLocation = { latitude: number; longitude: number };

export function campsiteDistance(
  campsite: { latitude?: unknown; longitude?: unknown },
  origin: DiscoveryLocation | null,
): number | null {
  if (!origin) return null;
  const coordinate = (value: unknown, max: number) => {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) && Math.abs(parsed) <= max ? parsed : null;
  };
  const latitude = coordinate(campsite.latitude, 90);
  const longitude = coordinate(campsite.longitude, 180);
  if (latitude === null || longitude === null) return null;
  return getDistance(origin, { latitude, longitude });
}
