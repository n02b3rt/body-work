import type { ReactNode } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";

type PageHeroProps = {
  title: string;
  /** The reference only uses the fit-to-width display size for a section's hub page;
   * its subpages get the ordinary section heading size. */
  titleSize?: "display" | "section";
  /** Slot between the title and the photo — the hub page puts its sticky sub-nav
   * here, whereas subpages render that nav above the title instead. */
  belowTitle?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
};

export function PageHero({ title, titleSize = "section", belowTitle, imageSrc, imageAlt }: PageHeroProps) {
  return (
    <>
      <Container className="py-10 lg:py-14">
        {/* A title may carry its own line breaks — the reference hard-codes a `<br>` in
         * the Plan Zdrowej Zmiany heading to hang the edition date on a second line.
         * Applied only when there is one, because `display` titles set
         * `whitespace-nowrap` and two whitespace utilities would collide. */}
        <SectionHeading
          as="h1"
          size={titleSize}
          uppercase
          className={cn(
            // Every hub title on the reference carries `ho:tar` — right-aligned from
            // 1060px up. Its subpage titles and the `/kontakt/` one do not.
            titleSize === "display" && "wide:text-right",
            title.includes("\n") && "whitespace-pre-line",
          )}
        >
          {title}
        </SectionHeading>
      </Container>
      {belowTitle}
      {imageSrc ? (
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image src={imageSrc} alt={imageAlt ?? ""} fill priority sizes="100vw" className="object-cover" />
        </div>
      ) : null}
    </>
  );
}
