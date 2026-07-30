import type { ReactNode } from "react";
import Image from "next/image";
import { blurProps } from "@/lib/static-blur";
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
  /**
   * Holds the photo off the section hairlines instead of letting it run into them.
   *
   * The reference lets the image bleed to the top and bottom rules, and on `/masaz`, where four
   * of these panels stack, the client asked for a little air. Off by default so no existing page
   * moves; see `docs/migration-tracker.md`.
   */
  imageInset?: boolean;
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
  imageInset = false,
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
    // The padding has to live on a wrapper, not on the positioned element below: an absolutely
    // positioned child (`fill`) resolves `inset: 0` against its containing block's **padding
    // box**, so padding on that same element would move nothing at all.
    <div className={cn("flex", imageInset && "py-6 lg:py-10")}>
      {/* No `self-center`: in the stretch grid the photo fills the row height, matching
        * the reference where it spans the whole section next to the text column. Its
        * min-height also sets how tall the row gets, which is what opens up the gap
        * between the heading and the copy in the `split` layout. */}
      <div className="relative aspect-video w-full overflow-hidden lg:aspect-auto lg:min-h-[540px]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          /* Measured, not guessed: this cell renders 457px at a 489 viewport, 471 at 1069, and
           * 656 from 1440 up, where `Container`'s cap makes it a fixed width rather than half the
           * viewport. Plain `50vw` claimed 944px at a 1889 viewport, a third more than it uses. */
          sizes="(min-width: 1440px) 656px, (min-width: 1024px) calc(50vw - 40px), calc(100vw - 32px)"
          className="object-cover"
          {...blurProps(imageSrc)}
        />
      </div>
    </div>
  );

  return (
    <section className="border-t border-brand-navy-soft bg-background">
      {/* `grid-cols-1` is not redundant: with no base column count the single implicit track is
        * `auto`, floored at the widest word in the cell, and at a 320 viewport this row measured
        * 303px inside a 288px container. Inert from 360 up. */}
      <Container className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-16">
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
