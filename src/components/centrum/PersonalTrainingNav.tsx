"use client";

import { useTranslations } from "next-intl";
import { SectionNav } from "./SectionNav";

/** The personal-training section's sticky sub-nav, shared by the hub page and all
 * four of its subpages. Order and hrefs mirror the reference. */
export function PersonalTrainingNav() {
  const t = useTranslations("Nav");

  return (
    <SectionNav
      sectionLabel={t("personalTraining")}
      items={[
        { label: t("personalTrainingIndividual"), href: "/trening-personalny/trening-indywidualny" },
        { label: t("personalTrainingPairs"), href: "/trening-personalny/trening-w-parze" },
        { label: t("personalTrainingAssessment"), href: "/trening-personalny/ocena-funkcjonalna" },
        { label: t("personalTrainingTrainers"), href: "/trening-personalny/trenerzy" },
      ]}
    />
  );
}
