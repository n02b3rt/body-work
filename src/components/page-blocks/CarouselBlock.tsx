import { asArray, asRecord, aspect, bool, gap, num, radius, str } from "@/lib/component-values";
import { mediaFrom } from "@/lib/media";
import { CarouselTrack, type CarouselSlide } from "./CarouselTrack";

/** Sliding photographs with captions. */
export function CarouselBlock({ data }: { data: unknown }) {
  const carousel = asRecord(data);

  const slides = asArray(carousel.slides).reduce<CarouselSlide[]>((acc, slide) => {
    const image = mediaFrom(slide.image, "content", str(slide.caption));
    if (!image) return acc;
    acc.push({
      alt: image.alt,
      blurDataURL: image.blurDataURL,
      caption: str(slide.caption) || undefined,
      href: str(slide.href) || undefined,
      url: image.url,
    });
    return acc;
  }, []);

  if (slides.length === 0) return null;

  const perView = Math.min(Math.max(Math.round(num(Number(carousel.slidesPerView), 1)), 1), 3);

  return (
    <CarouselTrack
      aspectRatio={aspect(carousel.aspectRatio, "16-9")}
      autoplay={bool(carousel.autoplay)}
      gap={gap(carousel.gap)}
      interval={num(carousel.interval, 5)}
      loop={bool(carousel.loop)}
      radius={radius(carousel.radius, "md")}
      showArrows={bool(carousel.showArrows)}
      showDots={bool(carousel.showDots)}
      slides={slides}
      slidesPerView={perView}
    />
  );
}
