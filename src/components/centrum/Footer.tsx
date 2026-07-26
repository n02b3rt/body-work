import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

const MAP_URL =
  "https://www.google.com/maps/place/BODYWORK/@52.41825,16.890763,15z/data=!4m6!3m5!1s0x470444beb9f08a6b:0x9005d9db3042bade!8m2!3d52.4182498!4d16.8907633!16s%2Fg%2F11byvnvxmm";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir//Kajki+14,+60-545+Poznań/@52.4036757,16.8899891,14z";

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-navy-soft bg-brand-surface" id="kontakt">
      <Container className="py-16 lg:py-24">
        <SectionHeading size="display" uppercase>
          {t("kontaktHeading")}
        </SectionHeading>

        <div className="mt-24 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid gap-10 sm:grid-cols-3 lg:flex lg:gap-16">
            <div>
              <p className="text-label uppercase text-brand-navy">
                {t("addressLabel")}
              </p>
              <p className="mt-6 text-value text-brand-navy wide:text-value-lg">
                {t("addressLine1")}
                <br />
                {t("addressLine2")}
                <br />
                {t("addressLine3")}
              </p>
            </div>
            <div>
              <p className="text-label uppercase text-brand-navy">
                {t("receptionLabel")}
              </p>
              <p className="mt-6 text-value text-brand-navy wide:text-value-lg">
                <a href={`tel:+48${t("phone").replace(/\s/g, "")}`} className="hover:underline">
                  {t("phone")}
                </a>
                <br />
                <a href={`mailto:${t("email")}`} className="hover:underline">
                  {t("email")}
                </a>
              </p>
            </div>
            <div>
              <p className="text-label uppercase text-brand-navy">
                {t("hoursLabel")}
              </p>
              <p className="mt-6 text-value text-brand-navy wide:text-value-lg">
                {t("hoursLine1")}
                <br />
                {t("hoursLine2")}
                <br />
                {t("hoursLine3")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 lg:shrink-0 lg:flex-col lg:items-end">
            <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "min-w-60")}>
              {t("showOnMap")}
            </a>
            <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline", "min-w-60")}>
              {t("getDirections")}
            </a>
          </div>
        </div>
      </Container>

      {/* Full-bleed divider, matching the header's row divider — the legal-links
       * content inside stays at the usual container width. */}
      <div className="border-t border-brand-navy-soft">
        <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-body text-brand-navy">
            <Link href="/polityka-prywatnosci">{t("privacyPolicy")}</Link>
            <Link href="/regulamin">{t("terms")}</Link>
            <Link href="/cookies">{t("cookies")}</Link>
          </div>
          <p className="text-body text-brand-navy">{t("copyright", { year })}</p>
        </Container>
      </div>
    </footer>
  );
}
