import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Homepage title block: the scraped reference keeps this as plain text on the
 * page background, with the hero video as its own full-bleed section below
 * (see FullBleedVideo), not overlaid behind the text. */
export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="bg-background">
      <Container className="flex flex-col items-center gap-12 py-20 text-center sm:py-24">
        <SectionHeading size="hero" uppercase className="max-w-4xl">
          {t("title")}
        </SectionHeading>
        <p className="max-w-xl text-body text-brand-navy">{t("subtitle")}</p>
      </Container>
    </section>
  );
}
