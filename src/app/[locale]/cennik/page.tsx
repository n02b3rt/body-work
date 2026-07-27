import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return pageMetadata({ locale, path: "/cennik", title: t("title") });
}

/** Standalone page: the pricing list has no sub-navigation of its own. */
type PageProps = { params: Promise<{ locale: string }> };

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");

  return (
    <>
      <PageHero title={t("title")} titleSize="display" titleAlign="right" />
      <Accordion items={t.raw("items") as AccordionItemData[]} />
    </>
  );
}
