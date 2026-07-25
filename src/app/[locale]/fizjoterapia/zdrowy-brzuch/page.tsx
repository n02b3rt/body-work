import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";

type Lead = { name: string; body: string; image: string };
type Format = { heading: string; price: string; duration: string; href: string };

export default async function HealthyBellyPage() {
  const t = await getTranslations("HealthyBelly");
  const leads = t.raw("leads") as Lead[];
  const formats = t.raw("formats") as Format[];

  return (
    <>
      <PhysiotherapyNav />
      <PageHero title={t("title")} imageSrc="/images/fizjoterapia/brzuch-hero.webp" imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading className="max-w-5xl">{t("leadHeading")}</SectionHeading>
        </Container>
      </section>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("aboutHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("aboutBody")}</p>
        </Container>
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2.4/1]">
          <Image
            src="/images/fizjoterapia/brzuch-projekt.webp"
            alt={t("aboutHeading")}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading>{t("qualifyHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("qualifyBody")}</p>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("leadsHeading")}</SectionHeading>
        </Container>
        <Container className="grid border-l border-t border-brand-navy-soft sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead) => (
            <article key={lead.name} className="flex flex-col gap-6 border-b border-r border-brand-navy-soft p-8">
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={lead.image}
                  alt={lead.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <h3 className="text-h-menu uppercase text-brand-navy">{lead.name}</h3>
              <p className="text-body text-brand-navy">{lead.body}</p>
            </article>
          ))}
        </Container>
      </div>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("formatsHeading")}</SectionHeading>
        </Container>
        <Container className="grid border-l border-t border-brand-navy-soft lg:grid-cols-2">
          {formats.map((format) => (
            <div
              key={format.heading}
              className="flex flex-col items-start gap-6 border-b border-r border-brand-navy-soft p-8 lg:p-12"
            >
              <SectionHeading as="h3" size="sub">
                {format.heading}
              </SectionHeading>
              <p className="text-body text-brand-navy">
                {format.price}
                <br />
                {format.duration}
              </p>
              <a
                href={format.href}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("outline", "mt-4")}
              >
                {t("formatCta")}
              </a>
            </div>
          ))}
        </Container>
      </div>

      <NewsletterSignup />
    </>
  );
}
