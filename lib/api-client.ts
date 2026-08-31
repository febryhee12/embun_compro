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

// ── Live Backend API Fetchers ────────────────────────────────────────────────

export async function fetchActiveCampsites() {
  const res = await fetch(`${API_BASE_URL}/public/campsites`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Gagal memuat data campsite dari server.');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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
  const res = await fetch(
    `${API_BASE_URL}/public/campsites/resolve-spot?token=${encodeURIComponent(
      token,
    )}`,
    {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    throw new Error('Spot tidak ditemukan.');
  }
  return res.json();
}

export async function guestDevLogin(phone: string, fullName?: string) {
  const res = await fetch(`${API_BASE_URL}/guest/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, fullName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login gagal.');
  }
  const data = await res.json();
  setGuestSession(data.accessToken, data.guest);
  return data;
}

export async function guestSocialLogin(provider: string, idToken: string) {
  const res = await fetch(`${API_BASE_URL}/guest/auth/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, idToken }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Login sosial gagal.');
  }
  const data = await res.json();
  setGuestSession(data.accessToken, data.guest);
  return data;
}
