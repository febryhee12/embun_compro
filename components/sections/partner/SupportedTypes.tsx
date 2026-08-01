import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';

export interface SupportedTypesProps {
  heading: string;
  subcopy: string;
}

const IMAGES = [
  { id: 'mitra_image1', src: '/images/mitra_image1.png', alt: 'Campsite di pinggir danau dengan pepohonan pinus' },
  { id: 'mitra_image2', src: '/images/mitra_image2.png', alt: 'Tenda safari glamping putih di rumput hijau' },
  { id: 'mitra_image3', src: '/images/mitra_image3.png', alt: 'Dome glamping modern di tengah pegunungan' },
  { id: 'mitra_image4', src: '/images/mitra_image4.png', alt: 'Campervan / mobil dengan tenda atap di hutan' },
  { id: 'mitra_image5', src: '/images/mitra_image5.png', alt: 'Area perkemahan saung di bukit berembun' },
  { id: 'mitra_image6', src: '/images/mitra_image6.png', alt: 'Kabin kayu estetis di antara pepohonan rindang' },
];

export function SupportedTypes({ heading, subcopy }: SupportedTypesProps) {
  return (
    <Section id="supported-types" variant="default" className="py-16 lg:py-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            {/* Title uses Plus Jakarta Sans (font-sans) as requested */}
            <h2 className="font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-[1.2]">
              {heading}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              {subcopy}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 sm:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {IMAGES.map((img, index) => (
              <Reveal key={img.id} delay={index * 100}>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm border border-border/40 group bg-surface">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    quality={90}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default SupportedTypes;
