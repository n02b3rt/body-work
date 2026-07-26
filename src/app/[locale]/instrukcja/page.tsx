import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/centrum/PageHero";
import { CenteredBand } from "@/components/centrum/CenteredBand";
import { StatementSection } from "@/components/centrum/StatementSection";
import { FullBleedImage } from "@/components/centrum/FullBleedImage";
import { MediaCardCta } from "@/components/centrum/MediaCardCta";
import { GALLERY_URL } from "@/lib/external-links";

/** "Instrukcja obsługi ciała" — the long-form philosophy page the homepage's two
 * "Uczymy…" / "Wierzymy…" statements link to. Statement blocks separated by full-bleed
 * photos, then three bullet lists and the trainers/space card pair. */
export default async function BodyManualPage() {
  const t = await getTranslations("BodyManual");

  return (
    <>
      <PageHero title={t("title")} imageSrc="/images/instrukcja/hero.webp" imageAlt={t("title")} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("healthHeading")} body={t("healthBody")} align="left" />
        </Container>
      </div>

      <FullBleedImage src="/images/instrukcja/health-process.webp" alt={t("healthHeading")} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("sittingHeading")} body={t("sittingBody")} align="left" />
        </Container>
      </div>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("effectsHeading")} body={t("effectsBody")} align="left" />
        </Container>
      </div>

      <FullBleedImage src="/images/instrukcja/sitting-effects.webp" alt={t("effectsHeading")} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("movementHeading")} body={t("movementBody")} align="left" />
        </Container>
      </div>

      <FullBleedImage src="/images/instrukcja/movement.webp" alt={t("movementHeading")} />

      <CenteredBand heading={t("bandHeading")} />

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("doseHeading")} body={t("doseBody")} align="left" />
        </Container>
      </div>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("longevityHeading")} body={t("longevityBody")} align="left" />
        </Container>
      </div>

      <div className="border-t border-brand-navy-soft bg-background">
        <Container>
          <StatementSection heading={t("trainHeading")} body={t("trainBody")} align="left" />
        </Container>
      </div>

      {/* The three lists sit side by side from `lg` up, sharing hairline dividers. */}
      <div className="border-t border-brand-navy-soft bg-background">
        <Container className="grid lg:grid-cols-3 lg:divide-x lg:divide-brand-navy-soft">
          <div className="lg:pr-10">
            <StatementSection heading={t("forWhoHeading")} body={t("forWhoBody")} align="left" />
          </div>
          <div className="lg:px-10">
            <StatementSection heading={t("gainHeading")} body={t("gainBody")} align="left" />
          </div>
          <div className="lg:pl-10">
            <StatementSection heading={t("whyHeading")} body={t("whyBody")} align="left" />
          </div>
        </Container>
      </div>

      <FullBleedImage src="/images/instrukcja/why-us.webp" alt={t("whyHeading")} />

      <div className="grid border-t border-brand-navy-soft lg:grid-cols-2 lg:divide-x lg:divide-brand-navy-soft">
        <MediaCardCta
          heading={t("trainersHeading")}
          imageSrc="/images/instrukcja/trainers.webp"
          imageAlt={t("trainersHeading")}
          ctaLabel={t("trainersCta")}
          ctaHref="/trening-personalny/trenerzy"
        />
        <MediaCardCta
          heading={t("spaceHeading")}
          imageSrc="/images/instrukcja/space.webp"
          imageAlt={t("spaceHeading")}
          ctaLabel={t("spaceCta")}
          ctaHref={GALLERY_URL}
          external
        />
      </div>
    </>
  );
}
