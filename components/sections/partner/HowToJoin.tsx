import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import Section from '@/components/ui/Section';

export interface HowToJoinProps {
  heading?: string;
  subcopy?: string;
  steps?: { title: string; description: string }[];
}

export default function HowToJoin({
  heading,
  subcopy,
  steps = [],
}: HowToJoinProps) {
  if (!steps.length) return null;

  return (
    <Section id="how-to-join" variant="none" className="bg-[#EFF3FB] dark:bg-[#0d131f] py-16 lg:py-24 transition-colors">
      <Container>
        <Reveal delay={0}>
          <div className="mx-auto max-w-3xl text-center">
            {/* Title uses Plus Jakarta Sans (font-sans) as requested */}
            <h2 className="font-sans text-3xl font-bold tracking-tight text-brand-black sm:text-4xl lg:text-5xl leading-[1.2]">
              {heading}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed max-w-2xl mx-auto">
              {subcopy}
            </p>
          </div>
        </Reveal>

        {/* Step items with card backgrounds */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <Reveal
              key={index}
              as="article"
              delay={index * 100}
              className="flex flex-col gap-5 rounded-2xl bg-white p-6 sm:p-8 shadow-sm border border-black/5 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-blue text-lg font-bold text-white shadow-xs">
                {index + 1}
              </div>
              <div>
                <h3 className="font-sans text-xl font-bold text-brand-black">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground-muted">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
