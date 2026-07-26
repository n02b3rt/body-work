import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { StatementSection } from "@/components/centrum/StatementSection";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { GroupTrainingNav } from "@/components/centrum/GroupTrainingNav";

const SCHEDULE_URL = "https://bodywork-poznan.cms.efitness.com.pl/kalendarz-zajec";

type Kind = { heading: string; body: string };

export default async function GroupClassesPage() {
  const t = await getTranslations("GroupClasses");
  const tFooter = await getTranslations("Footer");
  const kinds = t.raw("kinds") as Kind[];

  return (
    <>
      <GroupTrainingNav />
      <PageHero title={t("title")} imageSrc="/images/trening-grupowy/zajecia-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading className="max-w-5xl">{t("leadHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("leadBody")}</p>
          <div className="flex flex-wrap gap-4">
            <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
              {t("leadSchedule")}
            </a>
            <Link href="/cennik" className={buttonClasses("outline")}>
              {t("leadPricing")}
            </Link>
          </div>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("kindsHeading")}</SectionHeading>
        </Container>
        <Container className="grid lg:grid-cols-3 lg:divide-x lg:divide-brand-navy-soft">
          {kinds.map((kind, index) => (
            <div key={kind.heading} className={index === 0 ? "lg:pr-10" : "lg:px-10"}>
              <StatementSection heading={kind.heading} body={kind.body} align="left" />
            </div>
          ))}
        </Container>
      </div>

      <CenteredBand
        heading={t("freeHeading")}
        body={<p>{t("freeBody")}</p>}
        backgroundSrc="/images/trening-grupowy/zajecia-mark.webp"
      >
        <a href={`tel:+48${tFooter("phone").replace(/\s/g, "")}`} className={buttonClasses("outline")}>
          {t("freeCta")}
        </a>
      </CenteredBand>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("classesHeading")}</SectionHeading>
        </Container>
      </div>
      <Accordion items={t.raw("classes") as AccordionItemData[]} />

      <NewsletterSignup />
    </>
  );
}
