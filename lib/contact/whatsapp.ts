/**
 * Build a `wa.me` deep link that opens a WhatsApp chat with an optional
 * prefilled message.
 *
 * Pure function: `phoneNumber` is expected to already be a digits-only
 * E.164 string without a leading `+` (e.g. `'6281234567890'`). When
 * `message` is provided, it is always passed through `encodeURIComponent`
 * before being placed in the URL — never string-interpolated raw — so
 * URL-significant characters (`&`, `#`, `?`, `=`, …) can never corrupt or
 * escape the query string.
 *
 * @see design.md — "Function: buildWhatsAppLink" (Low-Level Design)
 */
export function buildWhatsAppLink(phoneNumber: string, message?: string): string {
  const base = `https://wa.me/${phoneNumber}`;

  if (!message || message.trim() === '') {
    return base;
  }

  return `${base}?text=${encodeURIComponent(message)}`;
}
