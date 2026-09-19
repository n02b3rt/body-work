import Image from "next/image";
import { blurProps } from "@/lib/static-blur";

const SRC = "/images/hub/illustration.webp";

/**
 * The reference's full-width slide (`WEB_SLIDER_WEB-1.png`). There it is a one-slide slider set as a
 * `background-size: cover` at viewport height, which crops most of the drawing away on a phone; here
 * it is the image itself at its own 2127x1194 ratio, so every screen sees all of it.
 *
 * `preload` because on desktop this is the largest thing above the fold, the LCP element. The source
 * is lossless WebP; `next/image` serves it as AVIF, about 34 KB on a phone and 137 KB at 1920.
 */
export function Illustration({ alt }: { alt: string }) {
  return (
    <section aria-label={alt} className="bg-[#eeeeee]">
      <Image
        src={SRC}
        alt={alt}
        width={2127}
        height={1194}
        preload
        fetchPriority="high"
        sizes="100vw"
        className="block h-auto w-full"
        {...blurProps(SRC)}
      />
    </section>
  );
}
