import { MessageCircle } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/contact/whatsapp';

export interface WhatsAppButtonProps {
  /** E.164 digits without leading '+', e.g. '6281234567890'. */
  phoneNumber: string;
  /** Pre-filled message text encoded into the wa.me link. */
  message?: string;
  /** Visible button label. Defaults to 'Chat via WhatsApp'. */
  label?: string;
  className?: string;
}

/**
 * WhatsAppButton — opens a pre-filled `wa.me` chat link in a new tab.
 *
 * Rendered as an anchor styled to look like a button so it works as a
 * Server Component (no event handlers/hooks needed). lucide-react does not
 * ship a literal WhatsApp brand icon, so `MessageCircle` is used as the
 * closest generic chat icon stand-in.
 *
 * @see design.md — "Contact Form" component interfaces (Requirement 7.14)
 */
export function WhatsAppButton({
  phoneNumber,
  message,
  label = 'Chat via WhatsApp',
  className,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppLink(phoneNumber, message);

  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-md border border-border',
    'bg-transparent px-6 py-3 font-medium text-foreground transition-colors duration-200',
    'hover:border-brand-blue hover:text-brand-blue',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
      <MessageCircle aria-hidden="true" className="h-5 w-5 text-[#25D366]" />
      {label}
    </a>
  );
}

export default WhatsAppButton;
