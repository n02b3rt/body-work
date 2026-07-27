import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { LegalDocument, type LegalSection } from "@/components/centrum/LegalDocument";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });
  return pageMetadata({ locale, path: "/regulamin", title: t("title") });
}

/** Standalone legal document: the reference gives it no sub-navigation, no imagery
 * and no newsletter block; the footer follows the last section directly. */
type PageProps = { params: Promise<{ locale: string }> };

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Terms");

  return (
    <>
      <PageHero title={t("title")} />
      <LegalDocument intro={t("intro")} sections={t.raw("sections") as LegalSection[]} />
    </>
  );
}
