import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { CTAButton } from '@/components/sections/CTAButton';

export interface PartnerCtaProps {
  heading: string;
  subcopy: string;
  ctaHref: string; // '#contact'
  ctaLabel: string;
}

const DEFAULT_PROPS: PartnerCtaProps = {
  heading: 'Siap Membawa Campsite Anda ke Lebih Banyak Tamu?',
  subcopy:
    'Jadilah salah satu campsite pertama yang bergabung dengan Embun dan rasakan bagaimana reservasi serta pembayaran terkelola secara otomatis.',
  ctaHref: '#contact',
  ctaLabel: 'Daftarkan Campsite Anda',
};

/**
 * CallToAction (Partner Landing Page) — closing CTA section (Server
 * Component) for `/mitra`, reusing the exact same dark-section CTA pattern
 * as the original single-page `CallToAction.tsx` (Requirement 12.3): a
 * left-aligned headline + short description + CTA button on the Embun
 * Black (`--surface-dark`) background variant, right before the footer.
 *
 * Copy is owner-facing (Campsite Owner), consistent with the rest of the
 * Partner Landing Page — this content originally lived on the single-page
 * site and now belongs here since `/mitra` is the Campsite Owner-focused
 * page.
 *
 * The CTA scrolls to this page's Contact Form section (`#contact`, added
 * back in task 9.5). The click behavior — including the informative error
 * notice shown when navigation fails — is delegated to the existing
 * `CTAButton` (`'use client'`) component, which is generic and reusable
 * across pages, so this component stays a pure Server Component.
 */
export function CallToAction(props: Partial<PartnerCtaProps> = {}) {
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
