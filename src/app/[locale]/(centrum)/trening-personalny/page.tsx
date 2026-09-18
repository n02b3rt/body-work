import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { StatementSection } from "@/components/centrum/StatementSection";
import { TextMedia } from "@/components/centrum/TextMedia";
import { MediaCardCta } from "@/components/centrum/MediaCardCta";
import { TestimonialCarousel, type Testimonial } from "@/components/centrum/TestimonialCarousel";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { BlogTeasers } from "@/components/centrum/BlogTeasers";
import { GALLERY_URL } from "@/lib/external-links";
import { pageMetadata } from "@/lib/metadata";
import { blurProps } from "@/lib/static-blur";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Block = { heading: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PersonalTraining" });
  return pageMetadata({
    locale,
    path: "/trening-personalny",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function PersonalTrainingPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("PersonalTraining");
  const tFooter = await getTranslations("Footer");
  const tStatements = await getTranslations("Statements");
  const tCommon = await getTranslations("common");

  const specializations = t.raw("specializations") as Block[];
  const services = t.raw("services") as Block[];
  const serviceMeta = [
    { href: "/trening-personalny/trening-indywidualny", image: "/images/trening-personalny/trening-indywidualny.webp" },
    { href: "/trening-personalny/trening-w-parze", image: "/images/trening-personalny/trening-w-parze.webp" },
    { href: "/trening-personalny/ocena-funkcjonalna", image: "/images/trening-personalny/ocena-funkcjonalna.webp" },
  ];

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), path: "/" },
    { name: t("title"), path: "/trening-personalny" },
  ];

  return (
    <>
      {/* A `Service` naming the three variants this hub links to, plus the trail back to the
        * homepage. Both hang off the sitewide business by `@id`. See `src/lib/structured-data.ts`
        * for why there is a catalogue rather than an `Offer`. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title"),
              description: t("metaDescription"),
              path: "/trening-personalny",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              variants: services.map((service, index) => ({
                name: service.heading.replace(/\.$/, ""),
                path: serviceMeta[index].href,
              })),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs, locale)) }}
      />

      {/* Hub page: the title comes first and the sticky sub-nav sits under it,
       * the reverse of the subpages, matching the reference's document order. */}
      <PageHero
        title={t("title")}
        titleSize="display"
        titleAlign="right"
        belowTitle={<PersonalTrainingNav />}
        imageSrc="/images/trening-personalny/hero.webp"
        imageAlt={t("title")}
      />

      <CenteredBand
        eyebrow={t("introEyebrow")}
        heading={t("introHeading")}
        backgroundSrc="/images/trening-personalny/intro-mark.webp"
        body={
          <>
            <p>{t("introBody1")}</p>
            <p className="mt-6">{t("introBody2")}</p>
          </>
        }
      />

      {/* Three specialisations side by side, each with its copy pushed to the bottom
       * so the paragraphs line up across columns, as in the reference. */}
      <div className="border-t border-brand-navy-soft bg-background">
        {/* Three-up from `wide` (1060) rather than `lg` (1024), matching the reference's own
          * `ho:w1-3`, so the column count and the type scale change at the same breakpoint
          * instead of leaving a band where the grid is narrow and the type is already large.
          * `compactHeading` is what actually keeps the headings inside their columns; see the
          * note on that prop. */}
        <Container className="grid wide:grid-cols-3 wide:divide-x wide:divide-brand-navy-soft">
          {specializations.map((block, index) => (
            <div key={block.heading} className={index === 0 ? "wide:pr-10" : "wide:px-10"}>
              <StatementSection heading={block.heading} body={block.body} align="left" compactHeading />
            </div>
          ))}
        </Container>
      </div>

      {services.map((service, index) => (
        <TextMedia
          key={service.heading}
          heading={service.heading}
          body={service.body}
          ctaLabel={tStatements("learnMore")}
          ctaHref={serviceMeta[index].href}
          imagePosition={index % 2 === 0 ? "right" : "left"}
          headingUppercase
          imageSrc={serviceMeta[index].image}
          imageAlt={service.heading}
        />
      ))}

      <section className="border-t border-brand-navy-soft bg-background">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          {/* Measured full-bleed at 485, 669, 1049 and 1469, so `100vw` is honest. The blur
            * placeholder matters here: this is a 668KB photograph in a tall band. */}
          <Image
            src="/images/trening-personalny/sprawnosc.webp"
            alt={t("assessmentHeading")}
            fill
            sizes="100vw"
            className="object-cover"
            {...blurProps("/images/trening-personalny/sprawnosc.webp")}
          />
        </div>
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading>{t("assessmentHeading")}</SectionHeading>
          <div className="max-w-3xl text-body text-brand-navy">
            <p>{t("assessmentBody1")}</p>
            <p className="mt-6">{t("assessmentBody2")}</p>
          </div>
        </Container>
      </section>

      <TestimonialCarousel heading={t("testimonialsHeading")} items={t.raw("testimonials") as Testimonial[]} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("howToHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("howToBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={`tel:+48${tFooter("phone").replace(/\s/g, "")}`} className={buttonClasses("outline")}>
                {t("howToCall")}
              </a>
              <Link href="/cennik" className={buttonClasses("outline")}>
                {t("howToPricing")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid lg:grid-cols-2 lg:divide-x lg:divide-brand-navy-soft">
          <MediaCardCta
            heading={t("teamHeading")}
            imageSrc="/images/trening-personalny/zespol.webp"
            imageAlt={t("teamHeading")}
            ctaLabel={t("teamCta")}
            ctaHref="/trening-personalny/trenerzy"
          />
          <MediaCardCta
            heading={t("spaceHeading")}
            imageSrc="/images/trening-personalny/przestrzen.webp"
            imageAlt={t("spaceHeading")}
            ctaLabel={t("spaceCta")}
            ctaHref={GALLERY_URL}
        external
          />
        </Container>
      </div>
      <BlogTeasers category="trening" />

      <NewsletterSignup />
    </>
  );
}
