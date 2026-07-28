import type { ReactNode } from "react";
import Image from "next/image";
import { blurProps } from "@/lib/static-blur";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export type ServiceTileData = { label: string; href: string; image: string };

type ServiceGridProps = {
  heading: ReactNode;
  ctaLabel: string;
  items: ServiceTileData[];
};

export function ServiceGrid({ heading, ctaLabel, items }: ServiceGridProps) {
  return (
    <section className="border-t border-brand-navy-soft bg-background">
      <Container className="py-16 lg:py-24">
        <SectionHeading className="mb-16">{heading}</SectionHeading>
        {/* Two-up from `wide` (1060px), not from `sm`. The reference's own tile carries
          * `ul:w2-2 ho:w1-2`, and its media-query bands stop at 1059, so `ho` is 1060 and up.
          * Going two-up at 640 made each tile 289px wide while the label renders at 39.5px, so
          * "Fizjoterapia" needed 252px in a 225px box and spilled out: measured, and it also
          * pushed the page 7px wider than the viewport. */}
        <div className="grid border-l border-t border-brand-navy-soft wide:grid-cols-2">
          {items.map((item) => (
            <ServiceTile key={item.href} ctaLabel={ctaLabel} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceTile({ label, href, image, ctaLabel }: ServiceTileData & { ctaLabel: string }) {
  const isExternal = href.startsWith("http");

  return (
    <div className="flex flex-col border-b border-r border-brand-navy-soft p-8">
      <div className="relative aspect-[2/1] w-full overflow-hidden">
        <Image
          src={image}
          alt={label}
          fill
          /* Measured, not guessed: a tile renders 391px at a 489 viewport, 437 at 1069, and 623
           * from 1440 up, where `Container`'s cap fixes it. The 96px comes off for the container
           * padding plus the tile's own `p-8` on both sides; plain `100vw` overstated the slot by
           * a quarter. */
          sizes="(min-width: 1440px) 624px, (min-width: 1060px) calc(50vw - 96px), calc(100vw - 96px)"
          className="object-cover"
          {...blurProps(image)}
        />
      </div>
      <SectionHeading as="h3" size="tile" uppercase className="mt-8">
        {label}
      </SectionHeading>
      {isExternal ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("outline", "mt-12 self-start")}
        >
          {ctaLabel}
        </a>
      ) : (
        <Link href={href} className={buttonClasses("outline", "mt-12 self-start")}>
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
