"use client";

import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { NoticeLayout } from "@/components/centrum/NoticeLayout";

/**
 * The 404 every visitor reaches — unmatched URLs arrive here via the `[...rest]`
 * catch-all, and `notFound()` (e.g. an unknown blog slug) resolves to it directly.
 *
 * **It is a Client Component out of necessity, and that was worth establishing.** Both
 * `getTranslations()` and `getTranslations({ locale: await getLocale() })` throw inside a
 * not-found boundary — the request locale is never established for one — and when this
 * file threw, Next silently swapped in its own blank built-in 404. That failure looks
 * exactly like "the boundary isn't wired up", which is a trap worth knowing about.
 * `useTranslations` works because the locale layout, with next-intl's provider, still
 * renders around this page.
 *
 * The trade-off: the copy is hydrated rather than server-rendered, so the initial HTML is
 * empty. Acceptable here — the 404 **status** is what search engines act on, and the page
 * is fully rendered for every real visitor (verified in a browser).
 *
 * Next's root-level `global-not-found` would also cover the few paths the proxy skips
 * (anything with a file extension), but it is still behind an experimental flag.
 */
export default function NotFound() {
  const t = useTranslations("Errors");
  const tNav = useTranslations("Nav");
  const tFooter = useTranslations("Footer");

  const links = [
    { href: "/", label: t("goHome") },
    { href: "/trening-personalny", label: tNav("personalTraining") },
    { href: "/cennik", label: tNav("pricing") },
    { href: "/blog", label: tNav("blog") },
    { href: "/kontakt", label: tNav("contact") },
  ];

  const phone = tFooter("phone");

  return (
    <NoticeLayout
      code={t("notFoundCode")}
      heading={t("notFoundHeading")}
      body={t("notFoundBody")}
      // The copy offers to put the visitor through to reception, so the number belongs
      // here — reusing the footer's own values rather than repeating them by hand.
      footnote={
        <p className="text-body text-brand-navy">
          <a href={`tel:+48${phone.replace(/\s/g, "")}`} className="hover:underline">
            {phone}
          </a>
          {" · "}
          <a href={`mailto:${tFooter("email")}`} className="hover:underline">
            {tFooter("email")}
          </a>
        </p>
      }
    >
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={buttonClasses("outline")}>
          {link.label}
        </Link>
      ))}
    </NoticeLayout>
  );
}
