'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { contactFormSchema } from '@/lib/contact/contactForm.schema';
import { submitContactForm } from '@/lib/contact/submit';
import type { ContactFormInput, SubmitResult } from '@/lib/contact/types';

import { Field } from './Field';

export interface ContactFormProps {
  /** Optional override of the submit transport (testing / storybook). */
  onSubmitOverride?: (data: ContactFormInput) => Promise<SubmitResult>;
}

/**
 * ContactForm — single-step contact form (Requirement 7.1).
 *
 * Wires `react-hook-form` + the zod resolver (`contactFormSchema`) to the
 * shared `Field` UI primitive, and carries the two anti-spam signals defined
 * on `ContactFormInput`:
 *
 * - `honeypot`: a field that should always stay empty. It's visually hidden
 *   off-screen (not `display:none`/`type="hidden"`) so unsophisticated bots
 *   that fill in every visible-looking input still trip it, while real users
 *   never see or interact with it.
 * - `startedAt`: an epoch-ms timestamp captured once, at mount, via
 *   `useForm`'s `defaultValues`. Since this is a Client Component the value
 *   is only ever computed on the client, so there's no SSR/hydration
 *   mismatch risk.
 *
 * On submit, `handleValidSubmit` calls `submitContactForm` (or
 * `onSubmitOverride` when provided, for testing/storybook) and drives two
 * pieces of UI state:
 *
 * - `isSuccess` — once `true`, the form is replaced entirely by a
 *   confirmation screen (Requirement 7.11: no browser `alert()`, a real
 *   replacement of the form display).
 * - `submitError` — the last failed `SubmitResult`. It's rendered as an
 *   inline `role="alert"` + `aria-live="polite"` banner *alongside* the form (the form stays
 *   mounted so the user can retry). Crucially, `handleValidSubmit` never
 *   calls `form.reset()` on failure, so react-hook-form keeps whatever the
 *   user already typed — retrying (clicking "Kirim" again) resubmits the
 *   preserved field values (Requirement 7.12).
 */
export function ContactForm({ onSubmitOverride }: ContactFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<(SubmitResult & { ok: false }) | null>(null);

  // Lazy `useState` initializer: React's purity rules explicitly allow
  // calling impure functions (like `Date.now`) inside a lazy initializer,
  // since it only ever runs once per component instance — unlike calling
  // it directly in the render body or in `useForm`'s `defaultValues`.
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      startedAt,
    },
  });

  async function handleValidSubmit(data: ContactFormInput) {
    setSubmitError(null);

    const result = onSubmitOverride ? await onSubmitOverride(data) : await submitContactForm(data);

    if (result.ok) {
      setIsSuccess(true);
      return;
    }

    // Do NOT reset the form here — react-hook-form retains the entered
    // values as-is, so the "Kirim" button doubles as a retry that resubmits
    // the same (preserved) payload.
    setSubmitError(result);
  }

  if (isSuccess) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full max-w-xl flex-col items-start gap-3 rounded-md bg-surface p-8"
      >
        <h3 className="font-serif text-3xl text-foreground">Terima kasih!</h3>
        <p className="text-foreground-muted">
          Pesan Anda telah terkirim. Kami akan menghubungi Anda segera. Atau hubungi kami di <a href="mailto:support@embun.app" className="text-emerald-600 dark:text-brand-lime no-underline hover:opacity-80 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm">support@embun.app</a>.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit)}
      noValidate
      className="flex w-full max-w-xl flex-col gap-6"
    >
      {submitError ? (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-error bg-error/10 px-4 py-3 text-sm text-error"
        >
          <p>{submitError.message}</p>
          <button
            type="submit"
            className="mt-2 font-medium underline underline-offset-2"
          >
            Coba lagi
          </button>
        </div>
      ) : null}

      <Field
        {...register('name')}
        label="Nama"
        type="text"
        required
        placeholder="Nama lengkap Anda"
        error={errors.name?.message}
      />

      <Field
        {...register('email')}
        label="Email"
        type="email"
        placeholder="nama@email.com"
        error={errors.email?.message}
        hint={errors.email ? undefined : 'Isi salah satu: email atau nomor WhatsApp'}
      />

      <Field
        {...register('phone')}
        label="Nomor WhatsApp"
        type="tel"
        placeholder="08123456789"
        error={errors.phone?.message}
      />

      <Field
        {...register('campsiteName')}
        label="Nama campsite (opsional)"
        type="text"
        placeholder="Contoh: Bukit Bintang Campsite"
        error={errors.campsiteName?.message}
      />

      <Field
        {...register('message')}
        label="Pesan / kebutuhan Anda"
        type="textarea"
        placeholder="Ceritakan kebutuhan Anda..."
        error={errors.message?.message}
      />

      {/* Honeypot — anti-spam trap. Visually hidden via off-screen
          positioning (not display:none/type="hidden") so bots that fill in
          every visible-looking field still trip it. Excluded from tab order
          and hidden from assistive tech for real users. */}
      <div className="sr-only absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="honeypot">Jangan diisi</label>
        <input
          {...register('honeypot')}
          id="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* startedAt — timing signal, not a spam trap. A genuine hidden input
          is fine here since only the elapsed-time check at submit matters.
          `valueAsNumber` converts the DOM's string value back to a number so
          it round-trips correctly through the zod resolver (`startedAt` is
          typed as `number` on `ContactFormInput`). */}
      <input type="hidden" {...register('startedAt', { valueAsNumber: true })} />

      {/* Web3Forms botcheck — must be an unchecked checkbox in the DOM.
          Bots that auto-fill forms tend to tick all checkboxes; Web3Forms
          server-side rejects any submission where this is checked.
          It is completely invisible to real users (sr-only + off-screen). */}
      <input
        type="checkbox"
        name="botcheck"
        className="sr-only absolute -left-[9999px]"
        tabIndex={-1}
        aria-hidden="true"
      />

      <Button type="submit" variant="primary" block loading={isSubmitting}>
        Kirim
      </Button>

      <p className="mt-4 text-center font-serif text-sm italic text-foreground-muted">
        Kami akan menghubungi Anda segera.<br />
        <span className="not-italic font-sans text-xs mt-1 block">Atau hubungi kami di <a href="mailto:support@embun.app" className="text-emerald-600 dark:text-brand-lime no-underline hover:opacity-80 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm">support@embun.app</a></span>
      </p>
    </form>
  );
}

export default ContactForm;
