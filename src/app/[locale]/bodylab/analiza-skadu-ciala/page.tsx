import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { TextMedia } from "@/components/centrum/TextMedia";
import { BodylabNav } from "@/components/centrum/BodylabNav";

/** Route slug intentionally missing the "ł" — see BodylabNav. */
export default async function BodyCompositionPage() {
  const t = await getTranslations("BodyComposition");

  return (
    <>
      <BodylabNav />
      <PageHero title={t("title")} imageSrc="/images/bodylab/analiza-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading>{t("leadHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("leadBody")}</p>
        </Container>
      </section>

      <TextMedia
        heading={t("dataHeading")}
        body={t("dataBody")}
        imagePosition="right"
        headingUppercase
        imageSrc="/images/bodylab/analiza-dane.webp"
        imageAlt={t("dataHeading")}
      />

      <TextMedia
        heading={t("measureHeading")}
        body={t("measureBody")}
        imagePosition="left"
        headingUppercase
        imageSrc="/images/bodylab/analiza-mierzymy.webp"
        imageAlt={t("measureHeading")}
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-10 py-16 lg:py-24">
          <SectionHeading className="max-w-5xl">{t("planHeading")}</SectionHeading>
          <Link href="/cennik" className={buttonClasses("outline")}>
            {t("planCta")}
          </Link>
        </Container>
      </section>

    </>
  );
}
