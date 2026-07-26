import Image from "next/image";

type FullBleedImageProps = {
  src: string;
  alt: string;
};

/** Full-viewport-height photo break between sections — matches the scraped
 * reference's full-bleed "swiper" moments (e.g. between the two statement banners). */
export function FullBleedImage({ src, alt }: FullBleedImageProps) {
  return (
    <section className="relative h-[70vh] w-full sm:h-screen">
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
    </section>
  );
}
