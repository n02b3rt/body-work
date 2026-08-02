import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { TextMedia } from "@/components/centrum/TextMedia";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { TestimonialCarousel, type Testimonial } from "@/components/centrum/TestimonialCarousel";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { blurFor } from "@/lib/static-blur";
import { pageMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, serviceJsonLd } from "@/lib/structured-data";

type Section = { heading: string; body: string; image: string };
type Person = { name: string; role: string; body: string; image: string };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Massage" });
  return pageMetadata({
    locale,
    path: "/masaz",
    // A separate, longer title for the tab and the search result: the on-page `<h1>` keeps the
    // one-word "Masaż", which as a `<title>` carried no locality and no treatment name.
    title: t("seoTitle"),
    // The route shipped a title and nothing else, so no `og:description` either.
    description: t("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

/**
 * The massage section.
 *
 * **Deliberately without the reference's e-commerce.** The reference sells massages through
 * WooCommerce: an "UMÓW SIĘ" button under the intro and five "KUP TERAZ" buttons across the four
 * treatment panels, all of them JS-driven add-to-cart handlers with no href at all. Centrum is not
 * getting a shop (the client's call: it belongs on Akademia), so those six buttons are gone rather
 * than pointed at the old site. Nothing is lost in their place, because the section that follows
 * already tells a visitor exactly how to book: call reception.
 *
 * The four treatment panels do **not** alternate. Every one of them has the text column first and
 * the photograph second, which is the reference's own markup: all four carry identical wrapper
 * classes (`ul:w2-2 ho:w1-2` on the text column). Worth stating, because most other section pages
 * here do alternate and copying that pattern would have been the obvious mistake.
 */
export default async function MassagePage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Massage");
  const tCommon = await getTranslations("common");
  const tFooter = await getTranslations("Footer");

  const sections = t.raw("sections") as Section[];
  const people = t.raw("people") as Person[];
  const phone = `tel:+48${tFooter("phone").replace(/\s/g, "")}`;

  // The reference prints each therapist's specialities as a line above their bio, inside the
  // expanded row. `PanelText` renders with `whitespace-pre-line`, so the break survives.
  const teamRows: AccordionItemData[] = people.map((person) => ({
    heading: person.name,
    body: `${person.role}\n\n${person.body}`,
    image: person.image,
    // `Accordion` is a client component and `static-blur` is server-only, so the placeholder
    // travels as data; see the note on `AccordionItemData.imageBlur`.
    imageBlur: blurFor(person.image),
  }));

  /** The four treatments, each a named variant of the one service rather than a page of its own. */
  const variants = sections.map((section) => ({
    // Trailing full stops are how this copy is written ("Masaż klasyczny."); a schema `name` reads
    // better without one, and it is the same string either way.
    name: section.heading.replace(/\.$/, ""),
    path: "/masaz",
  }));

  return (
    <>
      {/* A `Service` naming the four treatments, plus the trail back to the homepage. Both hang off
        * the sitewide business by `@id`; see `src/lib/structured-data.ts` for why the catalogue
        * carries no `Offer`: the prices live on /cennik and this page states none. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name: t("title"),
              description: t("metaDescription"),
              path: "/masaz",
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
                { name: t("title"), path: "/masaz" },
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
        imageSrc="/images/masaz/hero.webp"
        imageAlt={t("title")}
      />

      <CenteredBand
        eyebrow={t("bandEyebrow")}
        heading={t("bandHeading")}
        body={<p>{t("bandBody")}</p>}
        backgroundSrc="/images/masaz/hub-mark.webp"
      />

      {sections.map((section) => (
        <TextMedia
          key={section.heading}
          heading={section.heading}
          body={section.body}
          imagePosition="right"
          headingUppercase
          // Client's call: four of these panels stack here, and the photographs running straight
          // into the hairlines above and below read as cramped.
          imageInset
          imageSrc={section.image}
          imageAlt={section.heading}
        />
      ))}

      <CenteredBand
        eyebrow={t("teamEyebrow")}
        heading={t("teamHeading")}
        body={<p>{t("teamBody")}</p>}
        // A long sentence: capped at the usual measure it wraps onto four cramped rows.
        headingWide
      />
      {/* Square portraits, so a shorter bio does not crop its own subject's head. */}
      <Accordion items={teamRows} squareMedia />

      <TestimonialCarousel
        heading={t("testimonialsHeading")}
        items={t.raw("testimonials") as Testimonial[]}
      />

      {/* The reference puts the brand watermark behind this block too, which the equivalent
        * section on `/fizjoterapia` does not have. */}
      <section className="relative overflow-hidden border-t border-brand-navy-soft bg-background">
        <Image
          src="/images/masaz/jak-skorzystac.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <Container className="relative z-10 grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <SectionHeading>{t("howToHeading")}</SectionHeading>
          <div className="flex h-full flex-col justify-between gap-16">
            <p className="text-body text-brand-navy">{t("howToBody")}</p>
            <div className="flex flex-wrap gap-4">
              <a href={phone} className={buttonClasses("outline")}>
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
