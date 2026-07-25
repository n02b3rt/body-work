import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  children: ReactNode;
  as?: ElementType;
  size?: "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  md: "text-3xl sm:text-4xl lg:text-5xl",
  lg: "text-4xl sm:text-5xl lg:text-6xl",
  xl: "text-5xl sm:text-7xl lg:text-8xl",
};

export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "lg",
  className,
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-semibold uppercase tracking-tight text-brand-navy",
        sizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
