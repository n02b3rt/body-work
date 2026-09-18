import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";

export type SplitPanel = { heading: string; body: string; ctaLabel: string; href: string };

type ThreeWaySplitProps = { items: SplitPanel[] };

/**
 * The hub's one job: send a visitor to one of three real sites. Every `href` is a full
 * URL (a different host), so each panel is a plain anchor, same "external" convention
 * as `ServiceGrid`'s cross-site tile, not next-intl's `Link`.
 */
export function ThreeWaySplit({ items }: ThreeWaySplitProps) {
  return (
    <Container className="py-4">
      <div className="grid border-l border-t border-brand-navy-soft sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.href} className="flex flex-col border-b border-r border-brand-navy-soft p-8 lg:p-12">
            <SectionHeading as="h2" size="sub" uppercase>
              {item.heading}
            </SectionHeading>
            <p className="mt-4 flex-1 text-body text-brand-navy">{item.body}</p>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline", "mt-8 self-start")}
            >
              {item.ctaLabel}
            </a>
          </div>
        ))}
      </div>
    </Container>
  );
}
