import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { TextMedia } from "@/components/centrum/TextMedia";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { pageMetadata } from "@/lib/metadata";
import { blurFor } from "@/lib/static-blur";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Section = { heading: string; body: string };

const HERO_IMAGE = "/images/trening-personalny/indywidualny-hero.webp";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "IndividualTraining" });
  return pageMetadata({
    locale,
    path: "/trening-personalny/trening-indywidualny",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function IndividualTrainingPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("IndividualTraining");
  const tReasons = await getTranslations("TrainingReasons");
  const tFooter = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");

  const sections = t.raw("sections") as Section[];
  const sectionMeta = [
    { image: "/images/trening-personalny/indywidualny-przebieg.webp" },
    { image: "/images/trening-personalny/indywidualny-plan.webp" },
    { image: "/images/trening-personalny/indywidualny-dla-kogo.webp", ctaKey: "sectionCta3", href: "/cennik" },
    { image: "/images/trening-personalny/indywidualny-dieta.webp", ctaKey: "sectionCta4", href: "/dietetyka" },
  ] as const;

  const phone = `tel:+48${tFooter("phone").replace(/\s/g, "")}`;

  /* The accordion is a client component, so it cannot read the server-only blur map itself;
   * the placeholder is resolved here and handed down, the same way the homepage passes
   * `posterBlur` to `FullBleedVideo`. See the note on `AccordionItemData.imageBlur`. */
  const reasons = (tReasons.raw("items") as AccordionItemData[]).map((item) => ({
    ...item,
    imageBlur: item.image ? blurFor(item.image) : undefined,
  }));

  return (
    <>
      {/* A `Service` for individual training, whose catalogue is the eight focuses the
        * "Kiedy warto?" section below actually describes. They carry no `url` because they are
        * sections of this page rather than routes; see `src/lib/structured-data.ts`.
        *
        * Deliberately **not** a `FAQPage`: those eight headings are topics ("Redukcja tkanki
        * tłuszczowej"), not questions, and dressing them up as `Question`/`Answer` pairs would
        * claim a shape the page does not have. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title").replace(/\.$/, ""),
              description: t("metaDescription"),
              path: "/trening-personalny/trening-indywidualny",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              image: HERO_IMAGE,
              variants: reasons.map((item) => ({ name: item.heading })),
            }),
          ),
        }}
      />
      {/* Three levels, unlike the hub's two: this page sits under `/trening-personalny`, and
        * saying so is the whole point of a breadcrumb trail in the search result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tCommon("breadcrumbHome"), path: "/" },
                { name: tNav("personalTraining"), path: "/trening-personalny" },
                { name: tNav("personalTrainingIndividual"), path: "/trening-personalny/trening-indywidualny" },
              ],
              locale,
            ),
          ),
        }}
      />

      <PersonalTrainingNav />
      <PageHero title={t("title")} imageSrc={HERO_IMAGE} imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading>{t("assessmentHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("assessmentBody")}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/trening-personalny/ocena-funkcjonalna" className={buttonClasses("outline")}>
              {t("assessmentMore")}
            </Link>
          </div>
        </Container>
      </section>

      {sections.map((section, index) => {
        const meta = sectionMeta[index];
        return (
          <TextMedia
            key={section.heading}
            heading={section.heading}
            body={section.body}
            ctaLabel={"ctaKey" in meta ? t(meta.ctaKey) : undefined}
            ctaHref={"href" in meta ? meta.href : undefined}
            imagePosition={index % 2 === 0 ? "right" : "left"}
            headingUppercase
            imageSrc={meta.image}
            imageAlt={section.heading}
          />
        );
      })}

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/trening-personalny/indywidualny-mark.webp"
      >
        <a href={phone} className={buttonClasses("outline")}>
          {t("bandCall")}
        </a>
        <Link href="/trening-personalny/trenerzy" className={buttonClasses("outline")}>
          {t("bandTrainers")}
        </Link>
      </CenteredBand>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{tReasons("heading")}</SectionHeading>
        </Container>
      </div>
      <Accordion items={reasons} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("bookHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("bookBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={phone} className={buttonClasses("outline")}>
                {t("bookCall")}
              </a>
              <a href={`mailto:${tFooter("email")}`} className={buttonClasses("outline")}>
                {t("bookEmail")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <NewsletterSignup />
    </>
  );
}
