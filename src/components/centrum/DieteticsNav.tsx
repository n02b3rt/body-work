"use client";

import { useTranslations } from "next-intl";
import { SectionNav } from "./SectionNav";

/** The dietetics section's sticky sub-nav: the two dietitians' pages. */
export function DieteticsNav() {
  const t = useTranslations("Nav");

  return (
    <SectionNav
      sectionLabel={t("dietetics")}
      items={[
        { label: t("dieteticsSpecialist1"), href: "/dietetyka/iwona-stachowiak" },
        { label: t("dieteticsSpecialist2"), href: "/dietetyka/magdalena-hajduk-warchol" },
      ]}
    />
  );
}
