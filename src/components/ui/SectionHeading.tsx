import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SectionHeadingSize =
  | "display"
  | "section"
  | "section-late"
  | "hero"
  | "sub"
  | "tile"
  | "menu";

type SectionHeadingProps = {
  children: ReactNode;
  as?: ElementType;
  size?: SectionHeadingSize;
  uppercase?: boolean;
  className?: string;
};

/** Sizes map 1:1 onto the reference site's own type scale, see the tokens in
 * globals.css and the table in docs/scraped-site-map.md.
 *
 * Note the reference is far more uniform than it looks: nearly every section
 * heading is the same `section` size. Its headings also carry **no** font-weight
 * or letter-spacing class (the `ls-0.025em` in its markup isn't a defined class,
 * so it's a no-op), meaning they render at the body weight: hence `font-normal`
 * here rather than the semibold/tracking-tight this component used to force. */
const sizes: Record<SectionHeadingSize, string> = {
  display: "",
  section: "text-h-mobile wide:text-h-section",
  /**
   * `section`, but it waits for a column wide enough to hold it.
   *
   * Fifth sighting of the same shape: a grid goes two- or three-up at one breakpoint while the type
   * jumps at another, and in the band between them a long Polish word is wider than its column.
   * `compactHeading` on `StatementSection` answers it by never growing at all, which is right for a
   * three-up grid; a two-up column does hold 67.7px, just not until it is about 610px wide.
   *
   * **1400px is measured, not guessed.** "Specjalizacja uroginekologiczna" at 67.7px wants 570–612px:
   * on `/fizjoterapia/specjalisci` it broke mid-word, with no hyphen, in a 569px column at a 1280
   * viewport and sat on two clean lines in a 612px one at 1366. `Container` caps at 1440, so the
   * column is `(min(vw, 1440) - 64 - 64) / 2`: 636px at a 1400 viewport, and it only grows from
   * there. English needs it too ("Urogynaecological specialisation").
   *
   * **Not solved by `hyphens-auto`.** Chrome's hyphenation dictionaries are a downloadable
   * component, absent on a fresh profile, which is exactly how the mid-word break was caught; the
   * `break-words` underneath it then breaks anywhere at all. A size that fits needs no dictionary.
   */
  "section-late": "text-h-mobile min-[1400px]:text-h-section",
  hero: "text-h-mobile wide:text-h-hero",
  sub: "text-h-mobile wide:text-h-sub",
  tile: "text-h-tile",
  menu: "text-h-menu",
};

/**
 * `display` headings (the oversized "NEWS" / "KONTAKT" / page titles) are sized to
 * fill their container on a single line, so a long title comes out small and a short
 * one huge. The reference does this in JavaScript: every size class on those
 * headings is `X`-prefixed: this page-builder's "disabled" marker: leaving a
 * `dynamic-header` script to write an inline `font-size` (hence its `font-size:
 * 255px` on the homepage's four-letter "News").
 *
 * Reproduced here in pure CSS: the wrapper is a query container and the size is its
 * width divided by the character count, capped so short words don't run away. A
 * fixed size cannot work, at the cap, a 19-character page title rendered ~282px and
 * ran far past the viewport.
 */
// Tuned against uppercase glyph metrics (~0.62em average advance), which are wider
// than mixed case: these headings are always uppercase, and a coefficient calibrated
// on mixed case overflowed the container by ~5%.
const FIT_COEFFICIENT = 1.5;
// The reference's own ceiling, read off its `dynamic-header` script rather than the
// `f50` class: the script sets 256px, immediately decrements to 255px, and from there
// only ever shrinks to fit. So 255px is the largest these headings can ever render,
// measured 255px on the live /cennik title. `f50`'s 17.6305rem was never the real cap
// (every size class on these headings is `X`-prefixed, i.e. disabled).
const FIT_MAX = "255px";

export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "section",
  uppercase = false,
  className,
}: SectionHeadingProps) {
  const isDisplay = size === "display";
  const chars = isDisplay && typeof children === "string" ? children.trim().length : 0;

  const style: CSSProperties | undefined =
    chars > 0
      ? {
          fontSize: `min(calc(100cqw / ${chars} * ${FIT_COEFFICIENT}), ${FIT_MAX})`,
          lineHeight: 0.85,
        }
      : undefined;

  const heading = (
    <Tag
      style={style}
      className={cn(
        // A floor, not a style: at a 320 viewport the container's content box is 288px and a single
        // Polish word at the 39.5px mobile step needs more than that ("kompleksowego" 317px,
        // "KLASYCZNY" 303px), so the heading was sliced off by the viewport edge on /masaz.
        // Wrapping cannot save a single word, so it has to be allowed to break.
        //
        // **`w-full` is half of it.** `break-words` is ignored when the browser computes an
        // element's min-content contribution, so a heading that is a shrink-to-fit flex item (every
        // `CenteredBand`, every `TextMedia` column) was still sized to that long word and overflowed
        // without breaking. Both are inert wherever the longest word already fits, and `display`
        // sizes are untouched in practice: they carry `whitespace-nowrap` and are fitted by
        // container query, and they already laid out full width.
        "w-full break-words font-normal text-brand-navy",
        uppercase && "uppercase",
        /* A single Polish word can be longer than a small phone's whole column, and at
         * `text-h-mobile` (39.5px) several page titles are. Measured at a 320px viewport:
         * "Trening z oceną funkcjonalną." needed 327px inside a 273px box and pushed the
         * **document** to 343px, i.e. the page scrolled sideways; "Trening indywidualny." did the
         * same by 33px. Both are fixed here rather than per page, because the next long title
         * would bring the bug straight back.
         *
         * `hyphens-auto` breaks at a dictionary point and leaves a hyphen, which is what Polish
         * wants ("funk-cjonalną"); `break-words` is the guarantee underneath it for a word the
         * dictionary does not know. Neither does anything at all until a word genuinely cannot
         * fit, so no heading that fits today moves. Same pairing as the accordion row titles.
         *
         * Fitted `display` headings are exempt: they are `whitespace-nowrap` and scale themselves
         * down to their container, so they can never overflow this way. */
        chars === 0 && "hyphens-auto break-words",
        // Fitted headings stay on one line, matching the reference's `wsnw`.
        chars > 0 && "whitespace-nowrap",
        // Fall back to the fluid size when children aren't a plain string to measure.
        isDisplay && chars === 0 && "text-h-display",
        sizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );

  if (!isDisplay) return heading;
  return <div className="[container-type:inline-size]">{heading}</div>;
}
