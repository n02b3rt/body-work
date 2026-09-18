import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";

const FACEBOOK_URL = "https://www.facebook.com/bodyworkpl/?fref=ts";

/** Contact details are the same business as Centrum's, so the strings come from the
 * `Footer` namespace rather than duplicating them under `Hub`. */
export function Footer() {
  const t = useTranslations("Hub");
  const tFooter = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-navy-soft bg-brand-surface">
      <Container className="flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-body text-brand-navy">{t("footerCopy")}</p>
          <p className="mt-2 text-body text-brand-navy">
            <a href={`tel:+48${tFooter("phone").replace(/\s/g, "")}`} className="hover:underline">
              {tFooter("phone")}
            </a>
            {" · "}
            <a href={`mailto:${tFooter("email")}`} className="hover:underline">
              {tFooter("email")}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
            {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
            <img src="/icons/facebook.svg" alt="Facebook" className="h-7 w-7" />
          </a>
          <p className="text-body text-brand-navy">{t("copyright", { year })}</p>
        </div>
      </Container>
    </footer>
  );
}
