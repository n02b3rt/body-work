"use client";

import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CarouselArrows } from "./CarouselArrows";

export type Testimonial = { quote: string; name: string };

type TestimonialCarouselProps = {
  heading: string;
  items: Testimonial[];
};

/** Quotes carousel. Content comes in as props rather than being read from a fixed
 * translation namespace, because each section page carries its own set. */
export function TestimonialCarousel({ heading, items }: TestimonialCarouselProps) {
  const [autoplay] = useState(() => Autoplay({ delay: 5500, stopOnInteraction: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [autoplay]);

  return (
    <section className="border-t border-brand-navy-soft bg-background py-16 lg:py-24">
      <Container className="flex items-center justify-between gap-6">
        <SectionHeading size="sub">{heading}</SectionHeading>
        <CarouselArrows api={emblaApi} />
      </Container>

      {/* Cards are separated by hairlines (border-r/border-b) rather than being
       * rounded boxes — matches the reference's testimonial slides. */}
      <div className="mt-10 overflow-hidden border-t border-brand-navy-soft" ref={emblaRef}>
        <div className="flex">
          {items.map((item, index) => (
            <blockquote
              key={index}
              className="flex min-w-0 flex-[0_0_85%] flex-col items-center justify-between gap-10 border-b border-r border-brand-navy-soft p-6 text-center text-brand-navy sm:flex-[0_0_50%] lg:flex-[0_0_25%]"
            >
              <span aria-hidden className="font-serif text-5xl leading-none text-brand-navy">
                &ldquo;
              </span>
              <p className="text-body">{item.quote}</p>
              <footer className="text-label font-light uppercase tracking-[1px]">{item.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
