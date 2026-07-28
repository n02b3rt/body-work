import Image from "next/image";
import { blurProps } from "@/lib/static-blur";

type FullBleedImageProps = {
  src: string;
  alt: string;
};

/** Full-viewport-height photo break between sections: matches the scraped
 * reference's full-bleed "swiper" moments (e.g. between the two statement banners).
 *
 * `100vw` is measured rather than assumed: this renders at the full viewport width at 489, 1069,
 * 1469 and 1889. It carries a blur placeholder because it is a tall section that would otherwise
 * open as an empty hole while a large photograph loads. */
export function FullBleedImage({ src, alt }: FullBleedImageProps) {
  return (
    <section className="relative h-[70vh] w-full sm:h-screen">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" {...blurProps(src)} />
    </section>
  );
}
