import type { ReactNode } from "react";
import Image from "next/image";
import { blurProps } from "@/lib/static-blur";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

type PhotoTextCardProps = {
  heading: ReactNode;
  body: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  /** Render the CTA as a plain anchor for an off-site target: matching `MediaCardCta`. */
  external?: boolean;
  imageSrc: string;
  imageAlt: string;
};

/** Big full-width photo with a cream card overlapping its lower-left corner: the
 * scraped reference's "Przyjazna przestrzeń" layout, distinct from the generic
 * side-by-side TextMedia block used elsewhere.
 *
 * The card is `absolute`, anchored to the photo's own bottom edge, not pulled up
 * with a negative margin from normal document flow. A negative margin is a fixed
 * guess at the card's height; whenever the real height exceeded that guess (longer
 * translation, narrower viewport wrapping to more lines), the card spilled out
 * below the photo and lost its background contrast (the page background is the
 * same cream as the card). Anchoring to `bottom-0` instead makes overflow-below
 * structurally impossible: the card can only grow upward into the photo. */
export function PhotoTextCard({ heading, body, ctaLabel, ctaHref, external, imageSrc, imageAlt }: PhotoTextCardProps) {
  return (
    <section className="border-t border-brand-navy-soft bg-background">
      <div className="relative aspect-[4/5] w-full sm:aspect-[16/9] lg:aspect-[2.2/1]">
        {/* Measured full-bleed at every width (489, 1069, 1469, 1889), so `100vw` is honest. */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
          {...blurProps(imageSrc)}
        />
        {/* Wide enough for the heading to stay on one line at its real size
         * (`ho:f12s5`, ~68px): the reference's card is ~48% of the viewport. Lifted
         * off the photo's bottom edge, but still anchored to it so the card can only
         * ever grow upward into the photo, never spill out below it. */}
        <div className="absolute bottom-6 left-4 right-4 sm:bottom-10 sm:right-auto sm:left-6 sm:max-w-2xl lg:bottom-14 lg:left-8 lg:max-w-4xl">
          <div className="bg-background p-6 sm:p-10 lg:p-12">
            <SectionHeading uppercase>{heading}</SectionHeading>
            <p className="mt-10 max-w-2xl text-body text-brand-navy">{body}</p>
            {ctaLabel && ctaHref ? (
              external ? (
                <a
                  href={ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("outline", "mt-10")}
                >
                  {ctaLabel}
                </a>
              ) : (
                <Link href={ctaHref} className={buttonClasses("outline", "mt-10")}>
                  {ctaLabel}
                </Link>
              )
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
