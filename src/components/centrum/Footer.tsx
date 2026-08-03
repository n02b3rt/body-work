import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { ContactDetails } from "./ContactDetails";


export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-navy-soft bg-brand-surface" id="kontakt">
      <Container className="py-16 lg:py-24">
        <SectionHeading size="display" uppercase>
          {t("kontaktHeading")}
        </SectionHeading>

        <div className="mt-24">
          <ContactDetails />
        </div>

      </Container>

      {/* Full-bleed divider, matching the header's row divider: the legal-links
       * content inside stays at the usual container width. */}
      <div className="border-t border-brand-navy-soft">
        <Container className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-body text-brand-navy">
            <Link prefetch={false} href="/polityka-prywatnosci">{t("privacyPolicy")}</Link>
            <Link prefetch={false} href="/regulamin">{t("terms")}</Link>
            <Link prefetch={false} href="/cookies">{t("cookies")}</Link>
          </div>
          <p className="text-body text-brand-navy">{t("copyright", { year })}</p>
        </Container>
      </div>
    </footer>
  );
}
