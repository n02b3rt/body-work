import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";

export type ServiceTileData = { label: string; href: string };

type ServiceGridProps = {
  heading: ReactNode;
  items: ServiceTileData[];
};

export function ServiceGrid({ heading, items }: ServiceGridProps) {
  return (
    <section className="border-t border-brand-navy-soft bg-brand-surface">
      <Container className="py-16 lg:py-24">
        <SectionHeading size="xl" className="mb-10">
          {heading}
        </SectionHeading>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ServiceTile key={item.href} {...item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ServiceTile({ label, href }: ServiceTileData) {
  const isExternal = href.startsWith("http");
  const className =
    "group flex aspect-[4/3] flex-col justify-end rounded-2xl border border-brand-navy-soft bg-background p-6 transition-colors hover:bg-brand-navy";
  const labelClassName =
    "text-xl font-semibold uppercase tracking-wide text-brand-navy transition-colors group-hover:text-white";

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <span className={labelClassName}>{label}</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span className={labelClassName}>{label}</span>
    </Link>
  );
}
