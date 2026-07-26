import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export type LegalSection = { heading: string; body: string };

type LegalDocumentProps = {
  /** Line under the page title — the effective date on the terms, the scope line on
   * the privacy policy. */
  intro?: string;
  sections: LegalSection[];
};

/**
 * The reference's shape for `/regulamin` and `/polityka-prywatnosci`: each numbered
 * section is a full-width heading, then the text in the **right** half of a two-column
 * row whose left half is empty (and collapses on mobile).
 *
 * The body renders at `text-statement` (~39.5px on desktop) because that is genuinely
 * what the reference uses for these documents — `ho:f7s6`, the same oversized paragraph
 * size as the homepage's opening statement. It is a surprising choice for a T&C, so it
 * is reproduced deliberately rather than quietly "corrected" down to body size.
 */
export function LegalDocument({ intro, sections }: LegalDocumentProps) {
  return (
    <>
      {intro ? (
        <Container className="grid pb-12 lg:grid-cols-2 lg:pb-16">
          <div className="hidden lg:block" />
          <p className="text-body whitespace-pre-line text-brand-navy wide:text-statement">{intro}</p>
        </Container>
      ) : null}

      {sections.map((section) => (
        <section key={section.heading} className="border-t border-brand-navy-soft bg-background">
          <Container className="py-10 lg:py-14">
            <SectionHeading as="h2">{section.heading}</SectionHeading>
          </Container>
          <Container className="grid pb-12 lg:grid-cols-2 lg:pb-16">
            <div className="hidden lg:block" />
            <p className="text-body whitespace-pre-line text-brand-navy wide:text-statement">{section.body}</p>
          </Container>
        </section>
      ))}
    </>
  );
}
