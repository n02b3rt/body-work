import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

/**
 * Caps content width so pages stay readable on large/ultrawide monitors.
 * The scraped reference site has no such cap (its widest breakpoint is
 * literally `max-width:99999999px`), which is why every page there
 * stretches edge to edge, see docs/scraped-site-map.md.
 */
export function Container({
  children,
  as: Tag = "div",
  className,
}: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </Tag>
  );
}
