import type { ReactNode } from "react";
import Image from "next/image";
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
        <div className="grid border-l border-t border-brand-navy-soft sm:grid-cols-2">
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
        <Image src={image} alt={label} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
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
