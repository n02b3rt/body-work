import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { blurProps } from "@/lib/static-blur";

const HERO_IMAGE = "/images/hub/hero.webp";

/**
 * The live site's manifesto ("Ciało to twój przyjaciel."), word for word, over its own lead photo.
 * The photo is the page's LCP element, hence `preload` (Next 16's replacement for `priority`) and
 * the blur, and the only image on the page that gets either.
 */
export async function Hero() {
  const t = await getTranslations("Hub.hero");
  const lines = t.raw("lines") as string[];

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-brand-navy">
      <Image
        src={HERO_IMAGE}
        alt={t("imageAlt")}
        fill
        preload
        fetchPriority="high"
        sizes="100vw"
        className="-z-10 object-cover object-[50%_35%]"
        {...blurProps(HERO_IMAGE)}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy via-brand-navy/60 to-brand-navy/20"
      />
      <Container className="flex min-h-[70svh] flex-col justify-end pb-14 pt-32 lg:min-h-[min(calc(100svh-65px),760px)] lg:pb-20">
        <h1
          id="hero-heading"
          className="max-w-4xl text-balance text-h-mobile font-normal text-background wide:text-h-hero"
        >
          {t("heading")}
        </h1>
        <ul className="mt-6 max-w-2xl space-y-1 text-body text-background/90">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
