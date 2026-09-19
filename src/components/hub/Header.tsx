import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

const SECTIONS = ["about", "training", "contact"] as const;

/**
 * A server component on purpose: the switch is a plain link between `/` and `/en`, so the hub
 * needs no client-side translations at all (see `hub/layout.tsx`).
 */
export async function Header() {
  const t = await getTranslations("Hub");
  const locale = await getLocale();
  const otherLocale = locale === "pl" ? "en" : "pl";

  return (
    <header className="sticky top-0 z-30 border-b border-brand-navy-soft/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-full focus:bg-brand-navy focus:px-4 focus:py-2 focus:text-background"
      >
        {t("skipToContent")}
      </a>
      <Container className="flex h-[65px] items-center justify-between gap-6">
        <a href={locale === "pl" ? "/" : "/en"} aria-label={t("homeLabel")} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG wordmark, no raster optimization needed */}
          <img src="/icons/logo.svg" width={336} height={46} alt={t("logoAlt")} className="h-6 w-auto" />
        </a>
        <nav aria-label={t("nav.label")} className="hidden md:block">
          <ul className="flex items-center gap-8 text-label uppercase tracking-[0.15em] text-brand-navy">
            {SECTIONS.map((id) => (
              <li key={id}>
                <a href={`#${id}`} className="py-2 transition-opacity hover:opacity-60">
                  {t(`nav.${id}`)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={otherLocale === "pl" ? "/" : "/en"}
          hrefLang={otherLocale}
          lang={otherLocale}
          aria-label={t("languageSwitchLabel")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-navy-soft text-label font-light uppercase text-brand-navy transition-colors hover:bg-brand-navy hover:text-background"
        >
          {t("languageSwitch")}
        </a>
      </Container>
    </header>
  );
}
