import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";

type Person = { name: string; body: string; image: string };
type Category = { heading: string; body: string; people: Person[] };

export default async function PhysiotherapistsPage() {
  const t = await getTranslations("Physiotherapists");
  const categories = t.raw("categories") as Category[];

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

      <CenteredBand heading={t("bandHeading")} body={<p>{t("bandBody")}</p>} />

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

          <Container className="grid border-l border-t border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
            {category.people.map((person) => (
              <article
                key={`${category.heading}-${person.name}`}
                className="flex flex-col gap-6 border-b border-r border-brand-navy-soft p-8"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={person.image}
                    alt={person.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-h-menu uppercase text-brand-navy">{person.name}</h3>
                <p className="text-body text-brand-navy">{person.body}</p>
              </article>
            ))}
          </Container>
        </section>
      ))}

      <NewsletterSignup />
    </>
  );
}
