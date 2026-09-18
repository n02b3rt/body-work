import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { TextMedia } from "@/components/centrum/TextMedia";
import { BodylabNav } from "@/components/centrum/BodylabNav";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BodyComposition" });
  return pageMetadata({
    locale,
    path: "/bodylab/analiza-skadu-ciala",
    // Longer than the `<h1>`, which stays "Analiza składu ciała."; see the note on the hub page.
    title: t("seoTitle"),
    // The route shipped a title and nothing else, so no `og:description` either.
    description: t("metaDescription"),
  });
}

/** Route slug intentionally missing the "ł", see BodylabNav. */
type PageProps = { params: Promise<{ locale: string }> };

export default async function BodyCompositionPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("BodyComposition");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("Footer");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title"),
              description: t("metaDescription"),
              path: "/bodylab/analiza-skadu-ciala",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              variants: [],
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tCommon("breadcrumbHome"), path: "/" },
                { name: tNav("bodylab"), path: "/bodylab" },
                { name: t("title"), path: "/bodylab/analiza-skadu-ciala" },
              ],
              locale,
            ),
          ),
        }}
      />

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
