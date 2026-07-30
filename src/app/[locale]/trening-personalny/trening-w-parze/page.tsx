import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { TextMedia } from "@/components/centrum/TextMedia";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { pageMetadata } from "@/lib/metadata";
import { blurFor } from "@/lib/static-blur";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Section = { heading: string; body: string };

const HERO_IMAGE = "/images/trening-personalny/parze-hero.webp";

/** The reference shows a subset of the shared "when is it worth it?" list here,
 * medical training and pregnancy training are omitted on this page. */
const REASON_INDEXES = [0, 1, 2, 3, 6, 7];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PairTraining" });
  return pageMetadata({
    locale,
    path: "/trening-personalny/trening-w-parze",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function PairTrainingPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("PairTraining");
  const tReasons = await getTranslations("TrainingReasons");
  const tFooter = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");

  const sections = t.raw("sections") as Section[];
  const allReasons = tReasons.raw("items") as AccordionItemData[];
  /* Resolved here because `Accordion` is a client component and the blur map is server-only; see
   * the note on `AccordionItemData.imageBlur`. Passing it is also what lets a closed row hold its
   * photo back until somebody opens it. */
  const reasons = REASON_INDEXES.map((index) => allReasons[index]).map((item) => ({
    ...item,
    imageBlur: item.image ? blurFor(item.image) : undefined,
  }));
  const sectionImages = [
    "/images/trening-personalny/parze-przebieg.webp",
    "/images/trening-personalny/parze-plan.webp",
    "/images/trening-personalny/parze-dla-kogo.webp",
  ];

  return (
    <>
      {/* Same shape as the individual-training page: a `Service` whose catalogue is the six
        * focuses this page's own "Kiedy warto?" subset describes, and the trail down from the hub.
        * The entries carry no `url` because they are sections here, not routes. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title").replace(/\.$/, ""),
              description: t("metaDescription"),
              path: "/trening-personalny/trening-w-parze",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              image: HERO_IMAGE,
              variants: reasons.map((item) => ({ name: item.heading })),
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
                { name: tNav("personalTrainingPairs"), path: "/trening-personalny/trening-w-parze" },
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
          <SectionHeading>{t("leadHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("leadBody")}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#kontakt" className={buttonClasses("outline")}>
              {t("leadContact")}
            </Link>
            <Link href="/cennik" className={buttonClasses("outline")}>
              {t("leadPricing")}
            </Link>
          </div>
        </Container>
      </section>

      {sections.map((section, index) => (
        <TextMedia
          key={section.heading}
          heading={section.heading}
          body={section.body}
          imagePosition={index % 2 === 0 ? "right" : "left"}
          headingUppercase
          imageSrc={sectionImages[index]}
          imageAlt={section.heading}
        />
      ))}

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
              <a href={`tel:+48${tFooter("phone").replace(/\s/g, "")}`} className={buttonClasses("outline")}>
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
