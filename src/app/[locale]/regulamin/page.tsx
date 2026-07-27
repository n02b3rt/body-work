import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { LegalDocument, type LegalSection } from "@/components/centrum/LegalDocument";

/** Standalone legal document — the reference gives it no sub-navigation, no imagery
 * and no newsletter block; the footer follows the last section directly. */
export default async function TermsPage() {
  const t = await getTranslations("Terms");

  return (
    <>
      <PageHero title={t("title")} />
      <LegalDocument intro={t("intro")} sections={t.raw("sections") as LegalSection[]} />
    </>
  );
}
