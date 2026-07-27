import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type NoticeLayoutProps = {
  /** Rendered at the display size, fitted to the container — "404", "Błąd", "Gotowe". */
  code: string;
  heading: string;
  body: string;
  /** Buttons / links. */
  children?: ReactNode;
  /** Small print under the actions, e.g. an error reference. */
  footnote?: ReactNode;
};

/**
 * Shared shell for the pages that are one statement and a way out: the 404, the error
 * boundary, and the newsletter confirmation. Uses the same oversized display numeral the
 * reference leans on for its page titles, which is what keeps these looking deliberate
 * rather than like a fallback.
 *
 * (Was `ErrorLayout` — renamed once the newsletter opt-in started using it, since "error"
 * was the wrong word on a page that says "you're subscribed".)
 */
export function NoticeLayout({ code, heading, body, children, footnote }: NoticeLayoutProps) {
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
