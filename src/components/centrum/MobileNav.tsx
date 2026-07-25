"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { NavItem } from "./nav-items";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  otherLocale: string;
  pathname: string;
};

export function MobileNav({ open, onClose, navItems, otherLocale, pathname }: MobileNavProps) {
  const tHeader = useTranslations("Header");
  const tNav = useTranslations("Nav");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden">
      <div className="flex h-20 items-center justify-between px-4">
        <span className="text-xl font-bold uppercase tracking-[0.15em] text-brand-navy">BODYWORK</span>
        <button
          type="button"
          onClick={onClose}
          aria-label={tHeader("closeMenu")}
          className="flex h-10 w-10 items-center justify-center text-2xl text-brand-navy"
        >
          &times;
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8">
        <ul className="divide-y divide-brand-navy-soft">
          {navItems.map((item) => (
            <li key={item.href} className="py-3">
              <Link
                href={item.href}
                onClick={onClose}
                className="block text-lg font-semibold uppercase tracking-wide text-brand-navy"
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
                          className="block py-1 text-sm text-brand-navy/80"
                        >
                          {child.label}
                        </a>
                      ) : (
                        <Link href={child.href} onClick={onClose} className="block py-1 text-sm text-brand-navy/80">
                          {child.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
          <li className="py-3">
            <Link href="#kontakt" onClick={onClose} className="block text-lg font-semibold uppercase tracking-wide text-brand-navy">
              {tNav("contact")}
            </Link>
          </li>
        </ul>
      </nav>

      <div className="flex items-center justify-between border-t border-brand-navy-soft px-4 py-4">
        <Link href={pathname} locale={otherLocale} onClick={onClose} className="text-sm font-semibold uppercase text-brand-navy">
          {tHeader("languageSwitch")}
        </Link>
        <div className="flex gap-3">
          <a
            href="https://www.instagram.com/body_work_centrum/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tHeader("instagramAlt")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-navy-soft text-xs font-semibold text-brand-navy"
          >
            IG
          </a>
          <a
            href="https://www.facebook.com/centrumbodywork/?locale=pl_PL"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tHeader("facebookAlt")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-navy-soft text-xs font-semibold text-brand-navy"
          >
            FB
          </a>
        </div>
      </div>
    </div>
  );
}
