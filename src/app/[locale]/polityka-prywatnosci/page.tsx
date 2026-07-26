import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { LegalDocument, type LegalSection } from "@/components/centrum/LegalDocument";

/** Same shape as `/regulamin` — see `LegalDocument`. */
export default async function PrivacyPage() {
  const t = await getTranslations("Privacy");

  return (
    <>
      <PageHero title={t("title")} />
      <LegalDocument intro={t("intro")} sections={t.raw("sections") as LegalSection[]} />
    </>
  );
}
