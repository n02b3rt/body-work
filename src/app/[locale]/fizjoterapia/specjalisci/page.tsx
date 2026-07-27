import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";
import { pageMetadata } from "@/lib/metadata";

type Person = { name: string; body: string; image: string };
type Category = { heading: string; body: string; people: Person[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Physiotherapists" });
  return pageMetadata({ locale, path: "/fizjoterapia/specjalisci", title: t("title") });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function PhysiotherapistsPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Physiotherapists");
  const categories = t.raw("categories") as Category[];

  // The reference lists people as expandable rows spanning the section, not as a
  // grid of photo cards.
  const toAccordion = (people: Person[]): AccordionItemData[] =>
    people.map((p) => ({ heading: p.name, body: p.body, image: p.image }));

  return (
    <>
      <PhysiotherapyNav />
      <PageHero title={t("title")} imageSrc="/images/fizjoterapia/specjalisci-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-12 py-16 lg:py-24">
          <SectionHeading uppercase>{t("leadHeading")}</SectionHeading>
          <p className="max-w-5xl text-body text-brand-navy wide:text-statement">{t("leadBody")}</p>
        </Container>
      </section>

      <CenteredBand eyebrow={t("bandEyebrow")} heading={t("bandHeading")} body={<p>{t("bandBody")}</p>} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{t("directionsHeading")}</SectionHeading>
        </Container>
      </div>

      {categories.map((category) => (
        <section key={category.heading} className="border-t border-brand-navy-soft bg-background">
          <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <SectionHeading>{category.heading}</SectionHeading>
            <p className="text-body text-brand-navy">{category.body}</p>
          </Container>
          <Accordion items={toAccordion(category.people)} />
        </section>
      ))}

      <NewsletterSignup />
    </>
  );
}
