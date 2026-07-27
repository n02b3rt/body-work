import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";

/** Standalone page — the pricing list has no sub-navigation of its own. */
export default async function PricingPage() {
  const t = await getTranslations("Pricing");

  return (
    <>
      <PageHero title={t("title")} titleSize="display" titleAlign="right" />
      <Accordion items={t.raw("items") as AccordionItemData[]} />
    </>
  );
}
