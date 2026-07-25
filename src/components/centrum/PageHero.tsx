import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type PageHeroProps = {
  title: string;
  imageSrc?: string;
  imageAlt?: string;
};

/** Page title at display size, optionally followed by a full-bleed photo — the
 * opening of every page in this section. */
export function PageHero({ title, imageSrc, imageAlt }: PageHeroProps) {
  return (
    <>
      <Container className="py-10 lg:py-14">
        <SectionHeading as="h1" size="display" uppercase>
          {title}
        </SectionHeading>
      </Container>
      {imageSrc ? (
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image src={imageSrc} alt={imageAlt ?? ""} fill priority sizes="100vw" className="object-cover" />
        </div>
      ) : null}
    </>
  );
}
