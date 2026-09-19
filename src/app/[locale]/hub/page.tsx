import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Contact } from "@/components/hub/Contact";
import { Illustration } from "@/components/hub/Illustration";
import { ThreeWaySplit, type SplitPanel } from "@/components/hub/ThreeWaySplit";
import { routing } from "@/i18n/routing";
import { FACEBOOK_URL, INSTAGRAM_URL, MAP_URL } from "@/lib/external-links";
import { hubJsonLd } from "@/lib/hub-jsonld";
import { localePath } from "@/lib/metadata";
import { ACADEMY_URL, ALFABET_RUCHU_URL, CENTRUM_URL, HUB_URL } from "./urls";

/** 1200x630 JPEG cut from the illustration by `scripts/generate-og-images.mjs`. */
const OG_IMAGE = "/images/og/hub.jpg";

/** Centrum's coordinates, the same point `MAP_URL` drops its pin on. */
const GEO = { latitude: 52.4182498, longitude: 16.8907633 };

type PageProps = { params: Promise<{ locale: string }> };

/**
 * Not `pageMetadata()` from `src/lib/metadata.ts`: that helper is hardwired to Centrum's
 * `SITE_URL`/`SITE_NAME`/RSS feed. The hub is a different site with a single route.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hub" });
  const url = `${HUB_URL}${localePath(locale, "/")}`;
  const image = { url: OG_IMAGE, width: 1200, height: 630, alt: t("illustrationAlt") };

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      // The visitor-facing pair, `/` and `/en`, not the rewritten `/hub` next-intl would infer.
      languages: {
        ...Object.fromEntries(routing.locales.map((code) => [code, `${HUB_URL}${localePath(code, "/")}`])),
        "x-default": `${HUB_URL}/`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "BODYWORK",
      locale: locale === "pl" ? "pl_PL" : "en_GB",
      alternateLocale: locale === "pl" ? ["en_GB"] : ["pl_PL"],
      url,
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [image],
    },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  };
}

export default async function HubHomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Hub");
  const f = await getTranslations("Footer");

  const panels: SplitPanel[] = [
    { key: "centrum", href: `${CENTRUM_URL}${localePath(locale, "/")}` },
    { key: "akademia", href: ACADEMY_URL },
    { key: "alfabetRuchu", href: ALFABET_RUCHU_URL },
  ].map((panel) => ({
    ...panel,
    heading: t(`${panel.key}Heading`),
    body: t(`${panel.key}Body`),
    ctaLabel: t("cta"),
  }));

  const [postalCode, ...city] = f("addressLine3").split(" ");

  const jsonLd = hubJsonLd({
    locale,
    hubUrl: HUB_URL,
    pageUrl: `${HUB_URL}${localePath(locale, "/")}`,
    centrumUrl: `${CENTRUM_URL}/`,
    academyUrl: ACADEMY_URL,
    alfabetRuchuUrl: ALFABET_RUCHU_URL,
    title: t("metaTitle"),
    description: t("metaDescription"),
    logo: "/apple-touch-icon.png",
    image: OG_IMAGE,
    sameAs: [FACEBOOK_URL, INSTAGRAM_URL],
    contact: {
      streetAddress: f("addressLine2"),
      postalCode,
      city: city.join(" "),
      phone: f("phone"),
      email: f("email"),
      trainingPhone: t("contact.trainingPhone"),
      trainingEmail: t("contact.trainingEmail"),
      ...GEO,
      mapUrl: MAP_URL,
    },
    destinations: {
      centrum: { name: t("centrumHeading"), description: t("centrumBody") },
      academy: { name: t("akademiaHeading"), description: t("akademiaBody") },
      alfabetRuchu: { name: t("alfabetRuchuHeading"), description: t("alfabetRuchuBody") },
    },
    faq: [],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ThreeWaySplit pageHeading={t("pageHeading")} items={panels} />
      <Illustration alt={t("illustrationAlt")} />
      <Contact />
    </>
  );
}
