import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { StatementSection } from "@/components/centrum/StatementSection";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { DieteticsNav } from "@/components/centrum/DieteticsNav";

type Path = { heading: string; body: string; cta: string; href: string };

export default async function DieteticsPage() {
  const t = await getTranslations("Dietetics");
  const tFooter = await getTranslations("Footer");
  const paths = t.raw("paths") as Path[];

  const intro = [
    { heading: t("rememberHeading"), body: t("rememberBody") },
    { heading: t("whatHeading"), body: t("whatBody") },
    { heading: t("goalHeading"), body: t("goalBody") },
  ];

  return (
    <>
      <PageHero
        title={t("title")}
        titleSize="display"
        belowTitle={<DieteticsNav />}
        imageSrc="/images/dietetyka/hero.webp"
        imageAlt={t("title")}
      />

      {/* Three statements side by side, copy aligned along the bottom. */}
      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid lg:grid-cols-3 lg:divide-x lg:divide-brand-navy-soft">
          {intro.map((block, index) => (
            <div key={block.heading} className={index === 0 ? "lg:pr-10" : "lg:px-10"}>
              <StatementSection heading={block.heading} body={block.body} align="left" />
            </div>
          ))}
        </Container>
      </div>

      <section className="relative overflow-hidden border-t border-brand-navy-soft bg-background py-20 lg:py-28">
        <Image src="/images/dietetyka/hub-mark.webp" alt="" fill sizes="100vw" className="object-cover" />
        <Container className="relative z-10">
          <SectionHeading className="max-w-4xl">{t("pathsHeading")}</SectionHeading>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid border-l border-t border-brand-navy-soft lg:grid-cols-2">
          {paths.map((path) => (
            <div
              key={path.href}
              className="flex flex-col items-start justify-between gap-10 border-b border-r border-brand-navy-soft p-8 lg:p-12"
            >
              <SectionHeading as="h3" size="sub">
                {path.heading}
              </SectionHeading>
              <p className="text-body text-brand-navy">{path.body}</p>
              <Link href={path.href} className={buttonClasses("outline")}>
                {path.cta}
              </Link>
            </div>
          ))}
        </Container>
      </div>

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("howToHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("howToBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={`tel:+48${tFooter("phone").replace(/\s/g, "")}`} className={buttonClasses("outline")}>
                {t("howToCall")}
              </a>
              <a href={`mailto:${tFooter("email")}`} className={buttonClasses("outline")}>
                {t("howToEmail")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      <NewsletterSignup />
    </>
  );
}
