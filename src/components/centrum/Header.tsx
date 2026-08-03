"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useNavItems } from "./nav-items";
import { MobileNav } from "./MobileNav";
import { MegaMenu } from "./MegaMenu";

const ACADEMY_URL = "https://akademia.body-work.pl";
// Hysteresis (separate enter/exit thresholds) stops the header flip-flopping when
// scroll position hovers right at a single boundary, without it, trackpad/momentum
// scrolling near the threshold made the whole header visibly jump and flicker.
const SCROLL_ENTER = 72;
const SCROLL_EXIT = 24;

// The hover state is the outline mark redrawn as a solid one, so it is a second shape
// rather than a second colour, and the two still cross-fade. Both come out of the sprite.
const socialLinks = [
  {
    href: "https://www.instagram.com/body_work_centrum/",
    key: "instagramAlt" as const,
    icon: "instagram" as const,
    hoverIcon: "instagramSolid" as const,
  },
  {
    href: "https://www.facebook.com/centrumbodywork/?locale=pl_PL",
    key: "facebookAlt" as const,
    icon: "facebook" as const,
    hoverIcon: "facebookSolid" as const,
  },
];

/** The reference breaks these labels after the first word so each sits on two tight
 * lines inside the 80px bar (its markup hard-codes a `<br>` in the same place). */
function SubNavLabel({ label }: { label: string }) {
  const [first, ...rest] = label.split(" ");
  if (rest.length === 0) return <span>{label}</span>;
  return (
    <span>
      {first}
      <br />
      {rest.join(" ")}
    </span>
  );
}

export function Header() {
  const navItems = useNavItems();
  const tHeader = useTranslations("Header");
  const tNav = useTranslations("Nav");
  const tServices = useTranslations("Services");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const otherLocale = locale === "pl" ? "en" : "pl";
  // Only items that actually have children open the sub-nav bar; hovering a plain
  // link still underlines it, and closes whatever bar was open. Suppressed entirely
  // while the hamburger panel is open so the two can't stack on top of each other.
  const activeItem = menuOpen
    ? undefined
    : navItems.find((item) => item.href === hoveredHref && item.children?.length);
  // Opening the menu should visually match the scrolled/compact state (the panel
  // hangs right below a short row 1), not fight it.
  const compact = scrolled || menuOpen;

  // Row 2 (the big wordmark + Akademia/Kontakt) collapses once you scroll past the
  // threshold; row 1's brand slot flip-cards from the tagline to a compact logo at
  // the same moment: matches the reference's "cube" crossfade. The header is
  // `fixed`, not `sticky`, on purpose: a sticky element that changes its own height
  // pushes the page content underneath it in lockstep with the scroll, which is
  // what caused the jump/flicker, a fixed header's height changes don't affect
  // page flow at all, so the shrink is purely visual. `layout.tsx` reserves a
  // matching spacer so content isn't covered on first paint.
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > SCROLL_EXIT : y > SCROLL_ENTER));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Freeze the page behind the open menu. `scrollbar-gutter: stable` on `html`
  // (globals.css) keeps this from shifting the layout.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Escape closes the menu: expected for any overlay panel.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background">
      {/* The divider spans the full viewport edge-to-edge; the content inside stays
       * capped at the site's usual container width: matches the reference, which
       * full-bleeds its background/borders but never its actual content. */}
      <div className="relative border-b border-brand-navy-soft" onMouseLeave={() => setHoveredHref(null)}>
        <Container className="flex h-[65px] items-center justify-between gap-4">
          <Link href="/" className="relative z-10 block shrink-0">
            {/* Below the nav breakpoint there's no room for the fixed-width flip
             * slot, so the compact logo stands on its own there. */}
            <Icon name="logo" label={tHeader("logoAlt")} className="h-6 w-auto text-brand-navy nav:hidden" />
            <span className="hidden h-6 w-56 nav:block" style={{ perspective: "400px" }}>
              <span
                className={cn(
                  "relative block h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d]",
                  compact ? "[transform:rotateX(180deg)]" : "",
                )}
              >
                <span className="absolute inset-0 flex items-center whitespace-nowrap text-label font-light uppercase tracking-[1px] text-brand-navy [backface-visibility:hidden]">
                  {tHeader("tagline")}
                </span>
                <span className="absolute inset-0 flex items-center [backface-visibility:hidden] [transform:rotateX(180deg)]">
                  <Icon name="logo" className="h-6 w-auto text-brand-navy" />
                </span>
              </span>
            </span>
          </Link>

          {/* No gap between items and tighter padding below 1480px: the eight labels
           * need ~800px, and that's what fits at the 1340px switch point. The
           * reference does the same (`e:ph2` → `xo:ph3` at 1480px). */}
          <nav className="hidden h-full flex-1 items-stretch justify-end nav:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredHref(item.href)}
                onFocus={() => setHoveredHref(item.href)}
                className="relative flex items-center whitespace-nowrap px-2 text-label font-light uppercase tracking-[1px] text-brand-navy min-[1480px]:px-3"
              >
                {item.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-0 left-3 w-[calc(100%-1.5rem)] bg-brand-navy transition-[height] duration-100 motion-reduce:transition-none",
                    hoveredHref === item.href ? "h-2" : "h-0",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex h-full shrink-0 items-center">
            {/* Hairline rules on both sides set the hamburger apart from the nav and
             * the social icons, as in the reference. */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? tHeader("closeMenu") : tHeader("openMenu")}
              aria-expanded={menuOpen}
              className={cn(
                "flex h-full w-14 shrink-0 items-center justify-center border-x border-brand-navy-soft transition-colors duration-300",
                menuOpen ? "bg-brand-navy text-background" : "text-brand-navy",
              )}
            >
              {/* The three rules morph into the cross: the middle one fades out while
               * the outer two travel to the centre and rotate. */}
              <span className="relative block h-4 w-6" aria-hidden>
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
                    menuOpen ? "top-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-px w-full bg-current transition-opacity duration-200 motion-reduce:transition-none",
                    menuOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-px w-full bg-current transition-transform duration-300 ease-out motion-reduce:transition-none",
                    menuOpen ? "top-1/2 -rotate-45" : "top-full",
                  )}
                />
              </span>
            </button>

            <div className="hidden items-center gap-4 pl-5 nav:flex">
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={tHeader(social.key)}
                  className="group relative block h-7 w-7 shrink-0"
                >
                  <Icon
                    name={social.icon}
                    className="h-7 w-7 text-brand-navy transition-opacity group-hover:opacity-0"
                  />
                  <Icon
                    name={social.hoverIcon}
                    className="absolute inset-0 h-7 w-7 text-brand-navy opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>

            <Link
              href={pathname}
              locale={otherLocale}
              className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-navy-soft text-label font-light uppercase text-brand-navy hover:opacity-70"
            >
              {tHeader("languageSwitch")}
            </Link>
          </div>
        </Container>

        {/* Sub-nav: a full-bleed bar hanging under the whole header row, with the
         * children laid out horizontally, not a floating card under one item. It
         * lives here (a sibling of the nav, inside the row's `relative` wrapper) so
         * it can span the viewport while still being aligned to the container, and
         * so moving the pointer from a nav link down into it doesn't close it. */}
        <div
          aria-hidden={!activeItem}
          inert={!activeItem}
          // Needs its own `border-t` as well as `border-b` (the reference has both):
          // `top-full` resolves against the wrapper's *padding* box, which excludes
          // its border, so this opaque bar sits directly on top of the header row's
          // bottom rule and would otherwise hide it.
          className={cn(
            "absolute inset-x-0 top-full z-20 hidden h-20 border-y border-brand-navy-soft bg-background transition-opacity duration-300 nav:block motion-reduce:transition-none",
            activeItem ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <Container className="flex h-full items-center">
            {activeItem?.children?.map((child, index) => {
              const label = <SubNavLabel label={child.label} />;
              const className = cn(
                "relative mr-6 flex h-full items-center px-3 text-[0.7934rem] font-light uppercase leading-[1.0625rem] tracking-[1px] text-brand-navy transition-transform duration-300 ease-out motion-reduce:transition-none",
                activeItem ? "translate-y-0" : "translate-y-12",
              );
              const style = { transitionDelay: activeItem ? `${index * 40}ms` : "0ms" };

              return child.external ? (
                <a
                  key={child.href}
                  href={child.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(className, "group")}
                  style={style}
                >
                  {label}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-3 h-0 w-[calc(100%-1.5rem)] bg-brand-navy transition-[height] duration-100 group-hover:h-2 motion-reduce:transition-none"
                  />
                </a>
              ) : (
                <Link key={child.href} href={child.href} className={cn(className, "group")} style={style}>
                  {label}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-3 h-0 w-[calc(100%-1.5rem)] bg-brand-navy transition-[height] duration-100 group-hover:h-2 motion-reduce:transition-none"
                  />
                </Link>
              );
            })}
          </Container>
        </div>
      </div>

      <div
        className={cn(
          "hidden overflow-hidden transition-[grid-template-rows] duration-300 ease-out wide:grid",
          compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="min-h-0">
          <Container
            className={cn(
              "flex items-center justify-between gap-4 py-5 transition-opacity duration-200",
              compact ? "opacity-0" : "opacity-100",
            )}
          >
            <Link href="/" className="shrink-0">
              <Icon name="logo" label={tHeader("logoAlt")} className="h-9 w-auto text-brand-navy sm:h-11" />
            </Link>
            <div className="flex items-center gap-3">
              <a href={ACADEMY_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses("brand")}>
                {tServices("academy")}
              </a>
              <Link href="/kontakt" className={buttonClasses("outline")}>
                {tNav("contact")}
              </Link>
            </div>
          </Container>
        </div>
      </div>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
        otherLocale={otherLocale}
        pathname={pathname}
      />
      <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Below the nav breakpoint the reference floats the Akademia CTA at the bottom
       * of the viewport instead of placing it in the header. */}
      <a
        href={ACADEMY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          buttonClasses("brand"),
          "fixed bottom-4 left-1/2 z-30 -translate-x-1/2 shadow-lg transition-opacity duration-200 wide:hidden",
          menuOpen ? "pointer-events-none opacity-0" : scrolled ? "opacity-0" : "opacity-100",
        )}
      >
        {tServices("academy")}
      </a>
    </header>
  );
}
