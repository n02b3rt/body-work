"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type AccordionCta = { label: string; href: string };

/** A row's panel is either a single body (+ optional photo), or: on the pricing
 * page, a price list with a CTA, a trailing note, and occasionally two named
 * sub-blocks (the two dietitians share one row there). */
export type AccordionItemData = {
  heading: string;
  body?: string;
  image?: string;
  /** Fills the panel's other half in place of a photo, at full section-heading size,
   * the reference uses this for the pricing page's "Dla naszych klientów masaż – 15%!". */
  panelHeading?: string;
  note?: string;
  cta?: AccordionCta;
  groups?: { heading: string; body: string; cta?: AccordionCta }[];
};

type AccordionProps = {
  items: AccordionItemData[];
  /**
   * Pins each panel's photo to a square, so every row opens to the same height.
   *
   * Without it the row is only as tall as its own copy, so somebody who wrote less about
   * themselves gets their portrait cropped harder than the person above them: heads included.
   * The reference does exactly this, its panel media carries `ratio1-1`.
   *
   * Off by default: the pricing and equipment accordions have no photo to square up, and the
   * other people list, `/fizjoterapia/specjalisci`, has the same problem and can take the same
   * flag when somebody looks at it.
   */
  squareMedia?: boolean;
};

/** Stack of expandable rows: the reference's "Kiedy warto?" list. Its closed row
 * turns navy on hover, and the toggle is a labelled pill from `lg` up but a compact
 * chevron below that. */
export function Accordion({ items, squareMedia = false }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-brand-navy-soft bg-background">
      {items.map((item, index) => (
        <AccordionRow
          key={item.heading}
          item={item}
          squareMedia={squareMedia}
          open={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        />
      ))}
    </div>
  );
}

function AccordionRow({
  item,
  open,
  onToggle,
  squareMedia,
}: {
  item: AccordionItemData;
  open: boolean;
  onToggle: () => void;
  squareMedia: boolean;
}) {
  const t = useTranslations("Statements");
  const panelId = useId();

  return (
    <div className="border-b border-brand-navy-soft">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "group flex w-full items-center gap-6 text-left transition-colors duration-200",
          open ? "bg-brand-navy text-background" : "text-brand-navy hover:bg-brand-navy hover:text-background",
        )}
      >
        <Container className="flex items-center justify-between gap-6 py-6 lg:py-8">
          {/* `min-w-0`: a flex item defaults to `min-width: auto`, so a long row title refused to
            * shrink and pushed the `shrink-0` chevron clean out of the container. Measured at a
            * 485px viewport: the chevron sat at x=485 with 32px hanging past the edge.
            *
            * `break-words` with it, because `min-w-0` alone lets a single long word spill out of
            * the shrunken box instead of wrapping inside it. */}
          <span className="min-w-0 break-words text-h-menu">{item.heading}</span>

          {/* Pill on desktop, chevron circle below it, as in the reference.
            *
            * The show/hide lives on a **wrapper**, and that is load-bearing. `buttonClasses` starts
            * with `inline-flex`, and `cn` here is a plain join rather than tailwind-merge, so a
            * `hidden` sitting beside it in the same class list loses to it in the stylesheet. The
            * pill was therefore showing at every width: measured at a 485px viewport it rendered
            * `display: flex`, 228px wide, alongside the mobile chevron, squeezing the row title to
            * 145px so long names wrapped and spilled across the button. */}
          <span className="hidden shrink-0 lg:block">
            <span
              className={cn(
                buttonClasses("outline"),
                "border-current bg-transparent text-current group-hover:bg-transparent group-hover:text-current",
              )}
            >
              {open ? t("showLess") : t("learnMore")}
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current lg:hidden">
            <svg
              viewBox="0 0 10 16"
              width="7"
              height="14"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className={cn("transition-transform duration-200", open ? "-rotate-90" : "rotate-90")}
            >
              <path d="M0 0L4.88 4.88L0 9.76" transform="translate(2 3)" />
            </svg>
          </span>
        </Container>
      </button>

      <div
        id={panelId}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        {/* The panel splits its width in two: copy on the left, and on the right either
         * the image filling its half edge to edge or a section-size heading. It shares
         * the row header's `Container` so the copy lines up under the row title: on the
         * reference both sit at the same 48px page inset, and letting the panel run
         * full-bleed instead left the copy ~228px to the left of its own heading. */}
        <div className="min-h-0">
          <Container className="grid lg:grid-cols-2">
            <div className="flex flex-col items-start gap-8 py-12 lg:py-16 lg:pr-16">
              {item.body ? <PanelText text={item.body} /> : null}
              {item.cta ? <PanelLink cta={item.cta} /> : null}
              {item.note ? <PanelText text={item.note} muted /> : null}

              {item.groups?.map((group) => (
                <div key={group.heading} className="flex flex-col items-start gap-6">
                  <h4 className="text-h-menu text-brand-navy">{group.heading}</h4>
                  <PanelText text={group.body} />
                  {group.cta ? <PanelLink cta={group.cta} /> : null}
                </div>
              ))}
            </div>
            {item.image ? (
              <div
                className={cn(
                  "relative min-h-[18rem] w-full",
                  squareMedia ? "lg:aspect-square lg:min-h-0" : "lg:min-h-full",
                )}
              >
                <Image
                  src={item.image}
                  alt={item.heading}
                  fill
                  // Half of the capped container, not half the viewport: the panel
                  // is inside `Container`, so this cell never exceeds 688px.
                  sizes="(min-width: 1024px) min(50vw, 688px), 100vw"
                  className="object-cover"
                />
              </div>
            ) : item.panelHeading ? (
              <div className="pb-12 lg:border-l lg:border-brand-navy-soft lg:py-16 lg:pl-16">
                <SectionHeading as="h4">{item.panelHeading}</SectionHeading>
              </div>
            ) : null}
          </Container>
        </div>
      </div>
    </div>
  );
}

/** Price lists arrive as one string with newlines, so blank-line-free breaks have
 * to survive rendering. */
function PanelText({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <p className={cn("whitespace-pre-line text-body", muted ? "text-brand-navy/70" : "text-brand-navy")}>{text}</p>
  );
}

function PanelLink({ cta }: { cta: AccordionCta }) {
  const external = cta.href.startsWith("http") || cta.href.startsWith("tel:") || cta.href.startsWith("mailto:");
  return external ? (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
      {cta.label}
    </a>
  ) : (
    <Link href={cta.href} className={buttonClasses("outline")}>
      {cta.label}
    </Link>
  );
}
