import Image from "next/image";
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

/** Heading, photo and a CTA stacked in one column — the reference pairs two of these
 * side by side (its "Zespół." / "Przestrzeń." row). Meant to be placed in a grid by
 * the caller so the pair shares a divider. */
export function MediaCardCta({ heading, imageSrc, imageAlt, ctaLabel, ctaHref, external }: MediaCardCtaProps) {
  return (
    <div className="flex flex-col justify-between gap-10 p-8 lg:p-12">
      <SectionHeading uppercase>{heading}</SectionHeading>
      <div className="relative aspect-square w-full overflow-hidden lg:aspect-video">
        <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 1060px) 50vw, 100vw" className="object-cover" />
      </div>
      {external ? (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("outline", "self-start")}
        >
          {ctaLabel}
        </a>
      ) : (
        <Link href={ctaHref} className={buttonClasses("outline", "self-start")}>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
