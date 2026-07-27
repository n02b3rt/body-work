import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type ErrorLayoutProps = {
  /** Rendered at the display size, fitted to the container — "404", "Błąd". */
  code: string;
  heading: string;
  body: string;
  /** Buttons / links. */
  children?: ReactNode;
  /** Small print under the actions, e.g. an error reference. */
  footnote?: ReactNode;
};

/**
 * Shared shell for the 404 and error pages, so both read as part of the site rather than
 * as a dead end. Uses the same oversized display numeral the reference leans on for its
 * page titles, which is what makes these look deliberate instead of like a fallback.
 */
export function ErrorLayout({ code, heading, body, children, footnote }: ErrorLayoutProps) {
  return (
    <section className="bg-background">
      <Container className="flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
        <SectionHeading as="p" size="display" uppercase>
          {code}
        </SectionHeading>

        <div className="flex flex-col gap-6">
          <SectionHeading as="h1">{heading}</SectionHeading>
          <p className="max-w-[42rem] text-body leading-[1.7] text-brand-navy">{body}</p>
        </div>

        {children ? <div className="flex flex-wrap gap-4">{children}</div> : null}
        {footnote}
      </Container>
    </section>
  );
}
