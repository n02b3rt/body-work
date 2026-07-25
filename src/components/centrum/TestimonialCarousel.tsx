"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Testimonial = { quote: string };

export function TestimonialCarousel() {
  const t = useTranslations("Testimonials");
  const items = t.raw("items") as Testimonial[];
  const [autoplay] = useState(() => Autoplay({ delay: 5500, stopOnInteraction: true }));
  const [emblaRef] = useEmblaCarousel({ loop: true }, [autoplay]);

  return (
    <section className="border-t border-brand-navy-soft bg-background py-16 lg:py-24">
      <Container>
        <SectionHeading size="md" className="mb-10">
          {t("heading")}
        </SectionHeading>
      </Container>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8">
          {items.map((item, index) => (
            <blockquote
              key={index}
              className="min-w-0 flex-[0_0_85%] rounded-2xl bg-brand-surface p-8 text-brand-navy sm:flex-[0_0_55%] lg:flex-[0_0_38%]"
            >
              <p className="text-base leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
