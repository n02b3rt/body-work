"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { carouselViewport, useScrollCarousel } from "@/components/ui/use-scroll-carousel";
import { CarouselArrows } from "./CarouselArrows";

type NewsItem = { title: string; detailTitle?: string; detail?: string };

export function NewsCarousel() {
  const t = useTranslations("News");
  const items = t.raw("items") as NewsItem[];
  // The ticker keeps cycling after a nudge, unlike the quotes carousel.
  const { ref, scrollPrev, scrollNext } = useScrollCarousel({
    autoplayMs: 4500,
    count: items.length,
  });

  return (
    <section className="border-t border-brand-navy-soft bg-background py-16 lg:py-24">
      {/* Arrows sit to the left of the oversized right-aligned heading, as in the
       * reference. */}
      <Container className="flex items-end justify-between gap-6">
        <CarouselArrows onPrev={scrollPrev} onNext={scrollNext} />
        <SectionHeading uppercase size="display">
          {t("heading")}
        </SectionHeading>
      </Container>
      {/* The track carries every item twice, which is what makes the loop seamless: past
        * halfway the scroller is on an identical copy and can be reset without anything
        * moving on screen. The second pass is `aria-hidden`, so a screen reader hears the
        * news once. See `use-scroll-carousel.ts`. */}
      {/* `scroll-pl-*` mirrors the track's own padding, or a slide would snap flush to the
        * container edge and sit under it. */}
      <div ref={ref} className={`mt-10 scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-8 ${carouselViewport}`}>
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
          {[...items, ...items].map((item, index) => (
            <article
              key={`${item.title}-${index}`}
              aria-hidden={index >= items.length}
              className="min-w-0 flex-[0_0_82%] snap-start rounded-2xl border border-brand-navy-soft bg-brand-surface p-6 sm:flex-[0_0_46%] lg:flex-[0_0_31%]"
            >
              <h3 className="text-h-menu text-brand-navy">{item.detailTitle ?? item.title}</h3>
              <p className="mt-4 text-body text-brand-navy">{item.detail ?? item.title}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
