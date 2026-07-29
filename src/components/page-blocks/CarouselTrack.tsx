"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CarouselArrows } from "@/components/centrum/CarouselArrows";
import { Link } from "@/i18n/navigation";

export type CarouselSlide = {
  alt: string;
  blurDataURL?: string;
  caption?: string;
  href?: string;
  url: string;
};

type Props = {
  aspectRatio: string;
  autoplay: boolean;
  gap: string;
  interval: number;
  loop: boolean;
  radius: string;
  showArrows: boolean;
  showDots: boolean;
  slides: CarouselSlide[];
  slidesPerView: number;
};

const BASIS: Record<number, string> = {
  1: "100%",
  2: "50%",
  3: "33.3333%",
};

/** Embla-backed slider, matching how the hand-built carousels on the site are wired. */
export function CarouselTrack({
  aspectRatio,
  autoplay,
  gap,
  interval,
  loop,
  radius,
  showArrows,
  showDots,
  slides,
  slidesPerView,
}: Props) {
  const t = useTranslations("Carousel");
  const [plugin] = useState(() =>
    autoplay
      ? [Autoplay({ delay: Math.max(interval, 1) * 1000, stopOnInteraction: false })]
      : [],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop }, plugin);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback((api: { selectedScrollSnap: () => number }) => {
    setSelected(api.selectedScrollSnap());
  }, []);

  // Subscribe only: reading the snap synchronously here would be a setState in
  // an effect body, which the React Compiler rejects. `selected` starts at 0
  // because that is where embla starts with no `startIndex`, and `reInit`
  // covers the case where slides change under it.
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const basis = BASIS[slidesPerView] ?? BASIS[1]!;
  const sizes =
    slidesPerView >= 3
      ? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      : slidesPerView === 2
        ? "(min-width: 640px) 50vw, 100vw"
        : "100vw";

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex" style={{ gap }}>
          {slides.map((slide, index) => {
            const picture = (
              <span
                className="relative block w-full overflow-hidden"
                style={{ aspectRatio, borderRadius: radius }}
              >
                <Image
                  alt={slide.alt}
                  className="object-cover"
                  fill
                  sizes={sizes}
                  src={slide.url}
                  {...(slide.blurDataURL
                    ? { placeholder: "blur" as const, blurDataURL: slide.blurDataURL }
                    : {})}
                />
              </span>
            );

            return (
              <figure
                className="m-0 min-w-0 shrink-0 grow-0"
                key={`${slide.url}-${index}`}
                style={{ flexBasis: `calc(${basis} - ${gap})` }}
              >
                {slide.href ? (
                  <SlideLink href={slide.href}>{picture}</SlideLink>
                ) : (
                  picture
                )}
                {slide.caption ? (
                  <figcaption className="pt-2 text-label">{slide.caption}</figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </div>

      {showArrows && slides.length > slidesPerView ? (
        <CarouselArrows api={emblaApi} className="self-center" />
      ) : null}

      {showDots && slides.length > slidesPerView ? (
        <div className="flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              aria-label={t("goTo", { index: index + 1 })}
              className={`h-2 w-2 rounded-full transition-opacity ${
                index === selected ? "bg-brand-navy" : "bg-brand-navy/30"
              }`}
              key={`${slide.url}-dot-${index}`}
              onClick={() => emblaApi?.scrollTo(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SlideLink({ children, href }: { children: React.ReactNode; href: string }) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  return isInternal ? (
    <Link className="block" href={href}>
      {children}
    </Link>
  ) : (
    <a className="block" href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}
