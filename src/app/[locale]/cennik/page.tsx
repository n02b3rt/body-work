import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/centrum/PageHero";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { pageMetadata } from "@/lib/metadata";
import { priceRangeFrom } from "@/lib/pricing";
import { breadcrumbJsonLd, pricingCatalogJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  return pageMetadata({
    locale,
    path: "/cennik",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
  });
}

/** Standalone page: the pricing list has no sub-navigation of its own. */
type PageProps = { params: Promise<{ locale: string }> };

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");
  const tCommon = await getTranslations("common");
  const items = t.raw("items") as AccordionItemData[];

  /**
   * The structured price list, read back out of the copy above rather than kept as a second list.
   *
   * The row headings are written as sentences ("Trening indywidualny."), which is right on the page
   * and wrong in a schema `name`, so the full stop comes off. A row whose CTA leaves the site (the
   * eFitness calendar) contributes no `url`; see `pricingCatalogJsonLd`.
   */
  const services = items
    .map((item) => {
      const range = priceRangeFrom([item.body, ...(item.groups ?? []).map((group) => group.body)]);
      if (!range) return null;
      const path = item.cta?.href.startsWith("/") ? item.cta.href : undefined;
      return {
        name: item.heading.replace(/\.$/, ""),
        path,
        lowPrice: range.low,
        highPrice: range.high,
        offerCount: range.count,
      };
    })
    .filter((service) => service !== null);

  return (
    <>
      {/* An `OfferCatalog` with a real price range per service: this is the only page on the site
        * whose prices are in the markup, so it is the only one that can declare an `Offer` without
        * inventing a number. Plus the trail back to the homepage. Both hang off the sitewide
        * business by `@id`. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            pricingCatalogJsonLd(locale, { name: t("title"), path: "/cennik", services }),
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
                { name: t("title"), path: "/cennik" },
              ],
              locale,
            ),
          ),
        }}
      />

      <PageHero title={t("title")} titleSize="display" titleAlign="right" />
      <Accordion items={items} />
    </>
  );
}
