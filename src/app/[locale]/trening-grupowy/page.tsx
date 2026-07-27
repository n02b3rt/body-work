import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { TextMedia } from "@/components/centrum/TextMedia";
import { TestimonialCarousel, type Testimonial } from "@/components/centrum/TestimonialCarousel";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { GroupTrainingNav } from "@/components/centrum/GroupTrainingNav";
import { BlogTeasers } from "@/components/centrum/BlogTeasers";
import { SCHEDULE_URL } from "@/lib/external-links";
import { pageMetadata } from "@/lib/metadata";

const SHOP_PLAN_URL = "https://bodywork.testowe.eu/zakupy/plan-zdrowej-zmiany/";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GroupTraining" });
  return pageMetadata({ locale, path: "/trening-grupowy", title: t("title") });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function GroupTrainingPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("GroupTraining");

  return (
    <>
      <PageHero
        title={t("title")}
        titleSize="display"
        titleAlign="right"
        belowTitle={<GroupTrainingNav />}
        imageSrc="/images/trening-grupowy/hero.webp"
        imageAlt={t("title")}
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-12 py-16 lg:py-24">
          <SectionHeading>{t("leadHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("leadBody")}</p>
        </Container>
      </section>

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/trening-grupowy/hub-mark.webp"
      >
        <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
          {t("bandCta")}
        </a>
      </CenteredBand>

      <TextMedia
        heading={t("classesHeading")}
        body={t("classesBody")}
        imagePosition="right"
        headingUppercase
        imageSrc="/images/trening-grupowy/hub-zajecia.webp"
        imageAlt={t("classesHeading")}
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading>{t("scheduleHeading")}</SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("scheduleBody")}</p>
          <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
            {t("scheduleCta")}
          </a>
        </Container>
      </section>

      <TextMedia
        heading={t("planHeading")}
        body={t("planBody")}
        imagePosition="left"
        headingUppercase
        imageSrc="/images/trening-grupowy/hub-plan.webp"
        imageAlt={t("planHeading")}
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-wrap gap-4 py-10">
          <Link href="/trening-grupowy/plan-zdrowej-zmiany" className={buttonClasses("outline")}>
            {t("planMore")}
          </Link>
          <a href={SHOP_PLAN_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
            {t("planSignUp")}
          </a>
        </Container>
      </section>

      <TestimonialCarousel heading={t("testimonialsHeading")} items={t.raw("testimonials") as Testimonial[]} />
      <BlogTeasers category="trening" />

      <NewsletterSignup />
    </>
  );
}
