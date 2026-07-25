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
 * divider statement and, in a 2-up grid, for the split "what we believe" section. */
export function StatementSection({ heading, body, ctaLabel, ctaHref, align = "center" }: StatementSectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 py-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      <SectionHeading className={align === "center" ? "max-w-3xl" : "max-w-lg"}>{heading}</SectionHeading>
      {body ? (
        <p className={cn("text-base text-brand-navy/80 sm:text-lg", align === "center" ? "max-w-2xl" : "max-w-lg")}>
          {body}
        </p>
      ) : null}
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className={buttonClasses("outline")}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
