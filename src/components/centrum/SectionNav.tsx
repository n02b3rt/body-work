"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/** `external` items leave the site (e.g. the class calendar lives on eFitness), so
 * they render as plain anchors rather than locale-aware links. */
export type SectionNavItem = { label: string; href: string; external?: boolean };

type SectionNavProps = {
  /** Label for the collapsed mobile control — the parent section's own name. */
  sectionLabel: string;
  items: SectionNavItem[];
};

/** Sticky sub-navigation for a section's pages, sitting directly under the header.
 *
 * The reference shows a horizontal row from 640px up and collapses to a `<details>`
 * disclosure below that; the current page keeps its underline permanently while the
 * others only show it on hover. */
export function SectionNav({ sectionLabel, items }: SectionNavProps) {
  const pathname = usePathname();
  const isCurrent = (href: string) => pathname === href || pathname === `${href}/`;

  return (
    <div className="sticky top-[65px] z-20 border-y border-brand-navy-soft bg-background">
      {/* Mobile: native disclosure, so it works before hydration too. */}
      <details className="group sm:hidden">
        <summary className="flex min-h-[47px] cursor-pointer list-none items-center justify-between px-4 text-btn font-light uppercase tracking-[1px] text-brand-navy [&::-webkit-details-marker]:hidden">
          {sectionLabel}
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 transition-transform duration-200 group-open:rotate-180"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </summary>
        <ul className="border-t border-brand-navy-soft">
          {items.map((item) => {
            const className = cn(
              "block px-4 py-3.5 text-btn uppercase tracking-[1px] text-brand-navy",
              isCurrent(item.href) ? "font-medium" : "font-light",
            );
            return (
              <li key={item.href} className="border-b border-brand-navy-soft last:border-b-0">
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {item.label}
                  </a>
                ) : (
                  <Link href={item.href} className={className}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </details>

      {/* From 640px up: the horizontal row. */}
      <Container className="hidden h-20 items-center sm:flex">
        {items.map((item) => {
          const className =
            "group relative mr-6 flex h-full items-center px-3 text-btn font-light uppercase tracking-[1px] text-brand-navy";
          const underline = (
            <span
              aria-hidden
              className={cn(
                "absolute bottom-0 left-3 w-[calc(100%_-_1.5rem)] bg-brand-navy transition-[height] duration-100 motion-reduce:transition-none",
                isCurrent(item.href) ? "h-2" : "h-0 group-hover:h-2",
              )}
            />
          );

          return item.external ? (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              <SectionNavLabel label={item.label} />
              {underline}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrent(item.href) ? "page" : undefined}
              className={className}
            >
              <SectionNavLabel label={item.label} />
              {underline}
            </Link>
          );
        })}
      </Container>
    </div>
  );
}

/** Same first-word break the header's sub-nav uses, so the two rows read alike. */
function SectionNavLabel({ label }: { label: string }) {
  const [first, ...rest] = label.split(" ");
  if (rest.length === 0) return <span>{label}</span>;
  return (
    <span>
      {first}
      <br />
      {rest.join(" ")}
    </span>
  );
}
