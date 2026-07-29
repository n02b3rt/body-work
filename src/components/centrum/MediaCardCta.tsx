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
        {/* Measured, not guessed: this renders 389px at a 485 viewport, 557 at 669, 396 at 1049
          * and is capped by `Container` above 1440. The 64px and 96px come off for the container
          * padding plus this card's own `p-8`/`lg:p-12`; plain `100vw` overstated the slot by a
          * fifth on a phone and `50vw` by a third at 1049. */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(min-width: 1440px) 592px, (min-width: 1060px) calc(50vw - 96px), calc(100vw - 64px)"
          className="object-cover"
          {...blurProps(imageSrc)}
        />
        <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8">{cta}</div>
      </div>
    </div>
  );
}
