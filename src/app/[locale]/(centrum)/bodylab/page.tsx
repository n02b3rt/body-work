import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/centrum/PageHero";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { BodylabNav } from "@/components/centrum/BodylabNav";
import { BlogTeasers } from "@/components/centrum/BlogTeasers";
import { blurProps } from "@/lib/static-blur";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Tool = { eyebrow: string; heading: string; body: string; image: string; href?: string };

/**
 * Half of `Container`'s content box, measured rather than guessed.
 *
 * `Container` is `max-w-[1440px]` with `px-4` / `sm:px-6` / `lg:px-8`, and these grids are
 * `lg:grid-cols-2 lg:gap-16`. So above the cap a column is a fixed (1440 - 64 - 64) / 2 = 656px,
 * and between 1024 and the cap it is `50vw - 64px`. A bare `50vw` claims 944px at a 1889 viewport
 * and a bare `100vw` ignores the padding on a phone; both cost real bytes.
 */
const COLUMN_SIZES =
  "(min-width: 1440px) 656px, (min-width: 1024px) calc(50vw - 64px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)";

const EVERY_MOVE_IMAGE = "/images/bodylab/hub-mark.webp";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Bodylab" });
  return pageMetadata({
    locale,
    path: "/bodylab",
    // A separate, longer title for the tab and the search result: the on-page `<h1>` keeps the
    // one-word brand name ("Bodylab"), which as a `<title>` carried no keyword and no locality.
    // The `Service` JSON-LD below still names the service itself, not this string.
    title: t("seoTitle"),
    // The route shipped a title and nothing else, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function BodylabPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Bodylab");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("Footer");
  const tools = t.raw("tools") as Tool[];

  /** The two diagnostics with a page of their own. The dynamometer has none, so it is not a variant. */
  const variants = [
    { name: tNav("bodylabVald"), path: "/bodylab/technologia-vald" },
    { name: tNav("bodylabComposition"), path: "/bodylab/analiza-skadu-ciala" },
  ];

  return (
    <>
      {/* A `Service` naming the two sub-pages, plus the trail back to the homepage. Both hang off
        * the sitewide business by `@id`; see `src/lib/structured-data.ts` for why the catalogue
        * carries no `Offer`. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title"),
              description: t("metaDescription"),
              path: "/bodylab",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              variants,
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd(
              [
                { name: tCommon("breadcrumbHome"), path: "/" },
                { name: t("title"), path: "/bodylab" },
              ],
              locale,
            ),
          ),
        }}
      />

      <PageHero
        title={t("title")}
        titleSize="display"
        titleAlign="right"
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

      {/* Copy beside the illustration, which is what the reference does: `ul:w2-2 ho:w1-2` with the
        * drawing in its own `ratio4-3` cell, and no `ttu` on the heading. This band used to render
        * the drawing as a full-bleed `object-cover` background with the heading and body on top of
        * it, which put navy type over navy line art and, because the section's height comes from
        * its content, cropped the drawing differently at every viewport width. */}
      <section className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          <div className="flex flex-col justify-between gap-10 py-16 lg:py-24">
            <SectionHeading size="hero">{t("everyMoveHeading")}</SectionHeading>
            <p className="max-w-xl text-body text-brand-navy">{t("everyMoveBody")}</p>
          </div>
          <div className="flex items-center pb-16 lg:py-24">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={EVERY_MOVE_IMAGE}
                alt={t("everyMoveImageAlt")}
                fill
                sizes={COLUMN_SIZES}
                className="object-cover"
                {...blurProps(EVERY_MOVE_IMAGE)}
              />
            </div>
          </div>
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
            {/* Square, from the reference's own `ratio1-1`. Two of the three photographs are
              * 720x1080 portraits and the 16:9 box this used to be threw away two thirds of the
              * frame; a square discards a third. */}
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src={tool.image}
                alt={tool.heading}
                fill
                sizes={COLUMN_SIZES}
                className="object-cover"
                {...blurProps(tool.image)}
              />
            </div>
          </Container>
        </section>
      ))}
      <BlogTeasers category="trening" />

      <NewsletterSignup />
    </>
  );
}
