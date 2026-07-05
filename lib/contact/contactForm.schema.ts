import { z } from 'zod';

import type { ContactFormInput } from './types';

const INDONESIAN_PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

/**
 * Treats an empty (or whitespace-only) string the same as `undefined`. HTML
 * forms commonly submit `''` for an untouched optional field, and this keeps
 * the "at least one of email/phone" refinement — and every other constraint
 * downstream — correct regardless of whether the caller passes `''` or omits
 * the field entirely.
 *
 * Deliberately does *not* apply the field's real constraints (trim/min/max/
 * regex) — those live in the schema piped after this transform runs, so that
 * a blank/whitespace-only value is normalized to `undefined` *before* any
 * length/format check would otherwise reject it (e.g. the honeypot's
 * `max(0)`: `'   '` must become `undefined`, not fail a length check first).
 */
function blankToUndefined(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return value.trim() === '' ? undefined : value;
}

/**
 * An optional string field: normalizes blank input to `undefined` first,
 * then hands whatever is left (or `undefined`) to `constraints`, which owns
 * trimming and all real validation (min/max/regex/etc).
 *
 * Built from `z.string().optional().transform(...)` rather than
 * `z.preprocess(...)`: in zod v4, `z.preprocess`'s inferred *input* type is
 * always `unknown` (it isn't derived from the callback's parameter type),
 * which widens the whole schema's input type away from `ContactFormInput`
 * and forces a resolver type cast in `ContactForm.tsx`. This chain keeps the
 * input type as `string | undefined` at every step, so the schema's
 * inferred input stays assignable to `ContactFormInput` with no cast needed.
 * Runtime behavior (blank ↔ undefined normalization, applied before
 * constraints) is identical to the original `preprocess`-based schema.
 */
function optionalStringField<T extends z.ZodType<string | undefined, string | undefined>>(
  constraints: T,
) {
  return z.string().optional().transform(blankToUndefined).pipe(constraints);
}

/** Zod schema for the Contact Form payload — see design.md "Validation Rules". */
export const contactFormSchema = z
  .object({
    name: z.string().trim()
      .min(2, { message: 'Nama minimal 2 karakter.' })
      .max(80, { message: 'Nama maksimal 80 karakter.' }),

    email: optionalStringField(
      z.string().trim().toLowerCase()
        .max(120, { message: 'Email terlalu panjang.' })
        .pipe(z.email({ message: 'Format email tidak valid.' }))
        .optional(),
    ),

    phone: optionalStringField(
      z.string().trim()
        .regex(INDONESIAN_PHONE_REGEX, { message: 'Nomor WhatsApp tidak valid. Gunakan format: 08xxx, 628xxx, atau +628xxx.' })
        .optional(),
    ),

    campsiteName: optionalStringField(
      z.string().trim()
        .min(2, { message: 'Nama campsite minimal 2 karakter.' })
        .max(120, { message: 'Nama campsite maksimal 120 karakter.' })
        .optional(),
    ),

    message: optionalStringField(
      z.string().trim()
        .max(1000, { message: 'Pesan maksimal 1000 karakter.' })
        .optional(),
    ),

    // Anti-spam: must be empty if present; otherwise the submission is
    // silently dropped client-side (never sent), not surfaced as a form error.
    honeypot: optionalStringField(z.string().max(0).optional()),

    startedAt: z.number(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Harap isi email atau nomor WhatsApp',
    path: ['email'],
  });

/** Inferred type from the schema — the canonical shape lives in `./types.ts`. */
export type ContactFormSchemaOutput = z.infer<typeof contactFormSchema>;

// Compile-time sanity check: the schema output must stay assignable to the
// canonical `ContactFormInput` contract defined in `./types.ts`.
type _AssertAssignable = ContactFormSchemaOutput extends ContactFormInput ? true : never;
const _typeCheck: _AssertAssignable = true;
void _typeCheck;
