"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

/** One screen, one page: no nav, no mega menu, just the wordmark and the locale switch. */
export function Header() {
  const t = useTranslations("Hub");
  const locale = useLocale();
  const otherLocale = locale === "pl" ? "en" : "pl";

  return (
    <header className="border-b border-brand-navy-soft bg-background">
      <Container className="flex h-[65px] items-center justify-between gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG wordmark, no raster optimization needed */}
        <img src="/icons/logo.svg" width={336} height={46} alt={t("logoAlt")} className="h-6 w-auto" />
        <Link
          href="/"
          locale={otherLocale}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-navy-soft text-label font-light uppercase text-brand-navy hover:opacity-70"
        >
          {t("languageSwitch")}
        </Link>
      </Container>
    </header>
  );
}
