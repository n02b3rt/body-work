import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { StatementSection } from "@/components/centrum/StatementSection";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { pageMetadata } from "@/lib/metadata";

const SHOP_ASSESSMENT_URL = "https://bodywork.testowe.eu/zakupy/ocena-funkcjonalna/";

type Block = { heading: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FunctionalAssessment" });
  return pageMetadata({ locale, path: "/trening-personalny/ocena-funkcjonalna", title: t("title") });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function FunctionalAssessmentPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("FunctionalAssessment");
  const tFooter = await getTranslations("Footer");

  const blocks = t.raw("blocks") as Block[];

  return (
    <>
      <PersonalTrainingNav />
      <PageHero title={t("title")} imageSrc="/images/trening-personalny/ocena-hero.webp" imageAlt={t("title")} />

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/trening-personalny/ocena-mark.webp"
      >
        <a href={SHOP_ASSESSMENT_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
          {t("bandCta")}
        </a>
      </CenteredBand>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading>{t("whatHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("whatBody")}</p>
        </Container>
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image
            src="/images/trening-personalny/ocena-czym-jest.webp"
            alt={t("whatHeading")}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Three blocks side by side, copy aligned to the bottom of each column. */}
      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid lg:grid-cols-3 lg:divide-x lg:divide-brand-navy-soft">
          {blocks.map((block, index) => (
            <div key={block.heading} className={index === 0 ? "lg:pr-10" : "lg:px-10"}>
              <StatementSection heading={block.heading} body={block.body} align="left" />
            </div>
          ))}
        </Container>
      </div>

      <section className="border-t border-brand-navy-soft bg-background">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image
            src="/images/trening-personalny/ocena-umow.webp"
            alt={t("bookHeading")}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading>{t("bookHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("bookBody")}</p>
          <a href={`tel:+48${tFooter("phone").replace(/\s/g, "")}`} className={buttonClasses("outline")}>
            {t("bookCta")}
          </a>
        </Container>
      </section>

      <NewsletterSignup />
    </>
  );
}
