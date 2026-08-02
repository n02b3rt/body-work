import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { pageMetadata } from "@/lib/metadata";
import { blurProps } from "@/lib/static-blur";
import { breadcrumbJsonLd, trainerListJsonLd } from "@/lib/structured-data";

type Trainer = { name: string; specialisation: string; bio: string; image: string };
type Category = { heading: string; body: string; image: string; trainers: Trainer[] };

/**
 * Measured, not guessed: a portrait cell is the container's inner width divided by the column
 * count, less the card's own `p-8`. That comes to 294px at a 390 viewport, 296 at 768, and a fixed
 * 395 from 1440 up, where `Container`'s cap stops it growing.
 *
 * The old value was `(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw`, which is written
 * purely in viewport units and so claimed the **whole** column including padding: 634px for a 395px
 * cell at 1920, and 390 for a 294px cell on a phone. Naming pixel lengths also lets the srcset
 * reach `imageSizes` (384, 480) instead of being built from `deviceSizes` alone, whose floor is
 * 640 — which is what a phone was being handed for every one of the nineteen portraits.
 */
const PORTRAIT_SIZES =
  "(min-width: 1440px) 395px, (min-width: 1024px) calc(33.333vw - 85px), (min-width: 640px) calc(50vw - 88px), calc(100vw - 96px)";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Trainers" });
  return pageMetadata({
    locale,
    path: "/trening-personalny/trenerzy",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function TrainersPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Trainers");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");
  const categories = t.raw("categories") as Category[];
  /* `jobTitle` comes from the category, not from `trainer.specialisation`: that string is the
   * reference's own display label, "SPECJALIZACJA — TRENING MEDYCZNY", prefix and shouting
   * included. It is right on the page and wrong in structured data, where the value should be the
   * role itself. The category heading already *is* that role, correctly cased. */
  const people = categories.flatMap((category) =>
    category.trainers.map((trainer) => ({
      name: trainer.name,
      jobTitle: category.heading,
      image: trainer.image,
    })),
  );

  return (
    <>
      {/* Nineteen named people with a role and a photograph: an `ItemList` of `Person`, each
        * working for the sitewide business. See `src/lib/structured-data.ts` for why the bios
        * are not repeated here. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            trainerListJsonLd(locale, {
              name: t("title").replace(/\.$/, ""),
              path: "/trening-personalny/trenerzy",
              people,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tCommon("breadcrumbHome"), path: "/" },
                { name: tNav("personalTraining"), path: "/trening-personalny" },
                { name: tNav("personalTrainingTrainers"), path: "/trening-personalny/trenerzy" },
              ],
              locale,
            ),
          ),
        }}
      />

      <PersonalTrainingNav />
      <PageHero title={t("title")} imageSrc="/images/trening-personalny/trenerzy-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-12 py-16 lg:py-24">
          <SectionHeading>{t("leadHeading")}</SectionHeading>
          {/* Oversized statement copy, as on the homepage's opening block. */}
          <p className="max-w-5xl text-body text-brand-navy wide:text-statement">{t("leadBody")}</p>
        </Container>
      </section>

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/trening-personalny/trenerzy-mark.webp"
      />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{t("directionsHeading")}</SectionHeading>
        </Container>
      </div>

      {categories.map((category) => (
        <section key={category.heading} className="border-t border-brand-navy-soft bg-background">
          {/* `grid-cols-1` explicitly: an implicit `auto` track is floored at its min-content
            * width, so "TRENING FUNKCJONALNY" at the mobile heading size kept this row wider than
            * a small phone and pushed the page sideways. Tailwind's `grid-cols-*` are
            * `minmax(0, 1fr)`, which removes that floor and changes nothing else, since the single
            * track already filled the container. `break-words` on the heading is not enough on its
            * own here: `overflow-wrap` lets text wrap but does **not** lower the intrinsic
            * min-content width a grid track is sized against. Same fix as the accordion panel. */}
          <Container className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <SectionHeading uppercase>{category.heading}</SectionHeading>
            <p className="text-body text-brand-navy">{category.body}</p>
          </Container>

          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
            {/* Full-bleed at every measured width, so `100vw` is honest. */}
            <Image
              src={category.image}
              alt={category.heading}
              fill
              sizes="100vw"
              className="object-cover"
              {...blurProps(category.image)}
            />
          </div>

          {/* Portrait, name, specialisation and bio: one row per trainer, hairline
           * separated like the reference's list. */}
          <Container className="grid border-l border-t border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
            {category.trainers.map((trainer) => (
              /* `min-w-0`: a grid item defaults to `min-width: auto`, so the card refused to
               * shrink below its longest name and pushed the whole page sideways on a small
               * phone. Measured at a 320px viewport: the card floored at 294px (a 228px
               * min-content `h3` plus its own `p-8`) inside a 273px column, and the document
               * came out 330px wide against a 305px viewport. The name needs `break-words` with
               * it, because `min-w-0` alone lets the word spill out of the shrunken box instead
               * of wrapping inside it — the same pairing as the accordion row titles. */
              <article
                key={`${category.heading}-${trainer.name}`}
                className="flex min-w-0 flex-col gap-6 border-b border-r border-brand-navy-soft p-8"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={trainer.image}
                    alt={trainer.name}
                    fill
                    sizes={PORTRAIT_SIZES}
                    className="object-cover"
                    {...blurProps(trainer.image)}
                  />
                </div>
                <div>
                  <h3 className="hyphens-auto break-words text-h-menu uppercase text-brand-navy">
                    {trainer.name}
                  </h3>
                  <p className="mt-3 text-label uppercase tracking-[1px] text-brand-navy/70">
                    {trainer.specialisation}
                  </p>
                </div>
                <p className="text-body text-brand-navy">{trainer.bio}</p>
              </article>
            ))}
          </Container>
        </section>
      ))}

      <NewsletterSignup />
    </>
  );
}
