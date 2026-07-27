import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { TextMedia } from "@/components/centrum/TextMedia";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { pageMetadata } from "@/lib/metadata";

const SHOP_ASSESSMENT_URL = "https://bodywork.testowe.eu/zakupy/ocena-funkcjonalna/";

type Section = { heading: string; body: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "IndividualTraining" });
  return pageMetadata({ locale, path: "/trening-personalny/trening-indywidualny", title: t("title") });
}

export default async function IndividualTrainingPage() {
  const t = await getTranslations("IndividualTraining");
  const tReasons = await getTranslations("TrainingReasons");
  const tFooter = await getTranslations("Footer");

  const sections = t.raw("sections") as Section[];
  const sectionMeta = [
    { image: "/images/trening-personalny/indywidualny-przebieg.webp" },
    { image: "/images/trening-personalny/indywidualny-plan.webp" },
    { image: "/images/trening-personalny/indywidualny-dla-kogo.webp", ctaKey: "sectionCta3", href: "/cennik" },
    { image: "/images/trening-personalny/indywidualny-dieta.webp", ctaKey: "sectionCta4", href: "/dietetyka" },
  ] as const;

  const phone = `tel:+48${tFooter("phone").replace(/\s/g, "")}`;

  return (
    <>
      <PersonalTrainingNav />
      <PageHero
        title={t("title")}
        imageSrc="/images/trening-personalny/indywidualny-hero.webp"
        imageAlt={t("title")}
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading>{t("assessmentHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("assessmentBody")}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href={SHOP_ASSESSMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("outline")}
            >
              {t("assessmentSignUp")}
            </a>
            <Link href="/trening-personalny/ocena-funkcjonalna" className={buttonClasses("outline")}>
              {t("assessmentMore")}
            </Link>
          </div>
        </Container>
      </section>

      {sections.map((section, index) => {
        const meta = sectionMeta[index];
        return (
          <TextMedia
            key={section.heading}
            heading={section.heading}
            body={section.body}
            ctaLabel={"ctaKey" in meta ? t(meta.ctaKey) : undefined}
            ctaHref={"href" in meta ? meta.href : undefined}
            imagePosition={index % 2 === 0 ? "right" : "left"}
            headingUppercase
            imageSrc={meta.image}
            imageAlt={section.heading}
          />
        );
      })}

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/trening-personalny/indywidualny-mark.webp"
      >
        <a href={phone} className={buttonClasses("outline")}>
          {t("bandCall")}
        </a>
        <Link href="/trening-personalny/trenerzy" className={buttonClasses("outline")}>
          {t("bandTrainers")}
        </Link>
      </CenteredBand>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{tReasons("heading")}</SectionHeading>
        </Container>
      </div>
      <Accordion items={tReasons.raw("items") as AccordionItemData[]} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("bookHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("bookBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={phone} className={buttonClasses("outline")}>
                {t("bookCall")}
              </a>
              <a href={`mailto:${tFooter("email")}`} className={buttonClasses("outline")}>
                {t("bookEmail")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <NewsletterSignup />
    </>
  );
}
