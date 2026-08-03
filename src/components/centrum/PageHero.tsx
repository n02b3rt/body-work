import type { ReactNode } from "react";
import Image from "next/image";
import { blurProps } from "@/lib/static-blur";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

type PageHeroProps = {
  title: string;
  /** The reference only uses the fit-to-width display size for a section's hub page;
   * its subpages get the ordinary section heading size. */
  titleSize?: "display" | "section";
  /** Explicit, because it does **not** follow from the size: the reference right-aligns
   * its hub titles (`ho:tar`) but left-aligns `/kontakt` and its subpage titles, both of
   * which are otherwise styled the same. Inferring it from `titleSize` got `/kontakt`
   * wrong. */
  titleAlign?: "left" | "right";
  /** Slot between the title and the photo: the hub page puts its sticky sub-nav
   * here, whereas subpages render that nav above the title instead. */
  belowTitle?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

export function PageHero({
  title,
  titleSize = "section",
  titleAlign = "left",
  belowTitle,
  imageSrc,
  imageAlt,
}: PageHeroProps) {
  return (
    <>
      <Container className="py-10 lg:py-14">
        {/* A title may carry its own line breaks: the reference hard-codes a `<br>` in
         * the Plan Zdrowej Zmiany heading to hang the edition date on a second line.
         * Applied only when there is one, because `display` titles set
         * `whitespace-nowrap` and two whitespace utilities would collide. */}
        <SectionHeading
          as="h1"
          size={titleSize}
          uppercase
          className={cn(
            // The reference switches alignment only from 1060px up (`ho:tar`).
            titleAlign === "right" && "wide:text-right",
            title.includes("\n") && "whitespace-pre-line",
          )}
        >
          {title}
        </SectionHeading>
      </Container>
      {belowTitle}
      {imageSrc ? (
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          {/* This is the page's LCP element, so it needs both halves of the job: `preload`
            * puts the request in `<head>` where the browser finds it without parsing the
            * body, and `fetchPriority` tells it to jump the queue once found.
            *
            * `priority` used to be the single prop for both. Next 16 deprecated it in favour
            * of `preload` and, in doing so, stopped emitting `fetchPriority="high"` with it:
            * the served HTML had the preload link and not one high-priority image on it.
            * (node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md.)
            *
            * `100vw` is honest: measured full-bleed at 485, 669, 1049 and 1469. The blur
            * placeholder covers the gap before a large hero photograph decodes. */}
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
            {...blurProps(imageSrc)}
          />
        </div>
      ) : null}
    </>
  );
}
