import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/external-links";

/** Legal pages live on Centrum, the one site that has them; the hub links across rather than
 * duplicating them. */
export async function Footer({ centrumUrl, locale }: { centrumUrl: string; locale: string }) {
  const t = await getTranslations("Hub");
  const f = await getTranslations("Footer");
  const year = new Date().getFullYear();
  const prefix = locale === "pl" ? "" : `/${locale}`;

  return (
    <footer className="bg-brand-navy text-background">
      <Container className="flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG wordmark */}
          <img
            src="/icons/logo.svg"
            width={336}
            height={46}
            alt={t("logoAlt")}
            loading="lazy"
            className="h-5 w-auto brightness-0 invert"
          />
          <p className="mt-4 text-body text-background/75">{t("footerCopy")}</p>
        </div>
        <nav aria-label={f("kontaktHeading")} className="flex flex-wrap items-center gap-x-6 gap-y-3 text-label uppercase tracking-[0.15em]">
          <a href={`${centrumUrl}${prefix}/polityka-prywatnosci`} className="hover:underline">
            {f("privacyPolicy")}
          </a>
          <a href={`${centrumUrl}${prefix}/regulamin`} className="hover:underline">
            {f("terms")}
          </a>
          <a href={FACEBOOK_URL} rel="noopener" aria-label="Facebook" className="hover:opacity-70">
            {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
            <img src="/icons/facebook-white.svg" alt="" width={28} height={28} loading="lazy" className="h-7 w-7" />
          </a>
          <a href={INSTAGRAM_URL} rel="noopener" aria-label="Instagram" className="hover:opacity-70">
            {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
            <img src="/icons/instagram-white.svg" alt="" width={28} height={28} loading="lazy" className="h-7 w-7" />
          </a>
          <span className="normal-case tracking-normal text-background/70">{t("copyright", { year })}</span>
        </nav>
      </Container>
    </footer>
  );
}
