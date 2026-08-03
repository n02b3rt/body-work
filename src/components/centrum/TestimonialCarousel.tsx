"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { carouselViewport, useScrollCarousel } from "@/components/ui/use-scroll-carousel";
import { CarouselArrows } from "./CarouselArrows";

/** Some pages quote clients anonymously, so `name` is optional. */
export type Testimonial = { quote: string; name?: string };

type TestimonialCarouselProps = {
  heading: string;
  items: Testimonial[];
};

/** Quotes carousel. Content comes in as props rather than being read from a fixed
 * translation namespace, because each section page carries its own set. */
export function TestimonialCarousel({ heading, items }: TestimonialCarouselProps) {
  // Quotes stop cycling for good once someone takes hold of them: they are for reading.
  const { ref, scrollPrev, scrollNext } = useScrollCarousel({
    autoplayMs: 5500,
    count: items.length,
    stopOnInteraction: true,
  });

  return (
    <section className="border-t border-brand-navy-soft bg-background py-16 lg:py-24">
      <Container className="flex items-center justify-between gap-6">
        <SectionHeading size="sub">{heading}</SectionHeading>
        <CarouselArrows onPrev={scrollPrev} onNext={scrollNext} />
      </Container>

      {/* Cards are separated by hairlines (border-r/border-b) rather than being
       * rounded boxes: matches the reference's testimonial slides.
       *
       * **A slide is full width on a phone and its content is grouped at the top.** Two things
       * were wrong there, both reported from a real phone. The slide was `85%`, so 15% of the next
       * one hung off the right edge as a sliced column. And `justify-between` on a flex column
       * whose height comes from the **tallest** slide in the track flung a short quote apart: the
       * homepage's longest testimonial is 617 characters and its shortest 69, a ninefold spread, so
       * the short one got its quote mark at the very top, its text floating in the middle and the
       * name pinned far below. That was the "strangely large padding".
       *
       * `justify-between` is what the reference does and it is kept from `sm` up, where several
       * slides share a row and their heights are close. At one slide per view it is the wrong rule:
       * the three parts are grouped and centred instead, which reads as deliberate. The box is
       * still as tall as the longest quote, since that is how a flex track works, but nothing
       * floats apart inside it. */}
      {/* Every quote is rendered twice so the loop has an identical copy to wrap into; the
        * second pass is `aria-hidden` so a screen reader reads each testimonial once. See
        * `use-scroll-carousel.ts`. */}
      <div ref={ref} className={`mt-10 border-t border-brand-navy-soft ${carouselViewport}`}>
        <div className="flex">
          {[...items, ...items].map((item, index) => (
            <blockquote
              key={index}
              aria-hidden={index >= items.length}
              className="flex min-w-0 flex-[0_0_100%] snap-start flex-col items-center justify-center gap-6 border-b border-r border-brand-navy-soft p-6 text-center text-brand-navy sm:flex-[0_0_50%] sm:justify-between sm:gap-10 lg:flex-[0_0_25%]"
            >
              <span aria-hidden className="font-serif text-5xl leading-none text-brand-navy">
                &ldquo;
              </span>
              {/* These are real reviews and one contains "kobido/fizjoterapeutyczne/relaksacyjne",
                * 38 characters with no space and no default break opportunity at a slash. Its
                * min-content width is 335px, so it overran a 252px slide by 66px at a 1024 viewport
                * and painted fragments of itself across the neighbouring testimonial. The copy is
                * quoted verbatim, so the fix belongs here.
                *
                * **`w-full` is half the fix.** `break-words` (`overflow-wrap: break-word`) is
                * ignored when the browser computes an element's min-content contribution, so as a
                * shrink-to-fit flex item this paragraph still got sized to that 335px word and
                * simply overflowed without ever breaking it. Pinning it to the slide is what forces
                * the break. Inert for every quote that already fits. */}
              <p className="w-full break-words text-body">{item.quote}</p>
              {item.name ? (
                <footer className="text-label font-light uppercase tracking-[1px]">{item.name}</footer>
              ) : null}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
