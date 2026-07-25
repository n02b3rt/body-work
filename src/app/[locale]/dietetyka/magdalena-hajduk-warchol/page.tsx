import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { TextMedia } from "@/components/centrum/TextMedia";
import { StatementSection } from "@/components/centrum/StatementSection";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { TestimonialCarousel, type Testimonial } from "@/components/centrum/TestimonialCarousel";
import { DieteticsNav } from "@/components/centrum/DieteticsNav";

type Step = { heading: string; body: string; image: string | null };

export default async function MagdalenaHajdukWarcholPage() {
  const t = await getTranslations("DietitianMagda");
  const steps = t.raw("steps") as Step[];

  // The first three steps are text-only in the reference; the last two carry a photo.
  const textSteps = steps.filter((s) => !s.image);
  const mediaSteps = steps.filter((s) => s.image);
  const pricing: AccordionItemData[] = [{ heading: t("pricingHeading"), body: t("pricingBody") }];

  return (
    <>
      <DieteticsNav />
      <PageHero title={t("title")} imageSrc="/images/dietetyka/magda-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading className="max-w-5xl">{t("leadHeading")}</SectionHeading>
        </Container>
      </section>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("aboutHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("aboutBody")}</p>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid lg:grid-cols-3 lg:divide-x lg:divide-brand-navy-soft">
          {textSteps.map((step, index) => (
            <div key={step.heading} className={index === 0 ? "lg:pr-10" : "lg:px-10"}>
              <StatementSection heading={step.heading} body={step.body} align="left" />
            </div>
          ))}
        </Container>
      </div>

      {mediaSteps.map((step, index) => (
        <TextMedia
          key={step.heading}
          heading={step.heading}
          body={step.body}
          imagePosition={index % 2 === 0 ? "right" : "left"}
          imageSrc={step.image as string}
          imageAlt={step.heading}
        />
      ))}

      <Accordion items={pricing} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("bookHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("bookBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={`tel:${t("bookPhone")}`} className={buttonClasses("outline")}>
                {t("bookCall")}
              </a>
              <a href={`mailto:${t("bookMail")}`} className={buttonClasses("outline")}>
                {t("bookEmail")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <TestimonialCarousel heading={t("testimonialsHeading")} items={t.raw("testimonials") as Testimonial[]} />

    </>
  );
}
