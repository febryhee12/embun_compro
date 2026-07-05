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
    <Section id="cta" variant="dark">
      <Container>
        <div className="max-w-2xl text-left">
          <h2 className="font-serif text-[2.5rem] leading-[1.1] text-foreground-on-dark md:text-5xl">
            {heading}
          </h2>
          <p className="mt-6 text-lg leading-[1.7] text-foreground-muted-on-dark">{subcopy}</p>
          <div className="mt-8">
            <CTAButton href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default CallToAction;
