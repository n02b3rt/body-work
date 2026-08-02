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
  /**
   * Hold the heading at its mobile size instead of letting it grow at `wide`.
   *
   * For use in a **three-up** grid, where the full section size cannot fit. `section` jumps from
   * 39.5px to 67.7px at 1060, and at 67.7px the word "funkcjonalny." needs roughly 396px while a
   * third of the capped container is at most 378px, so it overflows at every desktop width: it was
   * measured pushing the page 75px past the viewport at 1049. The reference does the same thing
   * deliberately, giving this block `ul:f7s4 hg:f9s4 eo:f12s5`, three steps with the largest only
   * at a genuinely wide viewport, where our two-step scale has none in between.
   *
   * Two-up columns are unaffected and do not need this: at roughly 656px they hold 67.7px fine.
   */
  compactHeading?: boolean;
};

/** Bare heading (+ optional body/CTA) content block: used both as a full-width
 * divider statement and, in a 2-up grid, for the split "what we believe" section.
 *
 * The copy block is pushed to the bottom with `mt-auto` rather than sitting right
 * under the heading, that both opens up the large gap the reference leaves there and
 * makes the body text line up across side-by-side columns whose headings wrap to
 * different numbers of lines. Needs the parent grid item to stretch (the default). */
export function StatementSection({
  heading,
  body,
  ctaLabel,
  ctaHref,
  align = "center",
  compactHeading = false,
}: StatementSectionProps) {
  const hasCta = Boolean(ctaLabel && ctaHref);

  return (
    <div
      className={cn(
        "flex h-full flex-col py-12",
        align === "center" ? "items-center text-center" : "items-start text-left",
      )}
    >
      {/* `w-full` is load-bearing. This is a **column** flex container, so `items-start` sets the
        * cross size to fit-content, and a heading whose max-content width exceeds the column then
        * lays out at max-content and paints straight over the neighbouring cell: measured 209px
        * past a 262px cell on /bodylab/technologia-vald at a 1060 viewport, invisible to a
        * `scrollWidth` check because `html` carries `overflow-x: clip`. `w-full` pins it to the
        * column so the text wraps; `break-words` is the last resort for a single word that still
        * cannot fit, which is what `compactHeading` above is really for. */}
      <SectionHeading
        size={compactHeading ? "tile" : "section"}
        className={cn("w-full break-words", align === "center" ? "max-w-3xl" : "max-w-5xl")}
      >
        {heading}
      </SectionHeading>
      {body || hasCta ? (
        <div className={cn("mt-auto pt-24", align === "center" ? "max-w-2xl" : "max-w-xl")}>
          {/* `whitespace-pre-line` because some of this copy is multi-line in the source
            *: paragraph breaks, and the bullet lists on /instrukcja. Without it those
            * collapse into one run-on paragraph. */}
          {body ? <p className="whitespace-pre-line text-body text-brand-navy">{body}</p> : null}
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
