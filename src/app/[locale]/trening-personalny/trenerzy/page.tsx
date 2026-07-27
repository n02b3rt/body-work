import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PersonalTrainingNav } from "@/components/centrum/PersonalTrainingNav";
import { pageMetadata } from "@/lib/metadata";

type Trainer = { name: string; specialisation: string; bio: string; image: string };
type Category = { heading: string; body: string; image: string; trainers: Trainer[] };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Trainers" });
  return pageMetadata({ locale, path: "/trening-personalny/trenerzy", title: t("title") });
}

export default async function TrainersPage() {
  const t = await getTranslations("Trainers");
  const categories = t.raw("categories") as Category[];

  return (
    <>
      <PersonalTrainingNav />
      <PageHero title={t("title")} imageSrc="/images/trening-personalny/trenerzy-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="flex flex-col items-start gap-12 py-16 lg:py-24">
          <SectionHeading>{t("leadHeading")}</SectionHeading>
          {/* Oversized statement copy, as on the homepage's opening block. */}
          <p className="max-w-5xl text-body text-brand-navy wide:text-statement">{t("leadBody")}</p>
        </Container>
      </section>

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/trening-personalny/trenerzy-mark.webp"
      />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading>{t("directionsHeading")}</SectionHeading>
        </Container>
      </div>

      {categories.map((category) => (
        <section key={category.heading} className="border-t border-brand-navy-soft bg-background">
          <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <SectionHeading uppercase>{category.heading}</SectionHeading>
            <p className="text-body text-brand-navy">{category.body}</p>
          </Container>

          <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
            <Image src={category.image} alt={category.heading} fill sizes="100vw" className="object-cover" />
          </div>

          {/* Portrait, name, specialisation and bio: one row per trainer, hairline
           * separated like the reference's list. */}
          <Container className="grid border-l border-t border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
            {category.trainers.map((trainer) => (
              <article
                key={`${category.heading}-${trainer.name}`}
                className="flex flex-col gap-6 border-b border-r border-brand-navy-soft p-8"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={trainer.image}
                    alt={trainer.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-h-menu uppercase text-brand-navy">{trainer.name}</h3>
                  <p className="mt-3 text-label uppercase tracking-[1px] text-brand-navy/70">
                    {trainer.specialisation}
                  </p>
                </div>
                <p className="text-body text-brand-navy">{trainer.bio}</p>
              </article>
            ))}
          </Container>
        </section>
      ))}

      <NewsletterSignup />
    </>
  );
}
