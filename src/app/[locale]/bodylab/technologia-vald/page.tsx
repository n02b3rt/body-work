import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { StatementSection } from "@/components/centrum/StatementSection";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { BodylabNav } from "@/components/centrum/BodylabNav";
import { blurFor, blurProps } from "@/lib/static-blur";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Block = { heading: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ValdTechnology" });
  return pageMetadata({
    locale,
    path: "/bodylab/technologia-vald",
    // Longer than the `<h1>`, which stays "Technologia VALD."; see the note on the hub page.
    title: t("seoTitle"),
    // The route shipped a title and nothing else, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function ValdTechnologyPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("ValdTechnology");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("Footer");
  const tech = t.raw("tech") as Block[];
  const audience = t.raw("audience") as Block[];

  const pricingImage = "/images/bodylab/vald-cennik.webp";
  const pricing: AccordionItemData[] = [
    {
      heading: t("pricingHeading"),
      body: t("pricingBody"),
      image: pricingImage,
      // `Accordion` is a client component, so it takes the placeholder as data rather than
      // importing the server-only map; same arrangement as the equipment list on /fizjoterapia.
      imageBlur: blurFor(pricingImage),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title"),
              description: t("metaDescription"),
              path: "/bodylab/technologia-vald",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              variants: [],
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
                { name: tNav("bodylab"), path: "/bodylab" },
                { name: t("title"), path: "/bodylab/technologia-vald" },
              ],
              locale,
            ),
          ),
        }}
      />

      <BodylabNav />
      <PageHero title={t("title")} imageSrc="/images/bodylab/vald-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading>{t("leadHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("leadBody")}</p>
        </Container>
      </section>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading>{t("diagHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("diagBody")}</p>
        </Container>
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          {/* Full-bleed, so `100vw` is honest; lazy by default, which is why the placeholder covers
            * the gap before a 2048px photograph decodes. */}
          <Image
            src="/images/bodylab/vald-diag.webp"
            alt={t("diagHeading")}
            fill
            sizes="100vw"
            className="object-cover"
            {...blurProps("/images/bodylab/vald-diag.webp")}
          />
        </div>
      </section>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("benefitsHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("benefitsBody")}</p>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{t("techHeading")}</SectionHeading>
        </Container>
        <Container className="grid lg:grid-cols-2 lg:divide-x lg:divide-brand-navy-soft">
          {tech.map((block, index) => (
            <div key={block.heading} className={index === 0 ? "lg:pr-10" : "lg:pl-10"}>
              <StatementSection heading={block.heading} body={block.body} align="left" />
            </div>
          ))}
        </Container>
      </div>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{t("audienceHeading")}</SectionHeading>
        </Container>
        {/* `grid-cols-1` is not redundant: with no base column count the single implicit track is
          * `auto`, which is floored at the widest word in the cell, and the cells then measured
          * 340px inside a 328px container at a 360 viewport. */}
        <Container className="grid grid-cols-1 border-l border-t border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
          {audience.map((block) => (
            <div key={block.heading} className="border-b border-r border-brand-navy-soft p-8">
              {/* Three-up, so the heading holds its mobile step: a third of this row is 262px at a
                * 1060 viewport and "Rehabilitacji" alone needs about 440px at the `section` size.
                * Same call as the specialisations grid on /trening-personalny. */}
              <StatementSection heading={block.heading} body={block.body} align="left" compactHeading />
            </div>
          ))}
        </Container>
      </div>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("howHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("howBody")}</p>
        </Container>
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image
            src="/images/bodylab/vald-jak.webp"
            alt={t("howHeading")}
            fill
            sizes="100vw"
            className="object-cover"
            {...blurProps("/images/bodylab/vald-jak.webp")}
          />
        </div>
      </section>

      <Accordion items={pricing} />

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

    </>
  );
}
