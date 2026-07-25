import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type TextMediaProps = {
  heading: ReactNode;
  body: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  imagePosition?: "left" | "right";
  imageAlt: string;
};

/** Generic heading + copy + CTA + image block — reused across most Centrum content
 * sections (see docs/conventions.md's reuse rule) and maps to PRD's "Tekst + media" block. */
export function TextMedia({
  heading,
  body,
  ctaLabel,
  ctaHref,
  imagePosition = "right",
  imageAlt,
}: TextMediaProps) {
  const textBlock = (
    <div className="flex flex-col justify-center gap-6 py-16 lg:py-24">
      <SectionHeading>{heading}</SectionHeading>
      <p className="max-w-xl text-base text-brand-navy/80 sm:text-lg">{body}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={buttonClasses("outline", "self-start")}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );

  const imageBlock = (
    <div
      role="img"
      aria-label={imageAlt}
      className="aspect-video w-full self-center rounded-2xl bg-gradient-to-br from-brand-navy/80 to-brand-navy/30 lg:aspect-auto lg:min-h-[420px]"
    />
  );

  return (
    <section className="border-t border-brand-navy-soft bg-background">
      <Container className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        {imagePosition === "left" ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </Container>
    </section>
  );
}
