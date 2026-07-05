import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  /** Omitted/undefined for the current page — rendered as plain text, not a link. */
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Breadcrumbs — page-position indicator (Requirement 12.9).
 *
 * Renders a `<nav aria-label="Breadcrumb">` containing an ordered list of
 * links tracing the Visitor's position in the site structure. Every item
 * except the last renders as a `next/link`; the last item represents the
 * current page and is rendered as plain text with `aria-current="page"`
 * (no link, per design). Rendered on every page except the App Landing Page
 * (`/`) — the pages themselves decide when to render this component and
 * what `items` to pass in.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-foreground-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" className="text-foreground-muted">
                  /
                </span>
              ) : null}
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined} className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-sm text-foreground-muted transition-colors hover:text-brand-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--border-focus)] focus-visible:outline-offset-2"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
