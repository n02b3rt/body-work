"use client";

import type { EmblaCarouselType } from "embla-carousel";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type CarouselArrowsProps = {
  api?: EmblaCarouselType;
  className?: string;
};

/** Navy circle + cream chevron prev/next pair, matching the reference's carousel
 * controls (its own markup uses two 49px inline SVGs). */
export function CarouselArrows({ api, className }: CarouselArrowsProps) {
  const t = useTranslations("Carousel");

  return (
    <div className={cn("flex shrink-0 items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => api?.scrollPrev()}
        aria-label={t("previous")}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-background transition-opacity hover:opacity-80"
      >
        <Chevron className="rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => api?.scrollNext()}
        aria-label={t("next")}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy text-background transition-opacity hover:opacity-80"
      >
        <Chevron />
      </button>
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 20"
      width="12"
      height="20"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M1 1L10 10L1 19" />
    </svg>
  );
}
