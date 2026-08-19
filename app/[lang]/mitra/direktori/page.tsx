import type { Metadata } from 'next';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { buildBreadcrumbJsonLd } from '@/lib/seo/structuredData';

export const dynamic = 'force-static';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return buildPageMetadata(
    {
      path: '/mitra/direktori',
      title: lang === 'en' ? 'Our Embun Partners' : 'Embun Mitra kami',
      description: lang === 'en'
        ? 'Partner directory coming soon. Be one of the first campsites to join Embun.'
        : 'Direktori mitra akan segera hadir. Jadilah salah satu campsite pertama yang bergabung dengan Embun.',
    },
    lang
  );
}

export default async function DirektoriPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const breadcrumbItems = [
    { label: lang === 'en' ? 'Home' : 'Beranda', href: `/${lang}` },
    { label: lang === 'en' ? 'Partner' : 'Mitra', href: `/${lang}/mitra` },
    { label: lang === 'en' ? 'Our Partners' : 'Mitra kami' },
  ];

  const title = lang === 'en' ? 'Our Partners' : 'Mitra kami';
  const subcopy =
    lang === 'en'
      ? 'Partner directory coming soon. Be one of the first campsites to join Embun.'
      : 'Direktori mitra akan segera hadir. Jadilah salah satu campsite pertama yang bergabung dengan Embun.';

  return (
    <>
      <JsonLd data={buildBreadcrumbJsonLd(breadcrumbItems)} />
      <SiteHeader />
      <main>
        <Section
          variant="default"
          compactTop
          className="py-12 sm:py-16 lg:py-20"
        >
          <Container>
            <Reveal>
              <div className="mx-auto max-w-2xl text-center py-6 sm:py-10">
                <h1 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
                  {title}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed font-sans">
                  {subcopy}
                </p>

                <div className="mt-8">
                  <a
                    href={`/${lang}/mitra/#contact`}
                    className="inline-flex items-center justify-center rounded-xl bg-[#cbfd00] hover:bg-[#b8e600] text-[#0841b5] font-semibold px-8 py-3.5 text-sm transition-all duration-200 shadow-sm active:scale-95 font-sans"
                  >
                    {lang === 'en'
                      ? 'Join as Partner'
                      : 'Daftarkan Campsite Anda'}
                  </a>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
