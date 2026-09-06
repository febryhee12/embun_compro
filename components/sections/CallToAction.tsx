import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { CTAButton } from '@/components/sections/CTAButton';

export interface CallToActionProps {
  heading: string;
  subcopy: string;
  ctaHref: string; // e.g. '#contact'
  ctaLabel: string;
}

const DEFAULT_PROPS: CallToActionProps = {
  heading: 'Siap Membawa Campsite Anda ke Lebih Banyak Tamu?',
  subcopy:
    'Jadilah salah satu campsite pertama yang bergabung dengan Embun dan rasakan bagaimana reservasi serta komisi terkelola secara otomatis.',
  ctaHref: '#contact',
  ctaLabel: 'Daftarkan Campsite Anda',
};

/**
 * CallToAction — CTA Footer section (Server Component).
 *
 * Left-aligned headline + short description + CTA button on the Embun
 * Black (`--surface-dark`) background variant for soft, high-contrast
 * finality right before the footer (Requirement 6.3). Text alignment is
 * explicitly left (`text-left`), and the content block itself is not
 * centered (no `mx-auto`) so it hugs the left edge of the container
 * (Requirement 6.2).
 *
 * The CTA button click behavior — including the informative error notice
 * shown when navigation to the Contact section fails — is delegated to
 * `CTAButton` (`'use client'`) so this component stays a pure Server
 * Component (Requirement 6.6).
 */
export function CallToAction(props: Partial<CallToActionProps> = {}) {
  const { heading, subcopy, ctaHref, ctaLabel } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="cta" variant="none" className="bg-[#FAFEE8] dark:bg-surface py-16 lg:py-24 transition-colors">
      <Container>
        <div className="max-w-2xl text-left">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
            {heading}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-foreground-muted leading-relaxed">{subcopy}</p>
          <div className="mt-8">
            <CTAButton href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default CallToAction;
