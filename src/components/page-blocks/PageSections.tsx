import { getTranslations } from "next-intl/server";

import { ElementTree } from "@/components/elements/ElementTree";
import { elementCtx, type ElementLabels } from "@/components/elements/types";
import { asRecord } from "@/lib/component-values";
import { sectionAnchor, sectionSpacing, sectionWidth } from "@/lib/page-sections";
import { resolveColorChoice } from "@/lib/theme-css";

/**
 * Renders a page built in the admin page builder.
 *
 * Each entry in `pages.layout` is a **section**: a band across the page with its
 * own width, spacing and background, holding a tree of elements. The frame drawn
 * here is the same one the builder canvas draws, so the preview and the page
 * agree.
 *
 * Uploads and saved compositions arrive populated, which needs `depth: 3` on the
 * query — see `src/lib/cms-page.ts`.
 */
export async function PageSections({ layout }: { layout: unknown }) {
  const sections = Array.isArray(layout) ? layout : [];
  if (sections.length === 0) return null;

  const ctx = elementCtx({ labels: await elementLabels(), mode: "site" });

  return (
    <>
      {sections.map((entry, index) => {
        const section = asRecord(entry);
        if (section.hidden === true) return null;

        const background = resolveColorChoice(
          section.background as { token?: string | null; custom?: string | null } | null,
          null,
        );

        return (
          <section
            id={sectionAnchor(section.anchor)}
            key={typeof section.id === "string" ? section.id : index}
            style={{ background, padding: `${sectionSpacing(section.spacing)} 0` }}
          >
            {/* `bw-el-root` is the query container the element stylesheet reads.
              * It has to sit on the element that is actually as wide as the
              * content, or every container query resolves against the viewport
              * and the builder's phone preview stops matching the phone. */}
            <div
              className="bw-el-root bw-el-stack mx-auto w-full px-4 sm:px-6 lg:px-8"
              style={{ maxWidth: sectionWidth(section.width) }}
            >
              <ElementTree ctx={ctx} elements={section.content} />
            </div>
          </section>
        );
      })}
    </>
  );
}

/**
 * The strings the interactive elements need.
 *
 * Looked up here and handed down as plain props: the same components render
 * inside the admin panel, which has no next-intl provider, so they cannot call
 * `useTranslations` themselves.
 */
async function elementLabels(): Promise<ElementLabels> {
  const gallery = await getTranslations("Gallery");
  const carousel = await getTranslations("Carousel");

  return {
    close: gallery("close"),
    enlarge: gallery("enlarge", { name: "" }).trim(),
    lightbox: gallery("lightbox"),
    next: gallery("next"),
    previous: gallery("previous"),
    slide: carousel("goTo", { index: "" }).trim(),
  };
}
