'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes, Ref, TextareaHTMLAttributes } from 'react';

/**
 * Native `<input>`/`<textarea>` attributes forwarded onto the underlying
 * element. Combining both attribute sets (minus `type`/`ref`, which this
 * component controls) lets a consumer spread react-hook-form's
 * `register(name)` output directly onto `<Field {...register('email')} />` —
 * `onChange`, `onBlur`, and `name` all flow through via `...rest` below.
 */
type NativeFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>,
  'type' | 'ref'
>;

export interface FieldProps extends NativeFieldProps {
  /** Field name. Also used to derive the input `id` and the error/hint ids. */
  name: string;
  /** Sentence-case label text, connected to the input via `htmlFor`/`id`. */
  label: string;
  /** Input type. `'textarea'` renders a `<textarea>` instead of an `<input>`. */
  type?: 'text' | 'email' | 'tel' | 'textarea';
  /** Field-level error message (from zod/react-hook-form). Rendered below the field. */
  error?: string;
  /** Optional helper microcopy shown below the field when there is no error. */
  hint?: string;
}

const FIELD_CLASS =
  'w-full bg-transparent border-0 border-b px-0 py-2 text-base text-foreground ' +
  'border-b-[var(--border)] outline-none transition-colors duration-[250ms] ' +
  'focus:border-b-[var(--border-focus)] ' +
  'placeholder:text-foreground-placeholder placeholder:font-normal placeholder:not-italic';

/**
 * Field — minimalist contact form input.
 *
 * - Underline-only, 1px border at rest (`--border`), transitioning to Embun
 *   Blue (`--border-focus`) on focus over 250ms (Requirements 7.4, 7.5).
 * - Label rendered at 14px (`text-sm`), sentence case, never uppercase
 *   (Requirement 7.6).
 * - Placeholder rendered in faded gray (`--foreground-placeholder`, `#6b6b6b`
 *   — darkened from the original `#9E9E9E` design spec so it clears the
 *   WCAG 2.1 AA 4.5:1 text contrast minimum against `--surface`/
 *   `--background`; placeholder text isn't strictly required to meet AA
 *   since it's non-essential hint content, but `#9E9E9E` on `#ffffff` sits
 *   at ~1.6:1, which reads as illegible rather than intentionally muted),
 *   no bold/emphasis (Requirement 7.7).
 * - Inline error message rendered below the field with `role="alert"` plus
 *   an explicit `aria-live="polite"` (so screen readers announce the error
 *   without a page reload — Requirement 7.10).
 * - Label connected to the input via matching `htmlFor`/`id`; `aria-invalid`
 *   and `aria-describedby` wired to the error/hint message id so screen
 *   readers announce validation state (Requirements 8.4, 8.5).
 *
 * Forwards `ref` and all other native attributes via `...rest`, so it
 * composes with react-hook-form: `<Field {...register('email')} label="Email" />`.
 */
export const Field = forwardRef<HTMLInputElement | HTMLTextAreaElement, FieldProps>(
  function Field(
    { name, label, type = 'text', error, hint, placeholder, required, className, id, ...rest },
    ref
  ) {
    const fieldId = id ?? name;
    const errorId = `${name}-error`;
    const hintId = `${name}-hint`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    const fieldClassName = [FIELD_CLASS, className ?? ''].filter(Boolean).join(' ');

    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>

        {type === 'textarea' ? (
          <textarea
            ref={ref as Ref<HTMLTextAreaElement>}
            id={fieldId}
            name={name}
            placeholder={placeholder}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${fieldClassName} min-h-[120px] resize-y`}
            {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as Ref<HTMLInputElement>}
            id={fieldId}
            name={name}
            type={type}
            placeholder={placeholder}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={fieldClassName}
            {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error ? (
          <p id={errorId} role="alert" aria-live="polite" className="text-sm text-error">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-sm text-foreground-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Field.displayName = 'Field';

export default Field;
