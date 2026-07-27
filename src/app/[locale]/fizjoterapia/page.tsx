import { getTranslations } from "next-intl/server";
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
import { GALLERY_URL } from "@/lib/external-links";

const SHOP_PHYSIO_URL = "https://bodywork.testowe.eu/zakupy/fizjoterapia/";

type Section = { heading: string; body: string; image: string };

export default async function PhysiotherapyPage() {
  const t = await getTranslations("Physiotherapy");
  const tFooter = await getTranslations("Footer");

  const sections = t.raw("sections") as Section[];
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
        <a href={SHOP_PHYSIO_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
          {t("bandSignUp")}
        </a>
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
      <Accordion items={t.raw("equipment") as AccordionItemData[]} />

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

      <NewsletterSignup />
    </>
  );
}
