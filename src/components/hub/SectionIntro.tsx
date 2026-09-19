import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionIntroProps = {
  id: string;
  heading: string;
  children?: ReactNode;
  inverted?: boolean;
  className?: string;
};

/** The heading + body every hub section opens with. `id` names the heading, so the section can
 * point `aria-labelledby` at it. */
export function SectionIntro({ id, heading, children, inverted, className }: SectionIntroProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <h2
        id={id}
        className={cn(
          "text-balance text-h-mobile font-normal wide:text-h-sub",
          inverted ? "text-background" : "text-brand-navy",
        )}
      >
        {heading}
      </h2>
      {children ? (
        <div
          className={cn(
            "mt-6 space-y-4 text-body",
            inverted ? "text-background/85" : "text-brand-navy/80",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
