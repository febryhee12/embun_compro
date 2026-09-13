import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ExploreClient } from './ExploreClient';

const { fetchCampsites } = vi.hoisted(() => ({ fetchCampsites: vi.fn() }));

vi.mock('@/lib/api-client', () => ({
  fetchActiveCampsites: fetchCampsites,
  fetchCampsiteAggregate: vi
    .fn()
    .mockResolvedValue({ ratingAvg: 0, ratingCount: 0 }),
  getStoredGuestProfile: () => null,
  getGuestToken: () => null,
  fetchGuestWishlist: vi.fn().mockResolvedValue([]),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  resolveAssetUrl: () => '',
  getCampsiteCoverPhoto: () => '',
  rupiah: (value: number) => String(value),
}));
vi.mock('@/components/explore/ExploreHeader', () => ({
  ExploreHeader: ({
    searchQuery,
    onSearchChange,
  }: {
    searchQuery: string;
    onSearchChange: (value: string) => void;
  }) => (
    <input
      aria-label="Search"
      value={searchQuery}
      onChange={(event) => onSearchChange(event.target.value)}
    />
  ),
}));
vi.mock('@/components/explore/ExploreFooter', () => ({
  ExploreFooter: () => null,
}));
vi.mock('@/components/explore/GuestAuthModal', () => ({
  GuestAuthModal: () => null,
}));
vi.mock('@/components/explore/Tour360Modal', () => ({
  Tour360Modal: () => null,
}));
vi.mock('@/components/explore/SpotCard', () => ({
  SpotCard: ({
    spot,
  }: {
    spot: { id: string; name: string; campsite: { id: string } };
  }) => (
    <article data-testid="spot" data-camp={spot.campsite.id} data-id={spot.id}>
      {spot.name}
    </article>
  ),
}));

const block = (id: string, name = id) => ({
  id,
  name,
  status: 'active',
  tentType: 'Glamping',
  facilities: ['WiFi'],
  viewOptions: ['Gunung'],
});
const campsites = () => {
  const blocks = Array.from({ length: 12 }, (_, index) => block(`a${index}`));
  return [
    {
      id: 'a',
      name: 'Camp A',
      city: 'Bandung',
      latitude: -7.5,
      longitude: 107.6,
      blocks,
      maps: [{ markers: blocks.map((spot) => ({ blockId: spot.id })) }],
    },
    {
      id: 'b',
      name: 'Camp B',
      city: 'Bandung',
      latitude: -6.9,
      longitude: 107.6,
      blocks: [{ ...block('b1', 'Pinus'), isEmbunPlus: true }, block('hidden')],
      maps: [{ markers: [{ blockId: 'b1' }] }],
    },
    {
      id: 'c',
      name: 'Camp C',
      city: 'Bogor',
      latitude: null,
      longitude: null,
      blocks: [block('c1', 'Pinus 2')],
      mapMarkers: [{ blockId: 'c1' }],
    },
  ];
};

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
  fetchCampsites.mockResolvedValue(campsites());
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: undefined,
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('balances home previews and excludes unpublished spots without claiming proximity', async () => {
  render(<ExploreClient />);
  const title = await screen.findByRole('heading', { name: 'Jelajahi Spot' });
  const cards = within(title.closest('section')!).getAllByTestId('spot');
  expect(new Set(cards.slice(0, 3).map((card) => card.dataset.camp))).toEqual(
    new Set(['a', 'b', 'c']),
  );
  expect(screen.queryByText('hidden')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('heading', { name: 'Spot Wisata Alam Terdekat' }),
  ).not.toBeInTheDocument();
});

it('searches needs across fields, keeps all matching campsites and ranks exact names first', async () => {
  render(<ExploreClient />);
  await screen.findByRole('heading', { name: 'Jelajahi Spot' });
  fireEvent.change(screen.getByLabelText('Search'), {
    target: { value: 'glamping bandung wifi' },
  });
  const results = screen.getAllByTestId('spot');
  expect(new Set(results.slice(0, 2).map((card) => card.dataset.camp))).toEqual(
    new Set(['a', 'b']),
  );
  expect(results).toHaveLength(13);
  fireEvent.change(screen.getByLabelText('Search'), {
    target: { value: 'Pinus' },
  });
  expect(screen.getAllByTestId('spot').map((card) => card.dataset.id)).toEqual([
    'b1',
    'c1',
  ]);
});

it('places a nearby Plus spot before a distant campsite even in a small catalog', async () => {
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition: (
        success: (position: {
          coords: { latitude: number; longitude: number };
        }) => void,
      ) => success({ coords: { latitude: -6.9, longitude: 107.6 } }),
    },
  });
  render(<ExploreClient />);
  const title = await screen.findByRole('heading', {
    name: 'Spot Wisata Alam Terdekat',
  });
  const cards = within(title.closest('section')!).getAllByTestId('spot');
  expect(cards[0].dataset.id).toBe('b1');
  expect(cards[1].dataset.camp).toBe('a');
});
