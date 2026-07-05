/** Client → hosted form service submission payload (validated by zod, see schema). */
export interface ContactFormInput {
  name: string; // 2–80 chars
  email?: string; // RFC-ish email — required if phone is empty
  phone?: string; // Indonesian phone, normalized to +62… — required if email is empty
  campsiteName?: string; // optional, 2–120 chars, e.g. 'Bukit Bintang Campsite'
  message?: string; // optional, ≤ 1000 chars

  // Anti-spam (not shown to humans)
  honeypot?: string; // must be empty
  startedAt: number; // epoch ms when form was rendered (timing check)
}

/** Result returned to the UI after a submit attempt. */
export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: 'validation' | 'rate_limited' | 'network' | 'server'; message: string };
