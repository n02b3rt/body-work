import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export type LegalSection = { heading: string; body: string };

type LegalDocumentProps = {
  /** Line under the page title — the effective date on the terms, the scope line on
   * the privacy policy. */
  intro?: string;
  sections: LegalSection[];
};

/** Long-form legal prose: body size, a measure capped near 70 characters, and a looser
 * line-height than the site's default 1.53, because these are paragraphs people have to
 * read through rather than scan. */
const proseClasses = "max-w-[42rem] whitespace-pre-line text-body leading-[1.7] text-brand-navy";

/**
 * `/regulamin` and `/polityka-prywatnosci`.
 *
 * **Three deliberate deviations from the reference**, which treats these documents with
 * the same display styling as its marketing pages and ends up unreadable:
 *
 * 1. The reference sets `ho:f7s6` (~39.5px, its oversized opening-statement size) on
 *    every paragraph of both documents. Here they are body size.
 * 2. The reference puts the text in the **right** half of a two-column row and leaves
 *    the left half empty. Here each section is one left-aligned column, which also stops
 *    the fixed promo pills in the bottom-right corner from landing on top of the text.
 * 3. Section headings are `menu` size (~34px) rather than the reference's ~68px section
 *    size — at eleven numbered sections, that size reads as eleven page titles.
 *
 * Recorded in `docs/migration-tracker.md`. Content is still verbatim; this is styling.
 */
export function LegalDocument({ intro, sections }: LegalDocumentProps) {
  return (
    <>
      {intro ? (
        <Container className="pb-12 lg:pb-16">
          <p className={proseClasses}>{intro}</p>
        </Container>
      ) : null}

      {sections.map((section) => (
        <section key={section.heading} className="border-t border-brand-navy-soft bg-background">
          <Container className="flex flex-col gap-6 py-10 lg:gap-8 lg:py-14">
            <SectionHeading as="h2" size="menu">
              {section.heading}
            </SectionHeading>
            <p className={proseClasses}>{section.body}</p>
          </Container>
        </section>
      ))}
    </>
  );
}
