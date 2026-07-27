import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SectionHeadingSize = "display" | "section" | "hero" | "sub" | "tile" | "menu";

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
        "font-normal text-brand-navy",
        uppercase && "uppercase",
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
