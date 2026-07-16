import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';

export interface SupportedType {
  id: string;
  label: string;
}

export interface SupportedTypesProps {
  heading: string;
  subcopy: string;
  types: SupportedType[];
}

export function SupportedTypes({ heading, subcopy, types }: SupportedTypesProps) {
  // Map the IDs to their corresponding image paths
  const getImageSrc = (id: string) => `/images/types/${id}.jpg`;

  return (
    <Section id="supported-types" variant="muted">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl leading-[1.15] text-brand-black md:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-[1.7] text-foreground-muted">
              {subcopy}
            </p>
          </div>
        </Reveal>

        <RevealGroup className="mt-12">
          {/* Mobile: Horizontal scroll snapping, Desktop: CSS Grid */}
          <div className="flex w-full snap-x snap-mandatory overflow-x-auto pb-8 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-x-visible md:pb-0 hide-scrollbar space-x-4 md:space-x-0 px-4 md:px-0 -mx-4 md:mx-0">
            {types.map((type, index) => (
              <div
                key={type.id}
                className="relative flex-none w-[70vw] md:w-auto aspect-[3/4] snap-center overflow-hidden rounded-xl shadow-soft group"
              >
                <Image
                  src={getImageSrc(type.id)}
                  alt={type.label}
                  fill
                  sizes="(max-width: 768px) 70vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  quality={90}
                />
                
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
                
                {/* Text Label */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-2xl text-brand-white drop-shadow-sm">
                    {type.label}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </RevealGroup>
      </Container>

      {/* Hide scrollbar styles inline for simplicity */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </Section>
  );
}

export default SupportedTypes;
