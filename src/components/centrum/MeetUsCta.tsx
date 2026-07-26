import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";

type MeetUsCtaProps = {
  heading: ReactNode;
  body: ReactNode;
  phone: string;
  email: string;
  callLabel: string;
  emailLabel: string;
};

export function MeetUsCta({ heading, body, phone, email, callLabel, emailLabel }: MeetUsCtaProps) {
  return (
    <section className="border-t border-brand-navy-soft bg-background">
      <Container className="grid gap-8 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <SectionHeading>{heading}</SectionHeading>
        {/* Copy pinned to the top, buttons to the bottom of the column. */}
        <div className="flex h-full flex-col justify-between gap-16">
          <p className="text-body text-brand-navy">{body}</p>
          <div className="flex flex-wrap gap-4">
            <a href={`tel:+48${phone.replace(/\s/g, "")}`} className={buttonClasses("outline")}>
              {callLabel}
            </a>
            <a href={`mailto:${email}`} className={buttonClasses("outline")}>
              {emailLabel}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
