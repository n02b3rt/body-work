import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { TextMedia } from "@/components/centrum/TextMedia";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { MediaCardCta } from "@/components/centrum/MediaCardCta";
import { TestimonialCarousel, type Testimonial } from "@/components/centrum/TestimonialCarousel";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";
import { BlogTeasers } from "@/components/centrum/BlogTeasers";
import { GALLERY_URL } from "@/lib/external-links";
import { pageMetadata } from "@/lib/metadata";
import { blurFor } from "@/lib/static-blur";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Section = { heading: string; body: string; image: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Physiotherapy" });
  return pageMetadata({
    locale,
    path: "/fizjoterapia",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function PhysiotherapyPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Physiotherapy");
  const tFooter = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");

  const sections = t.raw("sections") as Section[];

  // `static-blur` is server-only, so the placeholder is resolved here and handed to the
  // (client) accordion as data; see the note on `AccordionItemData.imageBlur`.
  const equipment = (t.raw("equipment") as AccordionItemData[]).map((item) => ({
    ...item,
    ...(item.image ? { imageBlur: blurFor(item.image) } : {}),
  }));

  // What the service actually breaks down into, in `PhysiotherapyNav`'s order. The sub-nav's
  // fourth entry, `/fizjoterapia/specjalisci`, is deliberately absent: it lists the people, not
  // a therapy, and an `OfferCatalog` entry for it would claim the centre sells "specialists".
  const variants = [
    { name: tNav("physiotherapyManual"), path: "/fizjoterapia/terapia-manualna" },
    { name: tNav("physiotherapyRehab"), path: "/fizjoterapia/rehabilitacja-ruchowa" },
    { name: tNav("physiotherapyBelly"), path: "/fizjoterapia/zdrowy-brzuch" },
  ];

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), path: "/" },
    { name: t("title"), path: "/fizjoterapia" },
  ];
  const phone = `tel:+48${tFooter("phone").replace(/\s/g, "")}`;
  // The reference only puts a CTA under the first and third of these blocks.
  const sectionCta = [
    { label: t("sectionCallCta"), href: phone, external: true },
    null,
    { label: t("sectionPricingCta"), href: "/cennik", external: false },
    null,
  ] as const;

  return (
    <>
      {/* A `Service` naming the four pages this hub links to, plus the trail back to the
        * homepage. Both hang off the sitewide business by `@id`. See `src/lib/structured-data.ts`
        * for why there is a catalogue rather than an `Offer`. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title"),
              description: t("metaDescription"),
              path: "/fizjoterapia",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              variants,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs, locale)) }}
      />

      <PageHero
        title={t("title")}
        titleSize="display"
        titleAlign="right"
        belowTitle={<PhysiotherapyNav />}
        imageSrc="/images/fizjoterapia/hero.webp"
        imageAlt={t("title")}
      />

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/fizjoterapia/hub-mark.webp"
      >
        <Link href="/cennik" className={buttonClasses("outline")}>
          {t("bandPricing")}
        </Link>
      </CenteredBand>

      {sections.map((section, index) => {
        const cta = sectionCta[index];
        return (
          <TextMedia
            key={section.heading}
            heading={section.heading}
            body={section.body}
            ctaLabel={cta && !cta.external ? cta.label : undefined}
            ctaHref={cta && !cta.external ? cta.href : undefined}
            imagePosition={index % 2 === 0 ? "right" : "left"}
            headingUppercase
            imageSrc={section.image}
            imageAlt={section.heading}
          />
        );
      })}

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("equipmentHeading")}</SectionHeading>
        </Container>
      </div>
      <Accordion items={equipment} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid lg:grid-cols-2 lg:divide-x lg:divide-brand-navy-soft">
          <MediaCardCta
            heading={t("teamHeading")}
            imageSrc="/images/fizjoterapia/hub-zespol.webp"
            imageAlt={t("teamHeading")}
            ctaLabel={t("teamCta")}
            ctaHref="/fizjoterapia/specjalisci"
          />
          <MediaCardCta
            heading={t("roomsHeading")}
            imageSrc="/images/fizjoterapia/hub-gabinety.webp"
            imageAlt={t("roomsHeading")}
            ctaLabel={t("roomsCta")}
            ctaHref={GALLERY_URL}
        external
          />
        </Container>
      </div>

      <TestimonialCarousel heading={t("testimonialsHeading")} items={t.raw("testimonials") as Testimonial[]} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
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
      <BlogTeasers category="fizjoterapia" />

      <NewsletterSignup />
    </>
  );
}
