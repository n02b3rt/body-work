import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { StatementSection } from "@/components/centrum/StatementSection";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { BodylabNav } from "@/components/centrum/BodylabNav";
import { pageMetadata } from "@/lib/metadata";

type Block = { heading: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ValdTechnology" });
  return pageMetadata({ locale, path: "/bodylab/technologia-vald", title: t("title") });
}

export default async function ValdTechnologyPage() {
  const t = await getTranslations("ValdTechnology");
  const tFooter = await getTranslations("Footer");
  const tech = t.raw("tech") as Block[];
  const audience = t.raw("audience") as Block[];

  const pricing: AccordionItemData[] = [
    { heading: t("pricingHeading"), body: t("pricingBody"), image: "/images/bodylab/vald-cennik.webp" },
  ];

  return (
    <>
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
          <Image src="/images/bodylab/vald-diag.webp" alt={t("diagHeading")} fill sizes="100vw" className="object-cover" />
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
        <Container className="grid border-l border-t border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
          {audience.map((block) => (
            <div key={block.heading} className="border-b border-r border-brand-navy-soft p-8">
              <StatementSection heading={block.heading} body={block.body} align="left" />
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
          <Image src="/images/bodylab/vald-jak.webp" alt={t("howHeading")} fill sizes="100vw" className="object-cover" />
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
