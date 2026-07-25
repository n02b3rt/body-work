import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SectionHeadingSize = "display" | "section" | "hero" | "sub" | "tile" | "menu";

type SectionHeadingProps = {
  children: ReactNode;
  as?: ElementType;
  size?: SectionHeadingSize;
  uppercase?: boolean;
  className?: string;
};

/** Sizes map 1:1 onto the reference site's own type scale — see the tokens in
 * globals.css and the table in docs/scraped-site-map.md.
 *
 * Note the reference is far more uniform than it looks: nearly every section
 * heading is the same `section` size. Its headings also carry **no** font-weight
 * or letter-spacing class (the `ls-0.025em` in its markup isn't a defined class,
 * so it's a no-op), meaning they render at the body weight — hence `font-normal`
 * here rather than the semibold/tracking-tight this component used to force. */
const sizes: Record<SectionHeadingSize, string> = {
  display: "text-h-display",
  section: "text-h-mobile wide:text-h-section",
  hero: "text-h-mobile wide:text-h-hero",
  sub: "text-h-mobile wide:text-h-sub",
  tile: "text-h-tile",
  menu: "text-h-menu",
};

export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "section",
  uppercase = false,
  className,
}: SectionHeadingProps) {
  return (
    <Tag className={cn("font-normal text-brand-navy", uppercase && "uppercase", sizes[size], className)}>
      {children}
    </Tag>
  );
}
