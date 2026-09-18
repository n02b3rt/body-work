import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";
import { pageMetadata } from "@/lib/metadata";
import { blurFor } from "@/lib/static-blur";
import { breadcrumbJsonLd, serviceJsonLd, therapyJsonLd } from "@/lib/structured-data";

const HERO = "/images/fizjoterapia/manualna-hero.webp";
const OG_IMAGE = "/images/og/fizjoterapia-terapia-manualna.jpg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ManualTherapy" });
  return pageMetadata({
    locale,
    path: "/fizjoterapia/terapia-manualna",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
    image: OG_IMAGE,
    imageWidth: 1200,
    imageHeight: 630,
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function ManualTherapyPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("ManualTherapy");
  const tFooter = await getTranslations("Footer");
  const tCommon = await getTranslations("common");
  const tPhysio = await getTranslations("Physiotherapy");
  const phone = `tel:+48${tFooter("phone").replace(/\s/g, "")}`;

  // `static-blur` is server-only, so the placeholder is resolved here and handed to the (client)
  // accordion as data; see the note on `AccordionItemData.imageBlur`. Passing it is also what makes
  // the accordion hold each photo back until its row is opened.
  const conditions = (t.raw("conditions") as AccordionItemData[]).map((item) => ({
    ...item,
    ...(item.image ? { imageBlur: blurFor(item.image) } : {}),
  }));

  // The displayed title ends in a full stop, which is the reference's house style for a page
  // heading and wrong in a breadcrumb or a `Service` name, both of which can end up in a search
  // result.
  const name = t("title").replace(/\.$/, "");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), path: "/" },
    { name: tPhysio("title"), path: "/fizjoterapia" },
    { name, path: "/fizjoterapia/terapia-manualna" },
  ];

  return (
    <>
      {/* Three blocks doing three different jobs: what the centre sells (`Service`, hanging off the
        * sitewide business by `@id`), what the therapy is *for* (`MedicalTherapy`, whose
        * `indication` list is the ten condition headings below), and the trail back to the hub. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name,
              description: t("metaDescription"),
              path: "/fizjoterapia/terapia-manualna",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              image: HERO,
              variants: [],
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            therapyJsonLd(locale, {
              name,
              description: t("bandBody"),
              path: "/fizjoterapia/terapia-manualna",
              image: HERO,
              conditions: conditions.map((item) => item.heading),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs, locale)) }}
      />

      <PhysiotherapyNav />
      <PageHero title={t("title")} imageSrc={HERO} imageAlt={t("title")} />

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/fizjoterapia/manualna-mark.webp"
      />

      <Accordion items={conditions} />

      <section className="border-t border-brand-navy-soft bg-background">
        {/* `grid-cols-1` explicitly: an implicit `auto` track is floored at its min-content width,
          * so one long Polish heading can size the whole section wider than the page. Tailwind's
          * `grid-cols-*` are `minmax(0, 1fr)`, which removes that floor and changes nothing else.
          * Measured breaking on `/fizjoterapia/specjalisci` at 320 and 360px. */}
        <Container className="grid grid-cols-1 gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("howToHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("howToBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={phone} className={buttonClasses("outline")}>
                {t("howToCall")}
              </a>
              <a href={`mailto:${tFooter("email")}`} className={buttonClasses("outline")}>
                {t("howToEmail")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <NewsletterSignup />
    </>
  );
}
