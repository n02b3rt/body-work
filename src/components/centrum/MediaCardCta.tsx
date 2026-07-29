import Image from "next/image";
import { blurProps } from "@/lib/static-blur";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type MediaCardCtaProps = {
  heading: string;
  imageSrc: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
};

/** Heading above a large photo, with the CTA sitting on the photo's lower-left
 * corner. The reference pairs two of these side by side (its "Zespół." /
 * "Przestrzeń." row); place them in a grid so the pair shares a divider. */
export function MediaCardCta({ heading, imageSrc, imageAlt, ctaLabel, ctaHref, external }: MediaCardCtaProps) {
  const cta = external ? (
    <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
      {ctaLabel}
    </a>
  ) : (
    <Link href={ctaHref} className={buttonClasses("outline")}>
      {ctaLabel}
    </Link>
  );

  return (
    <div className="flex flex-col gap-10 p-8 lg:p-12">
      <SectionHeading uppercase>{heading}</SectionHeading>
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[4/3]">
        {/* Measured, not guessed: this renders 249px at a 360 viewport, 513 at 640, 376 at 1024
          * and 592 from 1440 on, where `Container`'s cap fixes it. The subtractions are that
          * container's padding (`px-4`, `sm:px-6`, `lg:px-8`) plus this card's own `p-8`/`lg:p-12`.
          *
          * **The two-up branch is `lg` (1024), not `wide` (1060).** Both pages that pair these
          * cards lay them out with `lg:grid-cols-2`, so between 1024 and 1059 the slot halves to
          * 376px while the old `1060` breakpoint was still claiming the full `calc(100vw - 64px)`:
          * a 960px file for a 376px hole. */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1440px) 592px, (min-width: 1024px) calc(50vw - 128px), (min-width: 640px) calc(100vw - 112px), calc(100vw - 96px)"
          className="object-cover"
          {...blurProps(imageSrc)}
        />
        <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8">{cta}</div>
      </div>
    </div>
  );
}
