import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'link';
  /** Fills available width with generous padding-y (CTA style). */
  block?: boolean;
  loading?: boolean;
}

export const BUTTON_BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium ' +
  'transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60';

/**
 * Exported so non-`<button>` elements (e.g. a plain `<a href="#contact">`
 * anchor used for a server-renderable CTA, see `components/sections/Hero.tsx`)
 * can reuse the exact same visual styling without needing 'use client'.
 */
export const BUTTON_VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-blue text-brand-white px-6 py-3 hover:bg-brand-blue-hover',
  ghost:
    'bg-transparent text-brand-blue dark:text-foreground border border-border px-6 py-3 hover:bg-surface',
  link: 'bg-transparent text-brand-blue underline-offset-4 hover:underline',
};

const BASE_CLASS = BUTTON_BASE_CLASS;
const VARIANT_CLASS = BUTTON_VARIANT_CLASS;

/**
 * Button — UI primitive with three visual variants.
 *
 * - `primary`: solid Embun Blue CTA (`--brand-blue`), white text, darkens to
 *   `--brand-blue-hover` on hover (Requirement 7.8).
 * - `ghost`: transparent background with a subtle border, brand-blue text,
 *   soft hover background.
 * - `link`: no background/border, reads as an inline text link that
 *   underlines on hover.
 *
 * `block` fills the available width with generous vertical padding
 * (padding-y ≥ 16px per Requirement 7.8), suitable for CTA buttons like
 * "Kirim". `loading` shows a small spinner and disables the button.
 * Border radius stays within the 4–8px brand range (Requirement 10.2).
 */
export function Button({
  variant = 'primary',
  block = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    BASE_CLASS,
    VARIANT_CLASS[variant],
    block ? 'w-full py-4' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
