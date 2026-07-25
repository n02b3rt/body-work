import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { BodylabNav } from "@/components/centrum/BodylabNav";

type Tool = { eyebrow: string; heading: string; body: string; image: string; href?: string };

export default async function BodylabPage() {
  const t = await getTranslations("Bodylab");
  const tools = t.raw("tools") as Tool[];

  return (
    <>
      <PageHero
        title={t("title")}
        titleSize="display"
        belowTitle={<BodylabNav />}
        imageSrc="/images/bodylab/hero.webp"
        imageAlt={t("title")}
      />

      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("leadHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("leadBody")}</p>
        </Container>
      </section>

      <section className="relative overflow-hidden border-t border-brand-navy-soft bg-background py-20 lg:py-28">
        <Image src="/images/bodylab/hub-mark.webp" alt="" fill sizes="100vw" className="object-cover" />
        <Container className="relative z-10 flex flex-col items-center gap-10 text-center">
          <SectionHeading size="hero" uppercase className="max-w-4xl">
            {t("everyMoveHeading")}
          </SectionHeading>
          <p className="max-w-3xl text-body text-brand-navy">{t("everyMoveBody")}</p>
        </Container>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading className="max-w-4xl">{t("techHeading")}</SectionHeading>
        </Container>
      </div>

      {/* Each tool: label, headline, copy and photo, alternating sides. */}
      {tools.map((tool, index) => (
        <section key={tool.eyebrow} className="border-t border-brand-navy-soft bg-background">
          <Container
            className={`grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24 ${
              index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="flex flex-col items-start gap-6">
              <p className="text-label uppercase tracking-[1px] text-brand-navy/70">{tool.eyebrow}</p>
              <SectionHeading size="sub">{tool.heading}</SectionHeading>
              <p className="text-body text-brand-navy">{tool.body}</p>
              {tool.href ? (
                <Link href={tool.href} className={buttonClasses("outline", "mt-4")}>
                  {t("toolsCta")}
                </Link>
              ) : null}
            </div>
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={tool.image}
                alt={tool.heading}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>
      ))}

      <NewsletterSignup />
    </>
  );
}
