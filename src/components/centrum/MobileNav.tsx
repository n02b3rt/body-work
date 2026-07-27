"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "./nav-items";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  otherLocale: string;
  pathname: string;
};

/** Full-screen navy drawer for viewports below the nav breakpoint.
 *
 * Stays mounted (rather than returning `null` when closed) so open *and* close can
 * both transition — an unmounted panel has nothing to animate from. While closed
 * it's translated off-screen and made inert so it can't be clicked or tabbed into. */
export function MobileNav({ open, onClose, navItems, otherLocale, pathname }: MobileNavProps) {
  const tHeader = useTranslations("Header");
  const tNav = useTranslations("Nav");

  // Rows fan in one after another, once the panel itself has started moving.
  const stagger = (index: number) => ({ transitionDelay: open ? `${140 + index * 45}ms` : "0ms" });

  const rowClasses = cn(
    "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
    open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
  );

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-brand-navy text-background transition-[opacity,transform] duration-500 ease-out nav:hidden motion-reduce:transition-none",
        open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-full opacity-0",
      )}
    >
      <div className="flex h-[65px] shrink-0 items-center justify-between px-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG wordmark */}
        <img src="/icons/logo.svg" alt="" className="h-6 w-auto brightness-0 invert" />
        <button
          type="button"
          onClick={onClose}
          aria-label={tHeader("closeMenu")}
          className="flex h-10 w-10 items-center justify-center text-background"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            aria-hidden
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          >
            <path d="M4.5 4.5L19.5 19.5M19.5 4.5L4.5 19.5" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8">
        <ul className="divide-y divide-background/20">
          {navItems.map((item, index) => (
            <li key={item.href} className={cn("py-3", rowClasses)} style={stagger(index)}>
              <Link
                href={item.href}
                onClick={onClose}
                className="block text-partner font-light uppercase tracking-[1px] text-background"
              >
                {item.label}
              </Link>
              {item.children ? (
                <ul className="mt-2 space-y-2 pl-4">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      {child.external ? (
                        <a
                          href={child.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-1 text-btn uppercase tracking-[1px] text-background/70"
                        >
                          {child.label}
                        </a>
                      ) : (
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className="block py-1 text-btn uppercase tracking-[1px] text-background/70"
                        >
                          {child.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          <li className={cn("py-3", rowClasses)} style={stagger(navItems.length)}>
            <Link
              href="/kontakt"
              onClick={onClose}
              className="block text-partner font-light uppercase tracking-[1px] text-background"
            >
              {tNav("contact")}
            </Link>
          </li>
        </ul>
      </nav>

      <div
        className={cn("flex shrink-0 items-center justify-between border-t border-background/20 px-4 py-4", rowClasses)}
        style={stagger(navItems.length + 1)}
      >
        <Link
          href={pathname}
          locale={otherLocale}
          onClick={onClose}
          className="text-label font-light uppercase tracking-[1px] text-background"
        >
          {tHeader("languageSwitch")}
        </Link>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/body_work_centrum/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tHeader("instagramAlt")}
            className="block h-7 w-7 shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
            <img src="/icons/instagram-white.svg" alt="" className="h-7 w-7" />
          </a>
          <a
            href="https://www.facebook.com/centrumbodywork/?locale=pl_PL"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tHeader("facebookAlt")}
            className="block h-7 w-7 shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- trusted static SVG icon */}
            <img src="/icons/facebook-white.svg" alt="" className="h-7 w-7" />
          </a>
        </div>
      </div>
    </div>
  );
}
