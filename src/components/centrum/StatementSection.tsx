import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type StatementSectionProps = {
  heading: ReactNode;
  body?: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "center" | "left";
};

/** Bare heading (+ optional body/CTA) content block — used both as a full-width
 * divider statement and, in a 2-up grid, for the split "what we believe" section.
 *
 * The copy block is pushed to the bottom with `mt-auto` rather than sitting right
 * under the heading: that both opens up the large gap the reference leaves there and
 * makes the body text line up across side-by-side columns whose headings wrap to
 * different numbers of lines. Needs the parent grid item to stretch (the default). */
export function StatementSection({ heading, body, ctaLabel, ctaHref, align = "center" }: StatementSectionProps) {
  const hasCta = Boolean(ctaLabel && ctaHref);

  return (
    <div
      className={cn(
        "flex h-full flex-col py-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      <SectionHeading className={align === "center" ? "max-w-3xl" : "max-w-5xl"}>{heading}</SectionHeading>
      {body || hasCta ? (
        <div className={cn("mt-auto pt-24", align === "center" ? "max-w-2xl" : "max-w-xl")}>
          {body ? <p className="text-body text-brand-navy">{body}</p> : null}
          {hasCta ? (
            <Link href={ctaHref!} className={buttonClasses("outline", "mt-10")}>
              {ctaLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
