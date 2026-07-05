/** A single onboarded partner (campsite) rendered in the public Partner Directory. */
export interface PartnerDirectoryItem {
  id: string;
  name: string;
  logoSrc?: string; // may be absent — falls back to initials
  logoAlt: string;
  href?: string; // optional external link to the partner's own page, if any
}
