import type { ContactFormInput, SubmitResult } from './types';
import { CONTACT_FORM_ENDPOINT, WEB3FORMS_ACCESS_KEY } from './config';

const NETWORK_MSG = 'Koneksi bermasalah, coba lagi.';
const RATE_MSG = 'Terlalu banyak percobaan. Mohon tunggu sebentar.';
const VALIDATION_MSG = 'Data yang dikirim tidak valid.';
const SERVER_MSG = 'Terjadi kesalahan saat mengirim.';

/**
 * Strips client-only anti-spam signals (`honeypot`, `startedAt`) from the
 * input before sending it to the hosted form service, and shapes the
 * remaining fields into the flat key/value payload Web3Forms expects
 * (`access_key` + a `subject` line, plus the form fields themselves).
 */
function toPayload(input: ContactFormInput): Record<string, string> {
  const { name, email, phone, campsiteName, message } = input;

  return {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Pesan baru dari ${name} — Website Embun`,
    // Web3Forms built-in bot detection: if this field is non-empty the
    // submission is silently rejected server-side as spam.
    botcheck: '',
    name,
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(campsiteName ? { campsiteName } : {}),
    ...(message ? { message } : {}),
  };
}

/**
 * Submits a validated contact form to the hosted form service.
 *
 * Never throws — all outcomes (success, HTTP error, or network failure)
 * resolve to a `SubmitResult`.
 */
export async function submitContactForm(
  input: ContactFormInput,
  deps?: { fetch?: typeof fetch; now?: () => number },
): Promise<SubmitResult> {
  const doFetch = deps?.fetch ?? fetch;

  try {
    const res = await doFetch(CONTACT_FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(toPayload(input)),
    });

    if (res.status === 429) {
      return { ok: false, kind: 'rate_limited', message: RATE_MSG };
    }
    if (res.status === 400 || res.status === 422) {
      return { ok: false, kind: 'validation', message: VALIDATION_MSG };
    }
    if (res.status < 200 || res.status > 299) {
      return { ok: false, kind: 'server', message: SERVER_MSG };
    }

    // Web3Forms responds 200 even on failure (e.g. invalid/missing access
    // key), signaling the real outcome via `{ success: boolean }` in the
    // JSON body rather than the HTTP status — so a 2xx status alone isn't
    // sufficient confirmation here.
    const data: unknown = await res.json().catch(() => null);
    const success =
      data !== null && typeof data === 'object' && (data as { success?: unknown }).success === true;

    return success ? { ok: true } : { ok: false, kind: 'server', message: SERVER_MSG };
  } catch {
    return { ok: false, kind: 'network', message: NETWORK_MSG };
  }
}
