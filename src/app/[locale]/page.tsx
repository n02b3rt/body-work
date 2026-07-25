import { getTranslations } from "next-intl/server";
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

export default async function CentrumHomePage() {
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
      <Hero />
      <FullBleedVideo src="/videos/hero.mp4" />

      {/* The opening statement's body copy is deliberately oversized on the
       * reference (`ho:f7s6`, ~40px) — it reads as a statement, not as body text. */}
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
        ctaHref="/galeria"
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
