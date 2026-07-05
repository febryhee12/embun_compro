/**
 * LegalDisclaimer — Server Component (Requirements 8.6, 9.6, 10.6, 11.7).
 *
 * Fixed-text notice banner rendered on every Legal Page (Privacy Policy,
 * ToS, Refund Policy, Kebijakan Kemitraan), directly under the
 * `LastUpdated` line, alongside `LegalLayout` (not nested inside it, since
 * the two are composed independently by each page).
 *
 * The text is intentionally NOT a prop — it's a fixed compliance notice
 * that every Legal Page must show verbatim until legal counsel reviews the
 * draft content, so there's no legitimate reason for a caller to override
 * or omit it.
 *
 * Styling uses a neutral notice tone (`--surface` fill + `--border`
 * outline) rather than `--error`, since this isn't an error state — just a
 * draft-content notice. Text uses `--foreground` (not muted) so the notice
 * reads as slightly emphasized against the surrounding body copy.
 */
export function LegalDisclaimer({ lang = 'id' }: { lang?: string }) {
  return (
    <div
      role="note"
      className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground"
    >
      <p>
        {lang === 'en' 
          ? 'The content on this page is an initial draft and should be reviewed by legal counsel before final production publication.' 
          : 'Konten pada halaman ini merupakan draf awal dan disarankan untuk ditinjau oleh penasihat hukum sebelum publikasi produksi final.'}
      </p>
    </div>
  );
}

export default LegalDisclaimer;
