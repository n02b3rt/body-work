"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselArrows } from "./CarouselArrows";

type NewsItem = { title: string; detailTitle?: string; detail?: string };

export function NewsCarousel() {
  const t = useTranslations("News");
  const items = t.raw("items") as NewsItem[];
  const [autoplay] = useState(() => Autoplay({ delay: 4500, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [autoplay]);

  return (
    <section className="border-t border-brand-navy-soft bg-background py-16 lg:py-24">
      {/* Arrows sit to the left of the oversized right-aligned heading, as in the
       * reference. */}
      <Container className="flex items-end justify-between gap-6">
        <CarouselArrows api={emblaApi} />
        <SectionHeading uppercase size="display">
          {t("heading")}
        </SectionHeading>
      </Container>
      <div className="mt-10 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
          {items.map((item) => (
            <article
              key={item.title}
              className="min-w-0 flex-[0_0_82%] rounded-2xl border border-brand-navy-soft bg-brand-surface p-6 sm:flex-[0_0_46%] lg:flex-[0_0_31%]"
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
