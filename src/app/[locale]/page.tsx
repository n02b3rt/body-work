import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Hero } from "@/components/centrum/Hero";
import { FullBleedVideo } from "@/components/centrum/FullBleedVideo";
import { NewsCarousel } from "@/components/centrum/NewsCarousel";
import { TextMedia } from "@/components/centrum/TextMedia";
import { PhotoTextCard } from "@/components/centrum/PhotoTextCard";
import { StatementSection } from "@/components/centrum/StatementSection";
import { FullBleedImage } from "@/components/centrum/FullBleedImage";
import { ServiceGrid } from "@/components/centrum/ServiceGrid";
import { TestimonialCarousel } from "@/components/centrum/TestimonialCarousel";
import { MeetUsCta } from "@/components/centrum/MeetUsCta";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PartnerLogos } from "@/components/centrum/PartnerLogos";
import { GALLERY_URL } from "@/lib/external-links";
import { pageMetadata } from "@/lib/metadata";
import { blurFor } from "@/lib/static-blur";
import { homepageJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const tHero = await getTranslations({ locale, namespace: "Hero" });
  return pageMetadata({
    locale,
    path: "/",
    title: tHero("title"),
    /**
     * A description written to fit, not the opening statement.
     *
     * `Statements.balancedFitnessBody` was doing this job at 307 characters, and Google truncates
     * around 155, so it was being cut mid-sentence. `Hero.metaDescription` is 151 and every fact
     * in it comes from the page itself: the six services, the balanced-fitness statement and the
     * footer's Poznań address.
     */
    description: tHero("metaDescription"),
  });
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function CentrumHomePage({ params }: PageProps) {
  const { locale } = await params;
  // Enables static rendering for this route; see the note in [locale]/layout.tsx.
  setRequestLocale(locale);
  const tFriendlySpace = await getTranslations("FriendlySpace");
  const tStatements = await getTranslations("Statements");
  const tServices = await getTranslations("Services");
  const tTeam = await getTranslations("Team");
  const tMeetUs = await getTranslations("MeetUs");
  const tPartners = await getTranslations("Partners");
  const tFooter = await getTranslations("Footer");
  const tTestimonials = await getTranslations("Testimonials");

  const services = [
    {
      label: tServices("personalTraining"),
      href: "/trening-personalny",
      image: "/images/home/service-personal-training.webp",
    },
    {
      label: tServices("groupTraining"),
      href: "/trening-grupowy",
      image: "/images/home/service-group-training.webp",
    },
    {
      label: tServices("physiotherapy"),
      href: "/fizjoterapia",
      image: "/images/home/service-physiotherapy.webp",
    },
    { label: tServices("dietetics"), href: "/dietetyka", image: "/images/home/service-dietetics.webp" },
    { label: tServices("massage"), href: "/masaz", image: "/images/home/service-massage.webp" },
    {
      label: tServices("academy"),
      href: "https://akademia.body-work.pl",
      image: "/images/home/service-academy.webp",
    },
  ];

  return (
    <>
      {/* The site as a `WebSite` plus what the centre offers as a list of `Service` entries, both
        * hanging off the sitewide `HealthAndBeautyBusiness` by `@id` so a crawler does not read
        * them as two separate businesses. See `src/lib/structured-data.ts`. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd(locale, services)) }}
      />

      <Hero />
      {/* `src` has no extension: the component offers `.webm` (1736KB) before `.mp4` (2800KB).
        * The poster carries the first paint at 17KB and the video only loads once the section is
        * within a viewport of being seen. `blurFor` is read here, on the server, because the
        * component is a client one and importing the placeholder map would ship all of it. */}
      <FullBleedVideo
        src="/videos/hero"
        poster="/images/home/hero-poster.webp"
        posterAlt={tStatements("movementTool")}
        posterBlur={blurFor("/images/home/hero-poster.webp")}
      />

      {/* The opening statement's body copy is deliberately oversized on the
       * reference (`ho:f7s6`, ~40px), it reads as a statement, not as body text. */}
      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="py-24 lg:py-32">
          <SectionHeading>{tStatements("balancedFitnessHeading")}</SectionHeading>
          <p className="mt-16 text-body text-brand-navy wide:text-statement">
            {tStatements("balancedFitnessBody")}
          </p>
        </Container>
      </div>

      <NewsCarousel />

      <PhotoTextCard
        heading={tFriendlySpace("heading")}
        body={tFriendlySpace("body")}
        ctaLabel={tFriendlySpace("cta")}
        ctaHref={GALLERY_URL}
        external
        imageSrc="/images/home/friendly-space.webp"
        imageAlt={tFriendlySpace("heading")}
      />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={tStatements("movementTool")} align="left" />
        </Container>
      </div>

      <FullBleedImage src="/images/home/movement-tool.webp" alt={tStatements("movementTool")} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid gap-10 py-4 lg:grid-cols-2 lg:divide-x lg:divide-brand-navy-soft">
          <div className="lg:pr-10">
            <StatementSection
              heading={tStatements("teachPotentialHeading")}
              body={tStatements("teachPotentialBody")}
              ctaLabel={tStatements("learnMore")}
              ctaHref="/instrukcja"
              align="left"
            />
          </div>
          <div className="lg:pl-10">
            <StatementSection
              heading={tStatements("healthProcessHeading")}
              body={tStatements("healthProcessBody")}
              ctaLabel={tStatements("learnMore")}
              ctaHref="/instrukcja"
              align="left"
            />
          </div>
        </Container>
      </div>

      <ServiceGrid heading={tStatements("joinBodywork")} ctaLabel={tStatements("learnMore")} items={services} />

      <TextMedia
        heading={tTeam("heading")}
        body={tTeam("body")}
        ctaLabel={tTeam("cta")}
        ctaHref="/trening-personalny/trenerzy"
        imagePosition="right"
        headingUppercase
        textLayout="split"
        imageSrc="/images/home/team.webp"
        imageAlt={tTeam("heading")}
      />

      <TestimonialCarousel
        heading={tTestimonials("heading")}
        items={tTestimonials.raw("items") as { quote: string; name: string }[]}
      />

      <MeetUsCta
        heading={tMeetUs("heading")}
        body={tMeetUs("body", { phone: tFooter("phone"), email: tFooter("email") })}
        phone={tFooter("phone")}
        email={tFooter("email")}
        callLabel={tMeetUs("call")}
        emailLabel={tMeetUs("sendEmail")}
      />

      <NewsletterSignup />
      <PartnerLogos heading={tPartners("heading")} />
    </>
  );
}
