"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { useNavItems } from "./nav-items";
import { MobileNav } from "./MobileNav";

const socialLinks = [
  { href: "https://www.instagram.com/body_work_centrum/", key: "instagramAlt" as const },
  { href: "https://www.facebook.com/centrumbodywork/?locale=pl_PL", key: "facebookAlt" as const },
];

export function Header() {
  const navItems = useNavItems();
  const tHeader = useTranslations("Header");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const otherLocale = locale === "pl" ? "en" : "pl";

  return (
    <header className="sticky top-0 z-40 border-b border-brand-navy-soft bg-background/95 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0 text-xl font-bold uppercase tracking-[0.15em] text-brand-navy">
          BODYWORK
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {navItems.map((item) => (
            <div key={item.href} className="group relative">
              <Link
                href={item.href}
                className="block whitespace-nowrap px-3 py-2 text-sm font-medium uppercase tracking-wide text-brand-navy transition-colors hover:opacity-70"
              >
                {item.label}
              </Link>
              {item.children ? (
                <div className="invisible absolute left-0 top-full z-20 min-w-60 -translate-y-1 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <ul className="mt-2 space-y-1 rounded-2xl border border-brand-navy-soft bg-background p-3 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        {child.external ? (
                          <a
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg px-3 py-2 text-sm text-brand-navy hover:bg-brand-surface"
                          >
                            {child.label}
                          </a>
                        ) : (
                          <Link
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-brand-navy hover:bg-brand-surface"
                          >
                            {child.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          {socialLinks.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tHeader(social.key)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-navy-soft text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
            >
              <span className="text-xs font-semibold">{social.key === "instagramAlt" ? "IG" : "FB"}</span>
            </a>
          ))}
          <Link
            href={pathname}
            locale={otherLocale}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-navy-soft text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-navy hover:text-white"
          >
            {tHeader("languageSwitch")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label={tHeader("openMenu")}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 lg:hidden"
        >
          <span className="h-px w-6 bg-brand-navy" />
          <span className="h-px w-6 bg-brand-navy" />
          <span className="h-px w-6 bg-brand-navy" />
        </button>
      </Container>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navItems={navItems}
        otherLocale={otherLocale}
        pathname={pathname}
      />
    </header>
  );
}
