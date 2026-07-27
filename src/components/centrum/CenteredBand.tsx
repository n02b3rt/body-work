import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type CenteredBandProps = {
  /** Small uppercase label above the heading. */
  eyebrow?: string;
  heading: ReactNode;
  body?: ReactNode;
  /** Faint brand mark sitting behind the block. */
  backgroundSrc?: string;
  children?: ReactNode;
};

/** Centred statement band with an optional watermark behind it: the section-page
 * equivalent of the homepage's newsletter block, and the shape the reference reuses
 * for every "here's the idea / here's how to start" moment. */
export function CenteredBand({ eyebrow, heading, body, backgroundSrc, children }: CenteredBandProps) {
  return (
    <section className="relative overflow-hidden border-t border-brand-navy-soft bg-background py-20 lg:py-28">
      {backgroundSrc ? (
        <Image src={backgroundSrc} alt="" fill sizes="100vw" className="object-cover" />
      ) : null}
      <Container className="relative z-10 flex flex-col items-center gap-10 text-center">
        {eyebrow ? <p className="text-body uppercase text-brand-navy">{eyebrow}</p> : null}
        <SectionHeading size="hero" className="max-w-4xl">
          {heading}
        </SectionHeading>
        {body ? <div className="max-w-3xl text-body text-brand-navy">{body}</div> : null}
        {children ? <div className="flex flex-wrap items-center justify-center gap-6">{children}</div> : null}
      </Container>
    </section>
  );
}
