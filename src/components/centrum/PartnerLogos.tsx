import { Container } from "@/components/ui/Container";

type PartnerLogosProps = {
  heading?: string;
  partners: string[];
};

/** Placeholder logo strip — real partner logos pending client delivery (PRD §17.B). */
export function PartnerLogos({ heading, partners }: PartnerLogosProps) {
  return (
    <section className="border-t border-brand-navy-soft bg-background py-16">
      <Container>
        {heading ? (
          <p className="mb-8 text-center text-sm font-semibold uppercase tracking-wide text-brand-navy/60">
            {heading}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((partner) => (
            <div
              key={partner}
              className="flex h-12 w-32 items-center justify-center rounded-lg bg-brand-navy/10 text-xs font-medium text-brand-navy/50"
            >
              {partner}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
