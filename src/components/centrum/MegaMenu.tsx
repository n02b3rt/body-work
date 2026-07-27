"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SCHEDULE_URL, FACEBOOK_URL, INSTAGRAM_URL, MAP_URL } from "@/lib/external-links";
import { Container } from "@/components/ui/Container";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";


type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
};

/** Desktop hamburger panel (from the nav breakpoint up), a 5-column layout,
 * distinct from both the header's hover dropdowns and the mobile drawer. Content and
 * hrefs verified directly against scripts/scrape/scraped/home/index.html, not
 * inferred from the hover-dropdown menu: notably "Dietetyka" has no children column
 * here (the reference omits them in this specific panel). "Grafik zajęć" links out to
 * eFitness like the hover dropdown does: the reference points it at an internal page
 * here, but that page has no content of its own, so this follows the working link.
 *
 * Stays mounted while closed so the close animation has something to run on; it's
 * height-collapsed, faded and inert in that state. */
export function MegaMenu({ open, onClose }: MegaMenuProps) {
  const t = useTranslations("Nav");
  const tHeader = useTranslations("Header");

  const columns = [
    {
      heading: t("personalTraining"),
      headingHref: "/trening-personalny",
      links: [
        { label: t("personalTrainingIndividual"), href: "/trening-personalny/trening-indywidualny" },
        { label: t("personalTrainingPairs"), href: "/trening-personalny/trening-w-parze" },
        { label: t("personalTrainingAssessment"), href: "/trening-personalny/ocena-funkcjonalna" },
        { label: t("personalTrainingTrainers"), href: "/trening-personalny/trenerzy" },
      ],
    },
    {
      heading: t("physiotherapy"),
      headingHref: "/fizjoterapia",
      links: [
        { label: t("physiotherapyManual"), href: "/fizjoterapia/terapia-manualna" },
        { label: t("physiotherapyRehab"), href: "/fizjoterapia/rehabilitacja-ruchowa" },
        { label: t("physiotherapyBelly"), href: "/fizjoterapia/zdrowy-brzuch" },
        { label: t("physiotherapySpecialists"), href: "/fizjoterapia/specjalisci" },
      ],
    },
    {
      heading: t("groupTraining"),
      headingHref: "/trening-grupowy",
      links: [
        { label: t("groupTrainingClasses"), href: "/trening-grupowy/zajecia-grupowe" },
        { label: t("groupTrainingPlan"), href: "/trening-grupowy/plan-zdrowej-zmiany" },
        // The schedule lives on eFitness. The reference points this entry at an internal
        // page that has no content of its own, see the note on SCHEDULE_URL.
        { label: t("groupTrainingSchedule"), href: SCHEDULE_URL, external: true },
        { label: t("groupTrainingMedicover"), href: "/trening-grupowy/medicover" },
      ],
    },
    {
      heading: t("bodylab"),
      headingHref: "/bodylab",
      links: [
        { label: t("bodylabVald"), href: "/bodylab/technologia-vald" },
        { label: t("bodylabComposition"), href: "/bodylab/analiza-skadu-ciala" },
      ],
    },
  ];

  const flatLinks = [
    { label: t("dietetics"), href: "/dietetyka" },
    { label: t("pricing"), href: "/cennik" },
    { label: t("massage"), href: "/masaz" },
    { label: t("blog"), href: "/blog" },
    { label: t("contact"), href: "/kontakt" },
  ];

  // Columns rise into place one after another as the panel opens; on close they all
  // leave together so dismissing feels immediate rather than sluggish.
  const stagger = (index: number) => ({ transitionDelay: open ? `${120 + index * 60}ms` : "0ms" });

  const columnClasses = cn(
    "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
    open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
  );

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      // Fade + slide rather than animating height: the panel's own height varies with
      // content, so a max-height tween would finish revealing well before the
      // transition ends and read as mistimed.
      className={cn(
        "fixed inset-x-0 top-[65px] z-30 hidden max-h-[calc(100vh-65px)] overflow-hidden border-t border-brand-navy-soft bg-background transition-[opacity,transform] duration-500 ease-out nav:block motion-reduce:transition-none",
        open ? "translate-y-0 overflow-y-auto opacity-100" : "pointer-events-none -translate-y-3 opacity-0",
      )}
    >
      <Container className="py-10">
        <div className={columnClasses} style={stagger(0)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG mark, no raster optimization needed */}
          <img src="/icons/logo-mark.svg" width={86} height={121} alt="" className="h-24 w-auto" />
        </div>

        <div className="mt-10 grid grid-cols-5 divide-x divide-brand-navy-soft border-t border-brand-navy-soft pt-10">
          {columns.map((column, index) => (
            <div
              key={column.headingHref}
              className={cn("flex flex-col gap-6 px-10 first:pl-0", columnClasses)}
              style={stagger(index + 1)}
            >
              <Link href={column.headingHref} onClick={onClose} className="text-h-menu text-brand-navy">
                {column.heading}
              </Link>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="text-label uppercase tracking-[1px] text-brand-navy hover:opacity-70"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className="text-label uppercase tracking-[1px] text-brand-navy hover:opacity-70"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={cn("flex flex-col gap-4 px-10", columnClasses)} style={stagger(columns.length + 1)}>
            {flatLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-h-menu text-brand-navy hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tHeader("instagramAlt")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-navy-soft transition-colors hover:bg-brand-navy/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
                <img src="/icons/instagram.svg" alt="" className="h-5 w-5" />
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tHeader("facebookAlt")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-navy-soft transition-colors hover:bg-brand-navy/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
                <img src="/icons/facebook.svg" alt="" className="h-5 w-5" />
              </a>
              <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("outline")}>
                {tHeader("mapDirections")}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
