import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { LegalDocument, type LegalSection } from "@/components/centrum/LegalDocument";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return pageMetadata({ locale, path: "/polityka-prywatnosci", title: t("title") });
}

/** Same shape as `/regulamin`, see `LegalDocument`. */
type PageProps = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Privacy");

  return (
    <>
      <PageHero title={t("title")} />
      <LegalDocument intro={t("intro")} sections={t.raw("sections") as LegalSection[]} />
    </>
  );
}
