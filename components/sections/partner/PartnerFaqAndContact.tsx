'use client';

import { useState } from 'react';
import Image from 'next/image';
import Section from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema } from '@/lib/contact/contactForm.schema';
import { submitContactForm } from '@/lib/contact/submit';
import type { ContactFormInput, SubmitResult } from '@/lib/contact/types';

export interface PartnerFaqItem {
  question: string;
  answer: string;
}

const DEFAULT_PARTNER_FAQ: PartnerFaqItem[] = [
  {
    question: 'Bagaimana skema biaya layanan Embun untuk mitra?',
    answer:
      'Embun menerapkan skema komisi dari setiap transaksi pemesanan yang berhasil, di mana besaran persentasenya akan disepakati bersama saat pendaftaran tanpa ada biaya tersembunyi.',
  },
  {
    question: 'Bagaimana cara mendaftar sebagai mitra Embun?',
    answer:
      'Pemilik campsite dapat mengisi formulir pada halaman Mitra, dan selanjutnya tim Embun akan menindaklanjuti untuk proses verifikasi lokasi hingga pengaktifan akun.',
  },
  {
    question: 'Apakah ada biaya untuk bergabung sebagai mitra?',
    answer:
      'Pendaftaran sebagai mitra Embun sepenuhnya gratis, tanpa dikenakan biaya awal maupun biaya langganan bulanan.',
  },
  {
    question: 'Bagaimana proses pencairan dana (settlement) untuk mitra?',
    answer:
      'Dana hasil pemesanan akan ditransfer secara otomatis ke rekening bank mitra, dan seluruh riwayat pencairan dapat dipantau secara transparan melalui dashboard sistem Embun.',
  },
];

export interface PartnerFaqAndContactProps {
  faqHeading?: string;
  faqItems?: PartnerFaqItem[];
  contactHeading?: string;
  contactSubcopy?: string;
  onSubmitOverride?: (data: ContactFormInput) => Promise<SubmitResult>;
}

export function PartnerFaqAndContact({
  faqHeading = 'FAQ',
  faqItems = DEFAULT_PARTNER_FAQ,
  contactHeading = 'Hubungi Kami',
  contactSubcopy = 'Punya campsite atau pertanyaan? Isi formulir di bawah dan tim kami akan menghubungi Anda segera.',
  onSubmitOverride,
}: PartnerFaqAndContactProps = {}) {
  // Accordion state
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Form state & hooks
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<
    (SubmitResult & { ok: false }) | null
  >(null);
  const [startedAt] = useState(() => Date.now());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      startedAt,
    },
  });

  async function handleValidSubmit(data: ContactFormInput) {
    setSubmitError(null);
    const result = onSubmitOverride
      ? await onSubmitOverride(data)
      : await submitContactForm(data);

    if (result.ok) {
      setIsSuccess(true);
      return;
    }
    setSubmitError(result);
  }

  return (
    <Section
      id="faq"
      style={{ backgroundColor: '#EFF3FB' }}
      className="py-16 lg:py-24"
    >
      <Container>
        {/* Upper Part: FAQ Accordion */}
        <div>
          <Reveal>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl mb-8">
              {faqHeading}
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Logogram Image (clean, borderless, transparent container) */}
            <div className="lg:col-span-5">
              <Reveal delay={100}>
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/images/embun_mitra.png"
                    alt="Embun Logo Art"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain"
                    quality={90}
                  />
                </div>
              </Reveal>
            </div>

            {/* Right Column: FAQ Accordion */}
            <div className="lg:col-span-7 flex flex-col">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <Reveal key={item.question} delay={index * 80}>
                    <div className="border-b border-black/10 py-4 first:pt-0">
                      <button
                        onClick={() => toggleIndex(index)}
                        type="button"
                        className="flex w-full items-center justify-between text-left font-sans text-base sm:text-lg font-semibold text-brand-black transition-colors hover:text-brand-blue py-1 group"
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
                          <p className="text-sm sm:text-base text-foreground-muted leading-relaxed pr-6 pb-1 font-sans">
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

        {/* Lower Part: Contact Form */}
        <div id="contact" className="mt-20 sm:mt-28">
          <Reveal>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl mb-3">
              {contactHeading}
            </h2>
            <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mb-8 leading-relaxed font-sans">
              {contactSubcopy}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Form inside White Rounded Card */}
            <div className="lg:col-span-7 flex flex-col">
              <Reveal delay={100} className="w-full h-full">
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-black/5 flex flex-col justify-between h-full">
                  {isSuccess ? (
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex w-full flex-col items-start gap-3 py-8"
                    >
                      <h3 className="font-sans text-2xl font-bold text-brand-black">
                        Terima kasih!
                      </h3>
                      <p className="text-base text-foreground-muted font-sans">
                        Pesan Anda telah terkirim. Kami akan menghubungi Anda
                        segera.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(handleValidSubmit)}
                      noValidate
                      className="flex flex-col gap-5 w-full"
                    >
                      {submitError ? (
                        <div
                          role="alert"
                          aria-live="polite"
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600"
                        >
                          <p>{submitError.message}</p>
                          <button
                            type="submit"
                            className="mt-2 font-medium underline underline-offset-2"
                          >
                            Coba lagi
                          </button>
                        </div>
                      ) : null}

                      {/* Row 1: Nama & Email */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="name"
                            className="text-xs font-semibold text-brand-black font-sans"
                          >
                            Nama <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register('name')}
                            id="name"
                            type="text"
                            placeholder="Nama"
                            className="w-full bg-[#f0f0f3] rounded-xl px-4 py-3 text-sm text-brand-black placeholder:text-foreground-muted/60 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all font-sans"
                          />
                          {errors.name && (
                            <p className="text-xs text-red-500 font-sans mt-0.5">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="email"
                            className="text-xs font-semibold text-brand-black font-sans"
                          >
                            Email
                          </label>
                          <input
                            {...register('email')}
                            id="email"
                            type="email"
                            placeholder="Email"
                            className="w-full bg-[#f0f0f3] rounded-xl px-4 py-3 text-sm text-brand-black placeholder:text-foreground-muted/60 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all font-sans"
                          />
                          {errors.email && (
                            <p className="text-xs text-red-500 font-sans mt-0.5">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 2: WhatsApp & Campsite */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="phone"
                            className="text-xs font-semibold text-brand-black font-sans"
                          >
                            Nomor WhatsApp
                          </label>
                          <input
                            {...register('phone')}
                            id="phone"
                            type="tel"
                            placeholder="0800 0000 0000"
                            className="w-full bg-[#f0f0f3] rounded-xl px-4 py-3 text-sm text-brand-black placeholder:text-foreground-muted/60 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all font-sans"
                          />
                          {errors.phone && (
                            <p className="text-xs text-red-500 font-sans mt-0.5">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="campsiteName"
                            className="text-xs font-semibold text-brand-black font-sans"
                          >
                            Nama Campsite (Opsional)
                          </label>
                          <input
                            {...register('campsiteName')}
                            id="campsiteName"
                            type="text"
                            placeholder="Nama Campsite"
                            className="w-full bg-[#f0f0f3] rounded-xl px-4 py-3 text-sm text-brand-black placeholder:text-foreground-muted/60 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all font-sans"
                          />
                          {errors.campsiteName && (
                            <p className="text-xs text-red-500 font-sans mt-0.5">
                              {errors.campsiteName.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Pesan */}
                      <div className="flex flex-col gap-1.5">
                        <label
                          htmlFor="message"
                          className="text-xs font-semibold text-brand-black font-sans"
                        >
                          Pesan / kebutuhan Anda
                        </label>
                        <textarea
                          {...register('message')}
                          id="message"
                          rows={4}
                          placeholder="Tulis pesan / kebutuhan Anda..."
                          className="w-full bg-[#f0f0f3] rounded-xl px-4 py-3 text-sm text-brand-black placeholder:text-foreground-muted/60 outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all resize-y min-h-[110px] font-sans"
                        />
                        {errors.message && (
                          <p className="text-xs text-red-500 font-sans mt-0.5">
                            {errors.message.message}
                          </p>
                        )}
                      </div>

                      {/* Anti-spam signals */}
                      <div
                        className="sr-only absolute -left-[9999px]"
                        aria-hidden="true"
                      >
                        <input
                          {...register('honeypot')}
                          id="honeypot"
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                        />
                      </div>
                      <input
                        type="hidden"
                        {...register('startedAt', { valueAsNumber: true })}
                      />
                      <input
                        type="checkbox"
                        name="botcheck"
                        className="sr-only absolute -left-[9999px]"
                        tabIndex={-1}
                        aria-hidden="true"
                      />

                      {/* Submit Button & Microcopy */}
                      <div className="pt-2 flex flex-col items-start gap-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#cbfd00] hover:bg-[#b8e600] active:scale-[0.98] text-[#0841b5] font-bold text-xs sm:text-sm rounded-xl px-8 py-3.5 tracking-wide transition-all cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {isSubmitting ? 'Mengirim...' : 'Kirim pesan'}
                        </button>
                        <p className="text-[11px] text-foreground-muted font-sans mt-1">
                          Kami akan menghubungi Anda segera.<br />
                          Atau hubungi kami di <a href="mailto:support@embun.app" className="text-emerald-600 dark:text-brand-lime no-underline hover:opacity-80 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-lime focus-visible:outline-offset-2 rounded-sm">support@embun.app</a>
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>

            {/* Right Column: Image Form (clean, borderless, transparent container) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <Reveal delay={200} className="w-full h-full">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl min-h-[380px]">
                  <Image
                    src="/images/image_form.png"
                    alt="Empowering people to reconnect with nature"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain"
                    quality={90}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export default PartnerFaqAndContact;
