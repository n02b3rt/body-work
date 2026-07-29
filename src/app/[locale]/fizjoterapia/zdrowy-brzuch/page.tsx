import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";
import { pageMetadata } from "@/lib/metadata";

type Lead = { name: string; body: string; image: string };
type Format = { heading: string; price: string; duration: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HealthyBelly" });
  return pageMetadata({ locale, path: "/fizjoterapia/zdrowy-brzuch", title: t("title") });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function HealthyBellyPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("HealthyBelly");
  const leads = t.raw("leads") as Lead[];
  const formats = t.raw("formats") as Format[];

  const leadItems: AccordionItemData[] = leads.map((l) => ({
    heading: l.name,
    body: l.body,
    image: l.image,
  }));

  return (
    <>
      <PhysiotherapyNav />
      <PageHero title={t("title")} imageSrc="/images/fizjoterapia/brzuch-hero.webp" imageAlt={t("title")} />

      <CenteredBand
        eyebrow={t("leadEyebrow")}
        heading={t("leadHeading")}
        body={<p>{t("leadBody")}</p>}
        backgroundSrc="/images/fizjoterapia/brzuch-mark.webp"
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("aboutHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("aboutBody")}</p>
        </Container>
      </section>

      {/* Illustration on the left filling its half, copy on the right. */}
      <section className="grid border-t border-brand-navy-soft bg-background lg:grid-cols-2">
        <div className="relative min-h-[22rem] w-full lg:min-h-[34rem]">
          <Image
            src="/images/fizjoterapia/brzuch-projekt.webp"
            alt={t("qualifyHeading")}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-16 px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
          <SectionHeading>{t("qualifyHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("qualifyBody")}</p>
        </div>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("leadsHeading")}</SectionHeading>
        </Container>
      </div>
      <Accordion items={leadItems} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("formatsHeading")}</SectionHeading>
        </Container>
        <Container className="grid border-l border-t border-brand-navy-soft lg:grid-cols-2">
          {formats.map((format) => (
            <div
              key={format.heading}
              className="flex flex-col items-start gap-6 border-b border-r border-brand-navy-soft p-8 lg:p-12"
            >
              <SectionHeading as="h3" size="sub">
                {format.heading}
              </SectionHeading>
              <p className="text-body text-brand-navy">
                {format.price}
                <br />
                {format.duration}
              </p>
            </div>
          ))}
        </Container>
      </div>

      <NewsletterSignup />
    </>
  );
}
