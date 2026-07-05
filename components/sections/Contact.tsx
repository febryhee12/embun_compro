import { Container } from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Reveal from '@/components/ui/Reveal';
import { ContactForm } from '@/components/contact/ContactForm';

/**
 * Contact — Contact Form section (Server Component wrapper).
 * WhatsApp CTA sementara disembunyikan.
 */
export default function Contact({ 
  heading = 'Hubungi Kami', 
  subcopy = 'Punya campsite atau pertanyaan? Isi formulir di bawah dan tim kami akan menghubungi Anda segera.' 
}: { 
  heading?: string; 
  subcopy?: string; 
}) {
  return (
    <Section id="contact" variant="muted">
      <Container>
        <div className="mx-auto flex max-w-2xl flex-col items-start gap-10">
          <Reveal className="w-full">
            <h2 className="font-serif text-[2.5rem] leading-[1.1] text-foreground md:text-5xl mb-4">
              {heading}
            </h2>
            <p className="font-sans text-lg leading-[1.7] text-foreground-muted">
              {subcopy}
            </p>
          </Reveal>

          <Reveal delay={100} className="w-full">
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
