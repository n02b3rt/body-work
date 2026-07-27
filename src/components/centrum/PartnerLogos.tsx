import Image from "next/image";
import { Container } from "@/components/ui/Container";

type PartnerLogosProps = {
  heading?: string;
};

// Real logos from the scraped reference (scripts/scrape/scraped/home/media/): brand
// names aren't recoverable from the source, so alt text stays generic until the
// client identifies them.
const partners = Array.from({ length: 7 }, (_, index) => ({
  src: `/images/home/partner-${index + 1}.webp`,
  alt: `Partner ${index + 1}`,
}));

// Duplicated so the marquee (see the `marquee` keyframes in globals.css) can loop
// seamlessly, a -50% translate lands exactly on the start of the second copy.
const track = [...partners, ...partners];

export function PartnerLogos({ heading }: PartnerLogosProps) {
  return (
    // Vertical padding lives on the columns, not the section, so the slanted rule
    // between them can stretch the section's full height rather than stopping at the
    // padding edge.
    <section className="border-t border-brand-navy-soft bg-background">
      <Container className="flex items-stretch gap-12">
        <div className="flex shrink-0 flex-col justify-between gap-12 py-16">
          {heading ? (
            <p className="max-w-28 text-partner uppercase leading-tight text-brand-navy">{heading}</p>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG mark, no raster optimization needed */}
          <img src="/icons/logo-mark.svg" alt="" className="h-16 w-auto" />
        </div>

        <div className="w-px shrink-0 -skew-x-[19deg] bg-brand-navy-soft" aria-hidden />

        {/* Logo box and gap are the reference's own values (`.partner-logo`:
         * 180×96px, 48px margin-right); it also paces the scroll at 3s per logo.
         * Bottom-aligned so the strip runs along the base of the section. */}
        <div className="flex flex-1 items-end overflow-hidden py-16">
          <div className="flex w-max animate-[marquee_21s_linear_infinite] items-end gap-12">
            {track.map((partner, index) => (
              <div key={`${partner.src}-${index}`} className="relative h-24 w-[180px] shrink-0">
                <Image src={partner.src} alt={partner.alt} fill sizes="180px" className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
