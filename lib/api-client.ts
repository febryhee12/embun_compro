'use client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.embun.app/api';

export function resolveAssetUrl(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const host = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${host}${cleanPath}`;
}

export const rupiah = (val?: number | string | null) => {
  if (val == null || val === '') return 'Rp0';
  const n = Number(val);
  if (isNaN(n)) return 'Rp0';
  return `Rp ${n.toLocaleString('id-ID')}`;
};

// ── Auth Token Storage ────────────────────────────────────────────────────────
const GUEST_TOKEN_KEY = 'embun_guest_access_token';
const GUEST_USER_KEY = 'embun_guest_profile';

export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestSession(token: string, user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_TOKEN_KEY, token);
  localStorage.setItem(GUEST_USER_KEY, JSON.stringify(user));
}

export function clearGuestSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_TOKEN_KEY);
  localStorage.removeItem(GUEST_USER_KEY);
}

export function getStoredGuestProfile(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(GUEST_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Fallback Dataset (Graceful Resilience) ──────────────────────────────────
const FALLBACK_CAMPSITES = [
  {
    id: 'bd81ab6d-3e0c-4ee8-9726-35ba36932884',
    name: 'Embun Riverside Camp',
    slug: 'embun-riverside-camp',
    address: 'Jl. Raya Puncak KM 84, Cisarua, Bogor',
    rating: 4.9,
    reviewCount: 42,
    facilities: [
      { id: '1', name: 'Musholla' },
      { id: '2', name: 'Toilet Bersih & Air Hangat' },
      { id: '3', name: 'Cafe & Resto' },
      { id: '4', name: 'Area Api Unggun' },
      { id: '5', name: 'Parkir Luas' },
    ],
    photos: [
      {
        id: 'p1',
        url: 'https://media-staging.embun.app/campsites/bd81ab6d-3e0c-4ee8-9726-35ba36932884/fab2275b-3d0b-46a9-b79d-377ef99ff57c.jpg',
        category: 'Tampak Luar / Pemandangan',
      },
    ],
    blocks: [
      {
        id: '64d11f9b-56fe-409c-b630-dab741534027',
        shareCode: '66f42028',
        name: 'Mahameru B5 (Glamping VIP)',
        blockNumber: 'B5',
        tentType: 'Glamping',
        roomSize: '5x7 meter',
        bedType: 'Kasur King & Selimut Hangat',
        baseCapacity: 2,
        maxCapacity: 6,
        weekdayPrice: 200000,
        weekendPrice: 230000,
        holidayPrice: 250000,
        extraPersonFee: 25000,
        status: 'active',
        isEmbunPlus: true,
        viewOptions: ['Pinggir Sungai', 'Pemandangan Bukit'],
        facilities: ['Colokan Listrik', 'Kamar Mandi', 'Wifi', 'Air Hangat'],
        photos: [
          {
            url: 'https://media-staging.embun.app/campsites/bd81ab6d-3e0c-4ee8-9726-35ba36932884/3d17849d-0d53-465c-a32e-01fccb78a75c.png',
            category: 'Kamar Utama / Tenda',
          },
          {
            url: 'https://media-staging.embun.app/campsites/bd81ab6d-3e0c-4ee8-9726-35ba36932884/05d557bb-73b8-442b-bcd3-fb0441389dd4.png',
            category: 'Kamar Mandi / Toilet',
          },
        ],
        panoramaPhotos: [
          {
            id: 'pano1',
            label: 'Interior Glamping 360°',
            imageUrl:
              'https://media-staging.embun.app/campsites/bd81ab6d-3e0c-4ee8-9726-35ba36932884/3d17849d-0d53-465c-a32e-01fccb78a75c.png',
          },
        ],
        pricingPackages: [
          {
            name: 'Paket Standar Glamping',
            flatRateMode: true,
            flatRate: 200000,
            maxOccupancy: 6,
          },
          {
            name: 'Paket Special + Sarapan',
            flatRateMode: false,
            weekdayRate: 250000,
            weekendRate: 280000,
            maxOccupancy: 6,
          },
        ],
      },
      {
        id: '36a7c685-93c6-4f4c-841b-3621b65c5a1b',
        shareCode: '55d3f60a',
        name: 'Dona M1 (Campervan Lot)',
        blockNumber: 'M1',
        tentType: 'Campervan',
        roomSize: '6x8 meter',
        bedType: 'Bawa Sendiri / Di Mobil',
        baseCapacity: 2,
        maxCapacity: 8,
        weekdayPrice: 150000,
        weekendPrice: 180000,
        holidayPrice: 200000,
        extraPersonFee: 20000,
        status: 'active',
        isEmbunPlus: false,
        viewOptions: ['Nuansa Hutan Pinus'],
        facilities: ['Colokan Listrik', 'Parkir Samping Tenda', 'Air Bersih'],
        photos: [
          {
            url: 'https://media-staging.embun.app/campsites/bd81ab6d-3e0c-4ee8-9726-35ba36932884/fab2275b-3d0b-46a9-b79d-377ef99ff57c.jpg',
            category: 'Kamar Utama / Tenda',
          },
        ],
        pricingPackages: [
          {
            name: 'Kavling Campervan',
            flatRateMode: true,
            flatRate: 150000,
            maxOccupancy: 8,
          },
        ],
      },
    ],
  },
];

// ── API Fetchers ─────────────────────────────────────────────────────────────

export async function fetchActiveCampsites() {
  try {
    const res = await fetch(`${API_BASE_URL}/public/campsites`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend API fetch warning, fallback to cached data:', err);
  }
  return FALLBACK_CAMPSITES;
}

export async function fetchPopularSpots() {
  try {
    const res = await fetch(`${API_BASE_URL}/public/campsites/popular-spots`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) return res.json();
  } catch {}
  return [];
}

export async function resolveSpotToken(token: string) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/public/campsites/resolve-spot?token=${encodeURIComponent(
        token,
      )}`,
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (res.ok) return res.json();
  } catch {}

  // Fallback match
  const camp = FALLBACK_CAMPSITES[0];
  const matched =
    camp.blocks.find((b) => b.shareCode === token || b.id === token) ||
    camp.blocks[0];
  return { campsite: camp, blockId: matched.id };
}

export async function guestDevLogin(phone: string, fullName?: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/guest/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, fullName }),
    });
    if (res.ok) {
      const data = await res.json();
      setGuestSession(data.accessToken, data.guest);
      return data;
    }
  } catch {}

  // Local fallback session
  const fallbackUser = {
    id: `guest_${Date.now()}`,
    fullName: fullName || 'Tamu Embun',
    phone: phone,
  };
  setGuestSession(`token_${Date.now()}`, fallbackUser);
  return { accessToken: `token_${Date.now()}`, guest: fallbackUser };
}
