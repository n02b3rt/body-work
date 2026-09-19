import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SectionIntro } from "./SectionIntro";

/** "Centrum szkoleniowe", word for word from the live homepage. */
export async function TrainingCentre() {
  const t = await getTranslations("Hub.training");
  const body = t.raw("body") as string[];

  return (
    <section id="training" aria-labelledby="training-heading" className="scroll-mt-16 bg-brand-navy py-20 lg:py-28">
      <Container>
        <SectionIntro id="training-heading" heading={t("heading")} inverted>
          {body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </SectionIntro>
      </Container>
    </section>
  );
}
