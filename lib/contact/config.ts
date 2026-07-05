/**
 * Web3Forms has a single fixed submission endpoint for every account — the
 * per-site "access key" (below) is what routes a submission to the right
 * inbox, not the URL itself.
 */
export const CONTACT_FORM_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Web3Forms public access key. This is meant to be exposed client-side (the
 * form POSTs directly from the browser) — it is not a secret, it just
 * identifies which Web3Forms account/inbox receives the submission. Web3Forms
 * also supports restricting which domains may use a given key from their
 * dashboard, which is the actual security boundary, not key secrecy.
 */
export const WEB3FORMS_ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '';

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890'; // E.164 digits, no '+'
