"use client";

import { useTranslations } from "next-intl";
import { SectionNav } from "./SectionNav";

/** The Bodylab section's sticky sub-nav.
 *
 * `analiza-skadu-ciala` is missing an "ł" on purpose, that is the real slug on the
 * reference, confirmed in both its markup and sitemap.xml. */
export function BodylabNav() {
  const t = useTranslations("Nav");

  return (
    <SectionNav
      sectionLabel={t("bodylab")}
      items={[
        { label: t("bodylabVald"), href: "/bodylab/technologia-vald" },
        { label: t("bodylabComposition"), href: "/bodylab/analiza-skadu-ciala" },
      ]}
    />
  );
}
