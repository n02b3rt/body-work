import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { TextMedia } from "@/components/centrum/TextMedia";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { TestimonialCarousel, type Testimonial } from "@/components/centrum/TestimonialCarousel";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { DieteticsNav } from "@/components/centrum/DieteticsNav";

type Step = { heading: string; body: string; image: string };

export default async function IwonaStachowiakPage() {
  const t = await getTranslations("DietitianIwona");
  const steps = t.raw("steps") as Step[];

  const pricing: AccordionItemData[] = [{ heading: t("pricingHeading"), body: t("pricingBody") }];

  return (
    <>
      <DieteticsNav />
      <PageHero title={t("title")} imageSrc="/images/dietetyka/iwona-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading className="max-w-5xl">{t("leadHeading")}</SectionHeading>
        </Container>
      </section>

      {/* The four practice photos the reference shows under the intro. */}
      <div className="grid grid-cols-2 border-t border-brand-navy-soft lg:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="relative aspect-square w-full">
            <Image
              src={`/images/dietetyka/iwona/gal-${n}.webp`}
              alt={t("title")}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("aboutHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("aboutBody")}</p>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("processHeading")}</SectionHeading>
        </Container>
      </div>

      {steps.map((step, index) => (
        <TextMedia
          key={step.heading}
          heading={step.heading}
          body={step.body}
          imagePosition={index % 2 === 0 ? "right" : "left"}
          imageSrc={step.image}
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

      <NewsletterSignup />
    </>
  );
}
