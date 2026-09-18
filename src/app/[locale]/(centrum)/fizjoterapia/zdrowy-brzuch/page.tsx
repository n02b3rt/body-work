import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { Accordion, type AccordionItemData } from "@/components/centrum/Accordion";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PhysiotherapyNav } from "@/components/centrum/PhysiotherapyNav";
import { pageMetadata } from "@/lib/metadata";
import { blurFor, blurProps } from "@/lib/static-blur";
import { breadcrumbJsonLd, serviceJsonLd, trainerListJsonLd } from "@/lib/structured-data";

type Lead = { name: string; body: string; image: string };
type Format = { heading: string; price: string; duration: string };

const HERO = "/images/fizjoterapia/brzuch-hero.webp";
const PROJECT_PHOTO = "/images/fizjoterapia/brzuch-projekt.webp";
const OG_IMAGE = "/images/og/fizjoterapia-zdrowy-brzuch.jpg";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HealthyBelly" });
  return pageMetadata({
    locale,
    path: "/fizjoterapia/zdrowy-brzuch",
    title: t("title"),
    // The route shipped no description at all before this, so no `og:description` either.
    description: t("metaDescription"),
    image: OG_IMAGE,
    imageWidth: 1200,
    imageHeight: 630,
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function HealthyBellyPage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const t = await getTranslations("HealthyBelly");
  const tFooter = await getTranslations("Footer");
  const tCommon = await getTranslations("common");
  const tPhysio = await getTranslations("Physiotherapy");
  const leads = t.raw("leads") as Lead[];
  const formats = t.raw("formats") as Format[];

  // `static-blur` is server-only, so the placeholders are resolved here and handed to the (client)
  // accordion as data. It is also what holds each portrait back until its row is opened.
  const leadItems: AccordionItemData[] = leads.map((l) => ({
    heading: l.name,
    body: l.body,
    image: l.image,
    ...(blurFor(l.image) ? { imageBlur: blurFor(l.image) } : {}),
  }));

  // The displayed title ends in a full stop, which is the reference's house style for a page
  // heading and wrong in a breadcrumb or a `Service` name, both of which can end up in a search
  // result.
  const name = t("title").replace(/\.$/, "");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), path: "/" },
    { name: tPhysio("title"), path: "/fizjoterapia" },
    { name, path: "/fizjoterapia/zdrowy-brzuch" },
  ];

  return (
    <>
      {/* The programme as a `Service` whose catalogue is the two formats the page actually sells,
        * the three people running it as an `ItemList` of `Person`, and the trail back to the hub.
        *
        * The catalogue carries **no prices**, although this page prints two. Only `/cennik` reads
        * its amounts back out of its own copy, where the parser is written for the shape that page
        * uses; "2.000,-" and its English "2,000 PLN" are not that shape, and a second hand-kept
        * price would be free to drift from the one a visitor reads. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            serviceJsonLd(locale, {
              name,
              description: t("metaDescription"),
              path: "/fizjoterapia/zdrowy-brzuch",
              city: tFooter("addressLine3").replace(/^[0-9-]+\s*/, "").split(",")[0],
              image: HERO,
              variants: formats.map((format) => ({ name: format.heading })),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            trainerListJsonLd(locale, {
              name: `${name} — ${t("leadsHeading").replace(/:$/, "")}`,
              path: "/fizjoterapia/zdrowy-brzuch",
              // No `jobTitle`: these three are introduced by name only, and their bios open with a
              // shouted display label that is not one. See `trainerListJsonLd`.
              people: leads.map((lead) => ({ name: lead.name, image: lead.image })),
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

      <CenteredBand
        eyebrow={t("leadEyebrow")}
        heading={t("leadHeading")}
        body={<p>{t("leadBody")}</p>}
        backgroundSrc="/images/fizjoterapia/brzuch-mark.webp"
      />

      <section className="border-t border-brand-navy-soft bg-background">
        {/* `grid-cols-1` explicitly: an implicit `auto` track is floored at min-content, so one long
          * Polish word in a heading can size the section wider than a small phone's viewport. */}
        <Container className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <SectionHeading uppercase>{t("aboutHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("aboutBody")}</p>
        </Container>
      </section>

      {/* Illustration on the left filling its half, copy on the right. */}
      <section className="grid grid-cols-1 border-t border-brand-navy-soft bg-background lg:grid-cols-2">
        <div className="relative min-h-[22rem] w-full lg:min-h-[34rem]">
          <Image
            src={PROJECT_PHOTO}
            alt={t("qualifyHeading")}
            fill
            /* Full-bleed below `lg` and an uncapped half of the viewport above it, so the viewport
             * units are honest here: this section is outside `Container` and has no width cap. */
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            {...blurProps(PROJECT_PHOTO)}
          />
        </div>
        <div className="flex flex-col justify-between gap-16 px-4 py-16 sm:px-6 lg:px-12 lg:py-20">
          <SectionHeading>{t("qualifyHeading")}</SectionHeading>
          <p className="text-body text-brand-navy">{t("qualifyBody")}</p>
        </div>
      </section>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("leadsHeading")}</SectionHeading>
        </Container>
      </div>
      {/* `squareMedia`: these are portraits, and without it a row is only as tall as its own bio,
        * so whoever wrote less about herself gets cropped harder than the woman above her. */}
      <Accordion items={leadItems} squareMedia />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-16 lg:py-24">
          <SectionHeading uppercase>{t("formatsHeading")}</SectionHeading>
        </Container>
        <Container className="grid grid-cols-1 border-l border-t border-brand-navy-soft lg:grid-cols-2">
          {formats.map((format) => (
            <div
              key={format.heading}
              /* No `items-start` here: it sizes each child to fit-content, which floors the cell at
               * the longest word's min-content width. At 320px the English "Ultrasound consultation
               * + training" wanted 237px inside a 224px cell. Both children are block-level, so
               * letting them stretch changes nothing visually. */
              className="flex flex-col gap-6 border-b border-r border-brand-navy-soft p-8 lg:p-12"
            >
              <SectionHeading as="h3" size="sub">
                {format.heading}
              </SectionHeading>
              <p className="text-body text-brand-navy">
                {format.price}
                <br />
                {format.duration}
              </p>
            </div>
          ))}
        </Container>
      </div>

      <NewsletterSignup />
    </>
  );
}
