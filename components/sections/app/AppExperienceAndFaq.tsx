'use client';

import { useState } from 'react';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { PlusCircle, MinusCircle } from 'lucide-react';

export interface FaqItemData {
  question: string;
  answer: string;
}

const DEFAULT_FAQ_ITEMS: FaqItemData[] = [
  {
    question: 'Apa itu Embun App?',
    answer:
      'Embun App adalah aplikasi untuk mencari dan memesan spot outdoor dari mitra Embun di seluruh Indonesia — mulai dari glamping, cabin, campervan, motocamp, bikecamp, saung, hingga area camping biasa. Lengkap dengan detail spot, ketersediaan tanggal, dan pembayaran langsung dari ponsel tanpa perlu menghubungi pemilik secara manual.',
  },
  {
    question: 'Bagaimana cara memesan spot lewat Embun App?',
    answer:
      'Cari lokasi atau nama spot yang diinginkan, pilih tanggal dan tipe akomodasi yang tersedia, lalu bayar langsung di aplikasi. Konfirmasi pesanan muncul otomatis setelah pembayaran berhasil.',
  },
  {
    question: 'Apakah pembayaran di Embun App aman?',
    answer:
      'Ya, pembayaran diproses lewat payment gateway tepercaya dan tercatat otomatis di aplikasi tidak perlu transfer manual ke pemilik campsite.',
  },
  {
    question: 'Apa yang harus dilakukan jika ingin membatalkan pesanan?',
    answer:
      'Buka riwayat pemesanan di aplikasi dan ajukan pembatalan sesuai kebijakan Embun. Detail lengkap ada di halaman Kebijakan Refund & Pembatalan di website Embun.',
  },
];

const SCREENSHOTS = [
  {
    src: '/images/search_1.png',
    alt: 'Cari campsite sesuai lokasi dan kebutuhanmu',
    caption: '1. Cari campsite sesuai lokasi dan kebutuhanmu.',
  },
  {
    src: '/images/search_2.png',
    alt: 'Lihat detail campsite dan pilih spot yang kamu mau',
    caption: '2. Lihat detail campsite dan pilih spot yang kamu mau.',
  },
  {
    src: '/images/search_3.png',
    alt: 'Selesaikan pemesanan dan bayar dengan aman',
    caption: '3. Selesaikan pemesanan dan bayar dengan aman.',
  },
];

export interface ScreenshotItemData {
  src: string;
  alt: string;
  caption: string;
}

export interface AppExperienceAndFaqProps {
  headline?: string;
  subcopy?: string;
  screenshots?: ScreenshotItemData[];
  faqHeading?: string;
  faqItems?: FaqItemData[];
}

export function AppExperienceAndFaq({
  headline = 'Semua Kebutuhan Campingmu dalam Satu Aplikasi',
  subcopy = 'Dari mencari lokasi ideal, membayar dengan aman, hingga menyimpan riwayat perjalanan Embun App dirancang khusus untuk mempermudah petualanganmu di alam.',
  screenshots = SCREENSHOTS,
  faqHeading = 'FAQ',
  faqItems = DEFAULT_FAQ_ITEMS,
}: AppExperienceAndFaqProps = {}) {
  // First item open by default
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section
      id="experience-faq"
      variant="none"
      className="bg-[#EFF3FB] dark:bg-[#0d131f] py-16 lg:py-24 transition-colors"
    >
      <Container>
        {/* Upper Part: Screenshots & App Value Prop */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
              {headline}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              {subcopy}
            </p>
          </div>
        </Reveal>

        {/* 3 Screenshots Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 items-start">
          {screenshots.map((item, index) => (
            <Reveal key={item.src} delay={index * 100}>
              <div className="flex flex-col">
                <div className="relative aspect-[9/19] w-full max-w-[320px] mx-auto">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain"
                    quality={90}
                  />
                </div>
                <p className="mt-4 text-xs sm:text-sm text-center text-foreground-muted leading-snug font-sans">
                  {item.caption}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Lower Part: FAQ Accordion with Embun Image on Left */}
        <div id="faq" className="mt-20 sm:mt-28">
          <Reveal>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-brand-black mb-8">
              {faqHeading}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Embun Green Image */}
            <div className="lg:col-span-4">
              <Reveal delay={100}>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-sm bg-emerald-800">
                  <Image
                    src="/images/embun_image.png"
                    alt="Embun"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    quality={90}
                  />
                </div>
              </Reveal>
            </div>

            {/* Right Column: FAQ Accordion */}
            <div className="lg:col-span-8 flex flex-col">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <Reveal key={item.question} delay={index * 80}>
                    <div className="border-b border-black/10 dark:border-white/10 py-4 first:pt-0">
                      <button
                        onClick={() => toggleIndex(index)}
                        type="button"
                        className="flex w-full items-center justify-between text-left font-sans text-base sm:text-lg font-semibold text-brand-black transition-colors hover:text-brand-blue dark:hover:text-brand-lime py-1 group"
                        aria-expanded={isOpen}
                      >
                        <span className="pr-4">{item.question}</span>
                        <span className="shrink-0 text-foreground-muted transition-transform duration-300">
                          {isOpen ? (
                            <MinusCircle
                              size={22}
                              className="text-brand-black transition-transform duration-300"
                            />
                          ) : (
                            <PlusCircle
                              size={22}
                              className="transition-transform duration-300 group-hover:scale-110"
                            />
                          )}
                        </span>
                      </button>

                      {/* Smooth animated accordion body */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen
                            ? 'grid-rows-[1fr] opacity-100 mt-3'
                            : 'grid-rows-[0fr] opacity-0 mt-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm sm:text-base text-foreground-muted leading-relaxed pr-6 pb-1">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default AppExperienceAndFaq;
