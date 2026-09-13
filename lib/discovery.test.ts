import { describe, expect, it } from 'vitest';
import {
  campsiteDistance,
  matchesSpotSearch,
  orderDiscovery,
  publishedBlockIds,
  spotSearchRelevance,
} from './discovery';

describe('discovery ordering', () => {
  const items = ['a1', 'a2', 'a3', 'b1', 'c1'];
  const order = (input: string[], day = 13) =>
    orderDiscovery(
      input,
      (item) => item,
      (item) => item[0],
      new Date(Date.UTC(2026, 8, day)),
    );

  it('gives each campsite a turn before another spot from the same campsite', () => {
    const result = order(items);
    expect(new Set(result.slice(0, 3).map((item) => item[0]))).toEqual(
      new Set(['a', 'b', 'c']),
    );
    expect(new Set(result)).toEqual(new Set(items));
    expect(result).toHaveLength(items.length);
  });

  it('is independent of API order and rotates campsites and spots daily', () => {
    expect(order(items)).toEqual(order([...items].reverse()));
    expect(new Set([13, 14, 15].map((day) => order(items, day)[0][0]))).toEqual(
      new Set(['a', 'b', 'c']),
    );
    expect(
      new Set(
        [13, 14, 15].map((day) =>
          order(items, day).find((item) => item.startsWith('a')),
        ),
      ),
    ).toEqual(new Set(['a1', 'a2', 'a3']));
  });

  it('handles duplicates, no candidates and a filtered subset', () => {
    expect(order([])).toEqual([]);
    expect(order(['a1', 'a1'])).toEqual(['a1']);
    expect(order(['b1'])).toEqual(['b1']);
  });
});

describe('guest intent', () => {
  const spot = {
    name: 'Pinus 1',
    tentType: 'Glamping',
    facilities: ['Toilet pribadi', { name: 'WiFi' }],
    viewOptions: ['Gunung'],
  };
  const camp = { name: 'Embun', city: 'Bandung' };
  it('matches all terms across name, location, facilities and view', () => {
    expect(matchesSpotSearch(spot, camp, ' glamping  BANDUNG wifi ')).toBe(
      true,
    );
    expect(matchesSpotSearch(spot, camp, 'gunung toilet')).toBe(true);
    expect(matchesSpotSearch(spot, camp, 'glamping kolam')).toBe(false);
    expect(matchesSpotSearch({}, {}, 'wifi')).toBe(false);
    expect(matchesSpotSearch({}, {}, '')).toBe(true);
  });
  it('prioritizes exact names over partial names', () => {
    expect(spotSearchRelevance('Pinus', 'Embun', 'pinus')).toBe(2);
    expect(spotSearchRelevance('Pinus 1', 'Embun', 'pinus')).toBe(1);
    expect(spotSearchRelevance('Bukit Pinus', 'Embun', 'pinus')).toBe(0);
  });
});

it('uses all published map areas and falls back to legacy markers', () => {
  expect(
    publishedBlockIds({
      maps: [{ markers: [{ blockId: 'a' }] }, { markers: [{ blockId: 'b' }] }],
    }),
  ).toEqual(new Set(['a', 'b']));
  expect(publishedBlockIds({ mapMarkers: [{ blockId: 'a' }] })).toEqual(
    new Set(['a']),
  );
  expect(publishedBlockIds({ blocks: [{ id: 'hidden' }] })).toEqual(new Set());
});

it('computes real distance and does not treat missing coordinates as zero', () => {
  const origin = { latitude: -6.9, longitude: 107.6 };
  expect(campsiteDistance(origin, origin)).toBe(0);
  expect(
    campsiteDistance({ latitude: '-6.91', longitude: '107.6' }, origin),
  ).toBeGreaterThan(1000);
  expect(
    campsiteDistance({ latitude: null, longitude: '' }, origin),
  ).toBeNull();
  expect(campsiteDistance({ latitude: 91, longitude: 0 }, origin)).toBeNull();
  expect(campsiteDistance(origin, null)).toBeNull();
});
