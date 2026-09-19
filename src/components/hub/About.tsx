import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { blurProps } from "@/lib/static-blur";
import { SectionIntro } from "./SectionIntro";

const IMAGE = "/images/hub/community.webp";

/** "O nas" and "Dlaczego ruch?", word for word from the live homepage. */
export async function About() {
  const t = await getTranslations("Hub.about");
  const body = t.raw("body") as string[];
  const whyBody = t.raw("whyBody") as string[];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-16 border-t border-brand-navy-soft/40 bg-brand-surface py-20 lg:py-28"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionIntro id="about-heading" heading={t("heading")}>
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </SectionIntro>
          <h3 className="mt-12 text-h-menu font-normal text-brand-navy">{t("whyHeading")}</h3>
          <div className="mt-4 max-w-3xl space-y-4 text-body text-brand-navy/80">
            {whyBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-3xl lg:aspect-[4/5]">
          <Image
            src={IMAGE}
            alt={t("imageAlt")}
            fill
            sizes="(min-width: 1440px) 640px, (min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            {...blurProps(IMAGE)}
          />
        </div>
      </Container>
    </section>
  );
}
