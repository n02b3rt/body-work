"use client";

import { useTranslations } from "next-intl";
import { SectionNav } from "./SectionNav";
import { SCHEDULE_URL } from "@/lib/external-links";


/** The group-training section's sticky sub-nav.
 *
 * "Grafik zajęć" points at the eFitness booking calendar on the reference — the
 * scraped `/trening-grupowy/grafik-zajec/` page carries no content of its own, only
 * the shared footer, so it is deliberately not built as a route here. */
export function GroupTrainingNav() {
  const t = useTranslations("Nav");

  return (
    <SectionNav
      sectionLabel={t("groupTraining")}
      items={[
        { label: t("groupTrainingClasses"), href: "/trening-grupowy/zajecia-grupowe" },
        { label: t("groupTrainingPlan"), href: "/trening-grupowy/plan-zdrowej-zmiany" },
        { label: t("groupTrainingSchedule"), href: SCHEDULE_URL, external: true },
        { label: t("groupTrainingMedicover"), href: "/trening-grupowy/medicover" },
      ]}
    />
  );
}
