import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { blurProps } from "@/lib/static-blur";
import { SectionIntro } from "./SectionIntro";

export type SplitPanel = {
  key: string;
  heading: string;
  body: string;
  ctaLabel: string;
  href: string;
  image: string;
  imageAlt: string;
};

type ThreeWaySplitProps = {
  heading: string;
  body: string;
  items: SplitPanel[];
};

/**
 * The hub's one job: send a visitor to one of three real sites.
 *
 * Every `href` is a different host, so each card is a plain anchor, not next-intl's `Link`. Same
 * tab, not `_blank`: leaving the hub *is* the point of the page. The whole card is clickable
 * through the CTA's stretched `::after`, which keeps exactly one link per card for screen readers.
 */
export function ThreeWaySplit({ heading, body, items }: ThreeWaySplitProps) {
  return (
    <section id="directions" aria-labelledby="directions-heading" className="scroll-mt-16 py-20 lg:py-28">
      <Container>
        <SectionIntro id="directions-heading" heading={heading}>
          <p>{body}</p>
        </SectionIntro>
        <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16 lg:gap-8">
          {items.map((item) => (
            <li
              key={item.key}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-brand-navy-soft/40 bg-white/60 transition-shadow duration-300 focus-within:ring-2 focus-within:ring-brand-green hover:shadow-[0_24px_60px_-30px_rgb(0_30_61/0.45)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden md:aspect-[4/5]">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  sizes="(min-width: 1440px) 440px, (min-width: 768px) 32vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  {...blurProps(item.image)}
                />
              </div>
              <div className="flex flex-1 flex-col p-7 lg:p-9">
                <h3 className="text-h-tile font-normal text-brand-navy">{item.heading}</h3>
                <p className="mt-4 flex-1 text-body text-brand-navy/80">{item.body}</p>
                <a
                  href={item.href}
                  className="mt-8 inline-flex min-h-14 w-fit items-center gap-3 rounded-full bg-brand-navy px-7 text-btn uppercase tracking-[0.1em] text-background transition-colors after:absolute after:inset-0 after:content-[''] group-hover:bg-brand-green focus-visible:outline-none"
                >
                  {item.ctaLabel}
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
