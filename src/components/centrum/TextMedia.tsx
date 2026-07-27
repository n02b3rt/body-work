import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type TextMediaProps = {
  heading: ReactNode;
  body: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  imagePosition?: "left" | "right";
  headingUppercase?: boolean;
  /** `split` pins the heading to the top and the copy/CTA to the bottom of the
   * column (the reference's "Zespół" layout); `center` groups them together. */
  textLayout?: "center" | "split";
  imageSrc: string;
  imageAlt: string;
};

/** Generic heading + copy + CTA + image block: reused across most Centrum content
 * sections (see docs/conventions.md's reuse rule) and maps to PRD's "Tekst + media" block. */
export function TextMedia({
  heading,
  body,
  ctaLabel,
  ctaHref,
  imagePosition = "right",
  headingUppercase = false,
  textLayout = "center",
  imageSrc,
  imageAlt,
}: TextMediaProps) {
  const textBlock = (
    <div
      className={cn(
        "flex flex-col py-16 lg:py-24",
        textLayout === "split" ? "justify-between gap-32" : "justify-center gap-8",
      )}
    >
      <SectionHeading uppercase={headingUppercase}>{heading}</SectionHeading>
      <div>
        <p className="max-w-xl text-body text-brand-navy">{body}</p>
        {ctaLabel && ctaHref ? (
          <Link href={ctaHref} className={buttonClasses("outline", "mt-10")}>
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );

  const imageBlock = (
    // No `self-center`: in the stretch grid the photo fills the row height, matching
    // the reference where it spans the whole section next to the text column. Its
    // min-height also sets how tall the row gets, which is what opens up the gap
    // between the heading and the copy in the `split` layout.
    <div className="relative aspect-video w-full overflow-hidden lg:aspect-auto lg:min-h-[540px]">
      <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
    </div>
  );

  return (
    <section className="border-t border-brand-navy-soft bg-background">
      <Container className="grid gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-16">
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
