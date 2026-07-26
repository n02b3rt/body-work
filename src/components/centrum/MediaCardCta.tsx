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
        <Image src={imageSrc} alt={imageAlt} fill sizes="(min-width: 1060px) 50vw, 100vw" className="object-cover" />
        <div className="absolute bottom-6 left-6 lg:bottom-8 lg:left-8">{cta}</div>
      </div>
    </div>
  );
}
