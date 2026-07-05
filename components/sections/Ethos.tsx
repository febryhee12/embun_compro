import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';

export interface EthosProps {
  title: string;
  body: string;
  detailImageSrc: string;
  detailImageAlt: string;
}

const DEFAULT_PROPS: EthosProps = {
  title: 'Filosofi Kami',
  body:
    'Embun lahir dari satu keyakinan sederhana: alam dan teknologi tidak harus ' +
    'saling berebut tempat. Setiap campsite punya karakter dan cerita yang unik, ' +
    'dan tugas kami adalah menjaga agar hal itu tetap terasa autentik — bukan ' +
    'menggantinya dengan sistem yang kaku dan dingin. ' +
    'Karena itu kami menghubungkan tamu dengan pemilik campsite, lalu mengurus ' +
    'operasionalnya: reservasi tercatat rapi, komisi terhitung otomatis, dan ' +
    'setiap blok atau spot terkelola dengan jelas. Sementara itu, pemilik ' +
    'campsite bisa kembali fokus pada apa yang paling penting — menyambut tamu ' +
    'dan merawat alam, sementara tamu bebas menikmati pengalaman yang membekas, ' +
    'tanpa perlu memikirkan kerumitan di baliknya.',
  detailImageSrc: '/images/ethos-detail.jpg',
  detailImageAlt:
    'Detail tekstur kanvas tenda dengan cahaya pagi menyaring melalui dedaunan di area campsite',
};

/**
 * Ethos — "The Embun Ethos" editorial section (Server Component).
 *
 * Presents Embun's mission as a long-form paragraph (body font-size ≥ 20px,
 * line-height ≥ 1.7 — Requirements 3.1, 3.4) paired with a muted/earthy detail
 * photo of nature/tech. On desktop the text and photo sit side by side; on
 * mobile they stack vertically with the text above the photo and no fixed
 * height constraints, so nothing gets clipped (Requirements 3.2, 3.3, 3.5).
 */
export default function Ethos({
  title = DEFAULT_PROPS.title,
  body = DEFAULT_PROPS.body,
  detailImageSrc = DEFAULT_PROPS.detailImageSrc,
  detailImageAlt = DEFAULT_PROPS.detailImageAlt,
}: Partial<EthosProps> = DEFAULT_PROPS) {
  return (
    <Section id="ethos" variant="muted">
      <Container>
        <div className="grid grid-cols-1 gap-10 overflow-visible md:grid-cols-2 md:items-center md:gap-12">
          <Reveal className="min-w-0">
            <h2 className="font-serif text-[2.5rem] leading-[1.1] text-foreground md:text-5xl mb-6">
              {title}
            </h2>
            <p className="font-sans text-xl leading-[1.7] text-foreground-muted whitespace-normal break-words">
              {body}
            </p>
          </Reveal>
          <Reveal
            delay={150}
            className="relative min-h-[280px] w-full overflow-hidden rounded-md md:min-h-[380px]"
          >
            <Image
              src={detailImageSrc}
              alt={detailImageAlt}
              width={800}
              height={1000}
              loading="lazy"
              className="h-full w-full object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
