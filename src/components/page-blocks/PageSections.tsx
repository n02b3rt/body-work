import { asRecord } from "@/lib/component-values";
import { sectionAnchor, sectionSpacing, sectionWidth } from "@/lib/page-sections";
import { resolveColorChoice } from "@/lib/theme-css";
import { CarouselBlock } from "./CarouselBlock";
import { ComponentButton } from "./ComponentButton";
import { CtaBlock } from "./CtaBlock";
import { FeaturesBlock } from "./FeaturesBlock";
import { GalleryBlock } from "./GalleryBlock";
import { HeroBlock } from "./HeroBlock";

/**
 * Renders a page built in the admin page builder.
 *
 * Each entry in `pages.layout` is a *placement*: a component from
 * "Wygląd → Komponenty" plus this page's own width, spacing and background for
 * it. The frame here is the same one the builder canvas draws, so the preview
 * and the page agree.
 *
 * Sections arrive with the component relationship populated, which needs
 * `depth: 2` on the query: depth 1 resolves the component, depth 2 the media and
 * buttons inside it.
 */
export function PageSections({ layout }: { layout: unknown }) {
  const sections = Array.isArray(layout) ? layout : [];
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((entry, index) => {
        const section = asRecord(entry);
        if (section.hidden === true) return null;

        const doc = asRecord(section.component);
        const type = typeof doc.type === "string" ? doc.type : "";
        const settings = doc[type];
        if (!type) return null;

        const background = resolveColorChoice(
          section.background as { token?: string | null; custom?: string | null } | null,
          null,
        );
        const maxWidth = sectionWidth(section.width);

        return (
          <section
            id={sectionAnchor(section.anchor)}
            key={typeof section.id === "string" ? section.id : index}
            style={{ background, padding: `${sectionSpacing(section.spacing)} 0` }}
          >
            <div
              className="mx-auto w-full px-4 sm:px-6 lg:px-8"
              style={{ maxWidth }}
            >
              <SectionBody settings={settings} type={type} />
            </div>
          </section>
        );
      })}
    </>
  );
}

function SectionBody({ settings, type }: { settings: unknown; type: string }) {
  switch (type) {
    case "button":
      return (
        <div className="flex justify-center">
          <ComponentButton data={settings} />
        </div>
      );
    case "hero":
      return <HeroBlock data={settings} />;
    case "carousel":
      return <CarouselBlock data={settings} />;
    case "gallery":
      return <GalleryBlock data={settings} />;
    case "cta":
      return <CtaBlock data={settings} />;
    case "features":
      return <FeaturesBlock data={settings} />;
    default:
      // An unknown type means the component registry moved on without this
      // placement. Rendering nothing is better than rendering a broken block.
      return null;
  }
}
