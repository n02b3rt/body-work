import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";
import { pageMetadata } from "@/lib/metadata";
import { blurFor } from "@/lib/static-blur";
import { breadcrumbJsonLd, trainerListJsonLd } from "@/lib/structured-data";

type Person = { name: string; body: string; image: string };
type Category = { heading: string; body: string; people: Person[] };

const HERO = "/images/fizjoterapia/specjalisci-hero.webp";
const OG_IMAGE = "/images/og/fizjoterapia-specjalisci.jpg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Physiotherapists" });
  return pageMetadata({
    locale,
    path: "/fizjoterapia/specjalisci",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
    image: OG_IMAGE,
    imageWidth: 1200,
    imageHeight: 630,
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function PhysiotherapistsPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("Physiotherapists");
  const tCommon = await getTranslations("common");
  const tPhysio = await getTranslations("Physiotherapy");
  const categories = t.raw("categories") as Category[];

  // The reference lists people as expandable rows spanning the section, not as a
  // grid of photo cards.
  //
  // `blurFor` is resolved here because `static-blur` is server-only, and passing an `imageBlur` is
  // what makes the accordion hold each portrait back until its row is opened: eleven photographs
  // whose 288px layout boxes stack close enough together that `loading="lazy"` alone downloaded
  // all of them on the way past the names.
  const toAccordion = (people: Person[]): AccordionItemData[] =>
    people.map((p) => ({
      heading: p.name,
      body: p.body,
      image: p.image,
      ...(blurFor(p.image) ? { imageBlur: blurFor(p.image) } : {}),
    }));

  // The displayed title ends in a full stop, which is the reference's house style for a page
  // heading and wrong in a breadcrumb or a list name, both of which can end up in a search result.
  const name = t("title").replace(/\.$/, "");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), path: "/" },
    { name: tPhysio("title"), path: "/fizjoterapia" },
    { name, path: "/fizjoterapia/specjalisci" },
  ];

  return (
    <>
      {/* The eleven specialists as an `ItemList` of `Person`, plus the trail back to the hub.
        *
        * Deliberately **no `Service`**: this page lists people, not a therapy, which is the same
        * reason the hub's own `OfferCatalog` leaves it out. `jobTitle` is the category heading
        * ("Specjalizacja ortopedyczna"), which is the clean value: the label printed inside a bio
        * is display copy, prefix and shouting included. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            trainerListJsonLd(locale, {
              name,
              path: "/fizjoterapia/specjalisci",
              people: categories.flatMap((category) =>
                category.people.map((person) => ({
                  name: person.name,
                  jobTitle: category.heading,
                  image: person.image,
                })),
              ),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs, locale)) }}
      />

      <PhysiotherapyNav />
      <PageHero title={t("title")} imageSrc={HERO} imageAlt={t("title")} />

      <section className="border-t border-brand-navy-soft bg-background">
        {/* No `items-start`: on a flex column it sizes each child to fit-content, which is floored
          * at min-content, so at 320px "Dobry fizjoterapeuta." claimed 333px inside a 288px
          * container and dragged the whole document sideways. Both children are block-level and
          * left-aligned, so stretching them changes nothing visually; the copy keeps its own cap. */}
        <Container className="flex flex-col gap-12 py-16 lg:py-24">
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
          {/* `grid-cols-1` explicitly. The implicit single track was an `auto` one, floored at its
            * min-content width, and "Specjalizacja uroginekologiczna" needs 348px there: at a 320px
            * viewport the document scrolled 44px sideways, at 360px it scrolled 4px. Tailwind's
            * `grid-cols-1` is `minmax(0, 1fr)`, which removes the floor and nothing else. */}
          <Container className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            {/* `section-late`, because this is the page that found the need for it: at the ordinary
              * `section` step "Specjalizacja uroginekologiczna" was 67.7px inside a 569px column
              * from 1060 up and broke mid-word, with no hyphen, as "uroginekologi / czna". See the
              * measurements on the size itself. */}
            <SectionHeading size="section-late">{category.heading}</SectionHeading>
            <p className="text-body text-brand-navy">{category.body}</p>
          </Container>
          {/* `squareMedia`, the flag `Accordion` has been carrying a note about since `/masaz`:
            * without it a portrait is stretched to whatever height the bio happens to need, so the
            * people who wrote least about themselves lose the tops of their heads. */}
          <Accordion items={toAccordion(category.people)} squareMedia />
        </section>
      ))}

      <NewsletterSignup />
    </>
  );
}
