import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

/**
 * The reference's legal bar (right-aligned "POLITYKA PRYWATNOŚCI | REGULAMIN") and its navy footer
 * (the mark, the wordmark, "Ciało to inwestycja."). The legal pages live on Centrum, the one site
 * that has them, so the hub links across instead of duplicating them.
 */
export async function Footer({ centrumUrl, locale }: { centrumUrl: string; locale: string }) {
  const t = await getTranslations("Hub");
  const f = await getTranslations("Footer");
  const prefix = locale === "pl" ? "" : `/${locale}`;

  return (
    <footer>
      <nav
        aria-label={`${f("privacyPolicy")}, ${f("terms")}`}
        className="flex min-h-[50px] items-center justify-center gap-6 border-t border-[#cbd0d6] bg-white px-4 text-[0.6875rem] uppercase tracking-[0.04em] text-[#003b5e] sm:justify-end"
      >
        <a href={`${centrumUrl}${prefix}/polityka-prywatnosci`} className="py-3 hover:underline">
          {f("privacyPolicy")}
        </a>
        <span aria-hidden className="text-[#7f7f7f]">
          |
        </span>
        <a href={`${centrumUrl}${prefix}/regulamin`} className="py-3 hover:underline">
          {f("terms")}
        </a>
      </nav>
      <div className="bg-[#003b5e] py-14 text-white">
        <Container className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG mark */}
          <img
            src="/icons/logo-mark.svg"
            width={86}
            height={121}
            alt=""
            loading="lazy"
            className="h-14 w-auto brightness-0 invert"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG wordmark */}
          <img
            src="/icons/logo.svg"
            width={336}
            height={46}
            alt={t("logoAlt")}
            loading="lazy"
            className="mt-5 h-6 w-auto brightness-0 invert"
          />
          <p className="mt-2 text-[0.9375rem]">{t("tagline")}</p>
        </Container>
      </div>
    </footer>
  );
}
