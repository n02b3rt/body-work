"use client";

import { useTranslations } from "next-intl";
import { SectionNav } from "./SectionNav";

/** The physiotherapy section's sticky sub-nav, shared by the hub page and all four
 * of its subpages. Order and hrefs mirror the reference. */
export function PhysiotherapyNav() {
  const t = useTranslations("Nav");

  return (
    <SectionNav
      sectionLabel={t("physiotherapy")}
      items={[
        { label: t("physiotherapyManual"), href: "/fizjoterapia/terapia-manualna" },
        { label: t("physiotherapyRehab"), href: "/fizjoterapia/rehabilitacja-ruchowa" },
        { label: t("physiotherapyBelly"), href: "/fizjoterapia/zdrowy-brzuch" },
        { label: t("physiotherapySpecialists"), href: "/fizjoterapia/specjalisci" },
      ]}
    />
  );
}
