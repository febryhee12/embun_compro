export interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Server Component that emits a JSON-LD `<script>` tag for structured data.
 *
 * JSON-LD content must be raw JSON text inside the script tag, not JSX
 * children (which would be escaped/quoted incorrectly), so
 * `dangerouslySetInnerHTML` is required here.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
