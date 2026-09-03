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

/** Error carrying the HTTP status so callers can special-case 401 (needs re-auth). */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

export const getGuestUser = getStoredGuestProfile;

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
    // Backend's SocialLoginDto only accepts the uppercase literals
    // 'GOOGLE' | 'APPLE' (@IsIn) - a lowercase value 400s silently.
    body: JSON.stringify({ provider: provider.toUpperCase(), idToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Login sosial gagal.');
  }
  const data = await res.json();
  setGuestSession(data.accessToken, data.guest);
  return data;
}

function guestAuthHeaders(): Record<string, string> {
  const token = getGuestToken();
  if (!token) throw new Error('Anda harus masuk terlebih dahulu.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Checkout the cart as one real Order via `POST /api/orders` (guest-JWT
 * protected). `payload.items[]` must match the backend's `OrderItemDto`
 * shape: `{ blockId, pricingPackageId, checkIn, checkOut, adultCount, addons?:
 * [{addonId, quantity}] }`. Throws on any failure - callers must not silently
 * fall back to a fake order, since that previously masked a 404 (a
 * non-existent `/public/bookings/create` endpoint) as a fake successful
 * booking with no real payment ever created.
 */
export async function createRealOrder(payload: {
  campsiteId: string;
  paymentMethod: 'TRANSFER';
  isDownPayment?: boolean;
  bookingNote?: string;
  promoCode?: string;
  items: Array<{
    blockId: string;
    pricingPackageId: string;
    checkIn: string;
    checkOut: string;
    adultCount: number;
    addons?: Array<{ addonId: string; quantity: number }>;
  }>;
}) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: guestAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Gagal membuat pesanan.', res.status);
  }
  return res.json();
}

/** `POST /api/orders/:id/pay` — returns `{ snapToken, snapRedirectUrl, paymentExpiresAt, ... }`. */
export async function initiateOrderPayment(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pay`, {
    method: 'POST',
    headers: guestAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memulai pembayaran.');
  }
  return res.json();
}

/** `POST /api/orders/:id/pay-settlement` — creates Xendit invoice for DP remaining balance. */
export async function initiateSettlementPayment(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pay-settlement`, {
    method: 'POST',
    headers: guestAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal memulai pelunasan tagihan.');
  }
  return res.json();
}

/** `POST /api/orders/:id/sync-status` — re-checks the Xendit/Midtrans status manually. */
export async function syncOrderStatus(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/sync-status`, {
    method: 'POST',
    headers: guestAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal menyinkronkan status pesanan.');
  }
  return res.json();
}

/** `POST /api/orders/:id/cancel` — batalkan pesanan pending oleh tamu untuk melepas kuncian tanggal. */
export async function cancelGuestOrder(orderId: string, reason?: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: guestAuthHeaders(),
    body: JSON.stringify({ reason: reason || 'Dibatalkan oleh pemesan' }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Gagal membatalkan pesanan.');
  }
  return res.json();
}

/** `GET /api/orders` — the guest's own order history. */
export async function fetchGuestOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: guestAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Gagal memuat riwayat pesanan.', res.status);
  }
  return res.json();
}

/** `GET /api/orders/:id` — single order detail/status (for the payment/detail page). */
export async function fetchGuestOrder(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: guestAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Gagal memuat detail pesanan.', res.status);
  }
  return res.json();
}

/** `GET /api/guest/me` — refetch the authoritative profile (e.g. after a PATCH elsewhere). */
export async function fetchGuestProfile() {
  const res = await fetch(`${API_BASE_URL}/guest/me`, {
    headers: guestAuthHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Gagal memuat profil.', res.status);
  }
  const guest = await res.json();
  const token = getGuestToken();
  if (token) setGuestSession(token, guest);
  return guest;
}

/** `PATCH /api/guest/me` — edit profile (fullName/phone/address/photoKey/etc, all optional). */
export async function updateGuestProfile(payload: {
  fullName?: string;
  phone?: string;
  address?: string;
  photoKey?: string;
  clearPhoto?: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/guest/me`, {
    method: 'PATCH',
    headers: guestAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Gagal menyimpan profil.', res.status);
  }
  const guest = await res.json();
  const token = getGuestToken();
  if (token) setGuestSession(token, guest);
  return guest;
}

/**
 * Buka halaman pembayaran Xendit.
 * Menggunakan direct navigation (window.location.href) agar tidak diblokir oleh popup blocker di Safari/Chrome.
 */
export function initiateXenditPayment(xenditInvoiceUrl: string): void {
  if (typeof window === 'undefined' || !xenditInvoiceUrl) return;
  window.location.href = xenditInvoiceUrl;
}

export interface QuoteAddonItem {
  addonId: string;
  quantity: number;
}

export interface QuotePayload {
  campsiteId: string;
  blockId: string;
  pricingPackageId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adultCount: number;
  addons?: QuoteAddonItem[];
}

/** `POST /api/public/quote` — Authoritative quote calculation from pricing engine. */
export async function fetchPricingQuote(payload: QuotePayload) {
  const res = await fetch(`${API_BASE_URL}/public/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      addons: payload.addons || [],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(err.message || 'Gagal menghitung tarif.', res.status);
  }
  return res.json();
}

