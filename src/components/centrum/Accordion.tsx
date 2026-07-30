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
  /**
   * Blur placeholder for `image`, as a data URI.
   *
   * Passed in rather than looked up here: `src/lib/static-blur.ts` is server-only, and importing
   * it into this client component would ship all 11KB of the map to every page that renders an
   * accordion. The calling page resolves it with `blurFor()` instead, the same way the homepage
   * hands `posterBlur` to `FullBleedVideo`.
   */
  imageBlur?: string;
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
  /**
   * Which rows have ever been open, which is what gates mounting their photos.
   *
   * `loading="lazy"` is not enough on its own. A closed panel is a `0fr` grid row, so it has no
   * *height*, but its photo keeps its own 288px layout box (`min-h-[18rem]`), and those boxes end
   * up stacked within about a thousand pixels of each other — measured on
   * `/trening-personalny/trening-indywidualny`, tops at 6771, 6905, 7014 and so on. That band sits
   * well inside the distance at which Chrome starts a lazy image, so merely scrolling past the row
   * titles downloaded all eight photos of an accordion nobody had opened.
   *
   * Kept here rather than in the row, because this is where a toggle is already handled; deriving
   * it in the row needed a `useEffect` that only re-rendered it a second time.
   *
   * Indices are never removed: a row the visitor closes again keeps its photo, so re-opening it is
   * instant rather than a second download.
   *
   * **Only rows that carry an `imageBlur` defer**, see `AccordionRow`. Without a placeholder there
   * would be nothing to paint between the click and the photo arriving, and trading a download the
   * visitor may not need for a blank half-panel they definitely see is the wrong way round. The
   * eleven other pages on this component have no placeholders yet and so keep their old behaviour
   * exactly; each one picks the saving up for free the moment it starts passing `imageBlur`.
   */
  const [openedIndices, setOpenedIndices] = useState<ReadonlySet<number>>(() => new Set());

  return (
    <div className="border-t border-brand-navy-soft bg-background">
      {items.map((item, index) => (
        <AccordionRow
          key={item.heading}
          item={item}
          squareMedia={squareMedia}
          open={openIndex === index}
          hasOpened={openedIndices.has(index)}
          onToggle={() => {
            setOpenIndex((current) => (current === index ? null : index));
            setOpenedIndices((current) =>
              current.has(index) ? current : new Set(current).add(index),
            );
          }}
        />
      ))}
    </div>
  );
}

function AccordionRow({
  item,
  open,
  hasOpened,
  onToggle,
  squareMedia,
}: {
  item: AccordionItemData;
  open: boolean;
  /** Has been open at least once, so its photo is worth downloading. See `Accordion`. */
  hasOpened: boolean;
  onToggle: () => void;
  squareMedia: boolean;
}) {
  const t = useTranslations("Statements");
  const panelId = useId();

  /** A panel made of nothing but named sub-lists lays them out as the panel's own halves rather
   * than stacking them in its left column. Only the pricing page's dietetics row is in this shape;
   * a row that also has copy, a photo or a panel heading keeps the original layout. */
  const groupsFillPanel =
    Boolean(item.groups?.length) &&
    !item.body &&
    !item.note &&
    !item.cta &&
    !item.image &&
    !item.panelHeading;

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
          {/* `grid-cols-1` explicitly: an implicit `auto` track is floored at its min-content
            * width, so one unbreakable word in a price list could size the whole panel wider than
            * the page. Tailwind's `grid-cols-*` are `minmax(0, 1fr)`, which removes that floor and
            * changes nothing else, since the single track already filled the container. */}
          <Container className="grid grid-cols-1 lg:grid-cols-2">
            {groupsFillPanel ? (
              /* A panel that is nothing but named sub-lists gives each one half of the row, which
               * is what the reference does: both dietitians' blocks carry `ul:w2-2 ho:w1-2`, full
               * width on a phone and a half each from its wide breakpoint up. Stacking them in the
               * left column instead left the right half of the panel empty at every desktop width
               * and made the longest price line wrap beside that empty space. */
              item.groups!.map((group, index) => (
                <div
                  key={group.heading}
                  className={cn(
                    "flex flex-col items-start gap-6 py-12 lg:py-16",
                    index === 0 ? "lg:pr-16" : "lg:border-l lg:border-brand-navy-soft lg:pl-16",
                  )}
                >
                  <h4 className="text-h-menu text-brand-navy">{group.heading}</h4>
                  <PanelText text={group.body} />
                  {group.cta ? <PanelLink cta={group.cta} /> : null}
                </div>
              ))
            ) : (
              <>
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
                  /* The blur rides on the wrapper as a background, not only on the `Image`, so a
                   * row that has never been opened still has something to paint in the instant
                   * between the click and the photo arriving. It is the same 16px data URI, ~150
                   * bytes, already inlined in the HTML. */
                  <div
                    className={cn(
                      "relative min-h-[18rem] w-full bg-cover bg-center",
                      squareMedia ? "lg:aspect-square lg:min-h-0" : "lg:min-h-full",
                    )}
                    style={item.imageBlur ? { backgroundImage: `url("${item.imageBlur}")` } : undefined}
                  >
                    {/* A row with no placeholder mounts its photo immediately, as it always did:
                      * deferring it would only swap a download for a blank half-panel. */}
                    {hasOpened || !item.imageBlur ? (
                      <Image
                        src={item.image}
                        alt={item.heading}
                        fill
                        /* Measured, not guessed: this cell renders 343px at a 390 viewport, 577 at
                         * 640, 473 at 1024 (where the panel goes two-up) and 688 from 1440 on, where
                         * `Container`'s cap fixes it. The subtractions are that container's own
                         * padding, `px-4` then `sm:px-6` then `lg:px-8`.
                         *
                         * The old value ended in a bare `100vw`, and a `sizes` written only in
                         * viewport units makes Next build the srcset from `deviceSizes` alone, whose
                         * smallest entry is 640: a 343px slot on a phone was being handed a 640px
                         * file. Naming a pixel length lets it reach `imageSizes` and pick 384. */
                        sizes="(min-width: 1440px) 688px, (min-width: 1024px) calc(50vw - 32px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
                        className="object-cover"
                        {...(item.imageBlur
                          ? { placeholder: "blur" as const, blurDataURL: item.imageBlur }
                          : {})}
                      />
                    ) : null}
                  </div>
                ) : item.panelHeading ? (
                  <div className="pb-12 lg:border-l lg:border-brand-navy-soft lg:py-16 lg:pl-16">
                    <SectionHeading as="h4">{item.panelHeading}</SectionHeading>
                  </div>
                ) : null}
              </>
            )}
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
