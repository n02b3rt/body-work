import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/Button";
import { DIRECTIONS_URL, MAP_URL } from "@/lib/external-links";

/** Address / reception / opening hours, with the two map buttons alongside.
 *
 * Extracted from `Footer` so the contact page and the footer can't drift apart — the
 * reference's own `/kontakt` page has no content of its own beyond this block, so both
 * surfaces are showing the same thing by definition. Reads `Footer.*` message keys,
 * which is where this copy already lives. */
export function ContactDetails() {
  const t = useTranslations("Footer");

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid gap-10 sm:grid-cols-3 lg:flex lg:gap-16">
        <div>
          <p className="text-label uppercase text-brand-navy">{t("addressLabel")}</p>
          <p className="mt-6 text-value text-brand-navy wide:text-value-lg">
            {t("addressLine1")}
            <br />
            {t("addressLine2")}
            <br />
            {t("addressLine3")}
          </p>
        </div>
        <div>
          <p className="text-label uppercase text-brand-navy">{t("receptionLabel")}</p>
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
          <p className="text-label uppercase text-brand-navy">{t("hoursLabel")}</p>
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
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("outline", "min-w-60")}
        >
          {t("getDirections")}
        </a>
      </div>
    </div>
  );
}
