import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Hero } from "@/components/centrum/Hero";
import { NewsCarousel } from "@/components/centrum/NewsCarousel";
import { TextMedia } from "@/components/centrum/TextMedia";
import { StatementSection } from "@/components/centrum/StatementSection";
import { ServiceGrid } from "@/components/centrum/ServiceGrid";
import { TestimonialCarousel } from "@/components/centrum/TestimonialCarousel";
import { NewsletterSignup } from "@/components/centrum/NewsletterSignup";
import { PartnerLogos } from "@/components/centrum/PartnerLogos";

export default async function CentrumHomePage() {
  const tFriendlySpace = await getTranslations("FriendlySpace");
  const tStatements = await getTranslations("Statements");
  const tServices = await getTranslations("Services");
  const tTeam = await getTranslations("Team");
  const tPartners = await getTranslations("Partners");

  const services = [
    { label: tServices("personalTraining"), href: "/trening-personalny" },
    { label: tServices("groupTraining"), href: "/trening-grupowy" },
    { label: tServices("physiotherapy"), href: "/fizjoterapia" },
    { label: tServices("dietetics"), href: "/dietetyka" },
    { label: tServices("massage"), href: "/masaz" },
    { label: tServices("academy"), href: "https://akademia.body-work.pl" },
  ];

  // Real partner logos pending client delivery — see docs/scraped-site-map.md.
  const partners = Array.from({ length: 6 }, (_, index) => `Partner ${index + 1}`);

  return (
    <>
      <Hero />
      <NewsCarousel />

      <TextMedia
        heading={tFriendlySpace("heading")}
        body={tFriendlySpace("body")}
        ctaLabel={tFriendlySpace("cta")}
        ctaHref="/galeria"
        imagePosition="right"
        imageAlt={tFriendlySpace("heading")}
      />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={tStatements("movementTool")} align="center" />
        </Container>
      </div>

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

      <ServiceGrid heading={tStatements("joinBodywork")} items={services} />

      <TextMedia
        heading={tTeam("heading")}
        body={tTeam("body")}
        ctaLabel={tTeam("cta")}
        ctaHref="/trening-personalny/trenerzy"
        imagePosition="left"
        imageAlt={tTeam("heading")}
      />

      <TestimonialCarousel />
      <NewsletterSignup />
      <PartnerLogos heading={tPartners("heading")} partners={partners} />
    </>
  );
}
