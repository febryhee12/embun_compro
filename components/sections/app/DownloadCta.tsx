import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { DownloadCtaButton } from '@/components/sections/app/DownloadCtaButton';

export interface DownloadCtaProps {
  heading: string;
  subcopy: string;
  appStoreHref: string;
  googlePlayHref: string;
  appStoreLead?: string;
  googlePlayLead?: string;
}

const DEFAULT_PROPS: DownloadCtaProps = {
  heading: 'Unduh Embun App Sekarang',
  subcopy:
    'Temukan dan pesan campsite favoritmu langsung dari genggaman. Tersedia gratis di App Store dan Google Play.',
  appStoreHref: '',
  googlePlayHref: 'https://play.google.com/store/apps/details?id=com.embun.app',
  appStoreLead: 'Segera Hadir',
  googlePlayLead: 'Dapatkan di',
};

/**
 * DownloadCta — App Landing Page closing CTA section (Server Component).
 *
 * Reuses the same dark-section CTA pattern as `CallToAction.tsx`: left-aligned
 * headline + short description on the Embun Black (`--surface-dark`)
 * background variant (Requirement 4.2), with `max-w-2xl text-left` and no
 * `mx-auto` centering (Requirement 4.3).
 *
 * Renders two download CTAs (App Store, Google Play) that open the
 * respective official store link in a new tab (Requirement 4.4). Each
 * button's click behavior — including the informative error notice shown
 * when the link fails to resolve — is delegated to `DownloadCtaButton`
 * (`'use client'`) so this component stays a pure Server Component, mirroring
 * how `CallToAction` delegates to `CTAButton`.
 */
export function DownloadCta(props: Partial<DownloadCtaProps> = {}) {
  const { heading, subcopy, appStoreHref, googlePlayHref, appStoreLead, googlePlayLead } = {
    ...DEFAULT_PROPS,
    ...props,
  };

  return (
    <Section id="download" variant="none" className="bg-[#FAFEE8] dark:bg-surface py-16 lg:py-24 transition-colors">
      <Container>
        <div className="max-w-2xl text-left">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
            {heading}
          </h2>
          <p className="mt-6 text-base sm:text-lg text-foreground-muted leading-relaxed">{subcopy}</p>
          <div className="mt-8 flex flex-wrap gap-3 items-center">
            <DownloadCtaButton href={appStoreHref} store="apple" lead={appStoreLead} />
            <DownloadCtaButton href={googlePlayHref} store="google" lead={googlePlayLead} />
          </div>


        </div>
      </Container>
    </Section>
  );
}

export default DownloadCta;
