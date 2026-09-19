import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

/**
 * The reference's white bar with the wordmark, minus Centrum's mega-menu: the hub has one page,
 * so all it needs is the way home and the language switch.
 *
 * A server component on purpose: the switch is a plain link between `/` and `/en`, so the hub
 * needs no client-side translations at all (see `hub/layout.tsx`).
 */
export async function Header() {
  const t = await getTranslations("Hub");
  const locale = await getLocale();
  const otherLocale = locale === "pl" ? "en" : "pl";

  return (
    <header className="border-b border-[#cbd0d6] bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:bg-[#003b5e] focus:px-4 focus:py-2 focus:text-white"
      >
        {t("skipToContent")}
      </a>
      <Container className="flex h-[65px] items-center justify-between gap-6">
        <a href={locale === "pl" ? "/" : "/en"} aria-label={t("homeLabel")} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG wordmark, no raster optimization needed */}
          <img src="/icons/logo.svg" width={336} height={46} alt={t("logoAlt")} className="h-6 w-auto" />
        </a>
        <a
          href={otherLocale === "pl" ? "/" : "/en"}
          hrefLang={otherLocale}
          lang={otherLocale}
          aria-label={t("languageSwitchLabel")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#cbd0d6] text-label uppercase text-[#003b5e] transition-colors hover:bg-[#003b5e] hover:text-white"
        >
          {t("languageSwitch")}
        </a>
      </Container>
    </header>
  );
}
