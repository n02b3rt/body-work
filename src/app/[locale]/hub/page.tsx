import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ThreeWaySplit } from "@/components/hub/ThreeWaySplit";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/metadata";

/** The hub's own origin: the bare host, see the note in `src/lib/metadata.ts`. */
const HUB_URL = (process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000").replace(/\/$/, "");

/** Same value already hardcoded in `centrum/Header.tsx` and the Centrum homepage's service
 * grid: Akademia has no env var of its own yet, it isn't built (see docs/map.md). */
const ACADEMY_URL = "https://akademia.body-work.pl";
const ALFABET_RUCHU_URL = "https://alfabetruchu.podia.com/";

/**
 * Not `pageMetadata()` from `src/lib/metadata.ts`: that helper is hardwired to Centrum's
 * `SITE_URL`/`SITE_NAME`/RSS feed, since every other caller is a Centrum page. The hub is a
 * different site with a single route, so a plain object is simpler than parameterizing a
 * Centrum-shaped helper for one caller.
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hub" });
  const url = `${HUB_URL}${localePath(locale, "/")}`;

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      // The visitor-facing pair, `/` and `/en`, not the rewritten `/hub` next-intl would infer.
      languages: Object.fromEntries(
        routing.locales.map((code) => [code, `${HUB_URL}${localePath(code, "/")}`]),
      ),
    },
  };
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function HubHomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Hub");
  const centrumUrl = process.env.NEXT_PUBLIC_CENTRUM_URL || "http://centrum.localhost:3000";

  const panels = [
    { heading: t("centrumHeading"), body: t("centrumBody"), ctaLabel: t("cta"), href: centrumUrl },
    { heading: t("akademiaHeading"), body: t("akademiaBody"), ctaLabel: t("cta"), href: ACADEMY_URL },
    {
      heading: t("alfabetRuchuHeading"),
      body: t("alfabetRuchuBody"),
      ctaLabel: t("cta"),
      href: ALFABET_RUCHU_URL,
    },
  ];

  return (
    <>
      <div className="border-b border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading size="hero">{t("missionHeading")}</SectionHeading>
          <p className="mt-8 max-w-3xl text-body text-brand-navy">{t("missionBody")}</p>
        </Container>
      </div>
      <ThreeWaySplit items={panels} />
    </>
  );
}
