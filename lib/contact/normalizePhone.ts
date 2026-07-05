/**
 * Normalize an Indonesian phone number to E.164-ish `+62…` form.
 *
 * Pure function: strips all non-digit characters, resolves the leading
 * country/zero prefix (`+62`/`62`/`0`), then validates the remaining
 * national number against the Indonesian mobile pattern `8[1-9]` followed
 * by 6–11 digits.
 *
 * @see design.md — "Function: normalizePhone" (Low-Level Design)
 */
export function normalizePhone(raw: string): { ok: boolean; value: string } {
  const digits = raw.replace(/\D/g, '');

  let national: string;
  if (digits.startsWith('62')) {
    national = digits.slice(2);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  if (/^8[1-9][0-9]{6,11}$/.test(national)) {
    return { ok: true, value: '+62' + national };
  }

  return { ok: false, value: raw.trim() };
}
