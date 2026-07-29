"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/** A year, matching the reference's own `max-age` on these cookies. */
const DISMISS_MAX_AGE = 31536000;

/** Stands in for the cookie string while rendering on the server, where there is no
 * `document`. A cookie string can never contain NUL, so this can't collide with a
 * real one. Rendering under it shows no pills, which is what keeps a dismissed pill
 * from flashing in before hydration replaces this snapshot with the real cookies. */
const NO_DOCUMENT = "\u0000";

type Promo = {
  /** Cookie name is the reference's own, so a dismissal already made there is honoured. */
  cookie: string;
  labelKey: "groupClasses" | "healthyChangePlan";
  href: string;
  tone: "navy" | "cream";
};

const promos: Promo[] = [
  { cookie: "popup1_closed", labelKey: "groupClasses", href: "/trening-grupowy", tone: "navy" },
  {
    cookie: "popup2_closed",
    labelKey: "healthyChangePlan",
    href: "/trening-grupowy/plan-zdrowej-zmiany",
    tone: "cream",
  },
];

// `document.cookie` is external mutable state, so it's read through a store rather
// than mirrored into React state, and only this module ever writes it, so the only
// change worth notifying about is our own.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return document.cookie;
}

function getServerSnapshot() {
  return NO_DOCUMENT;
}

function persistDismissal(cookie: string) {
  document.cookie = `${cookie}=1; path=/; max-age=${DISMISS_MAX_AGE}`;
  for (const listener of listeners) listener();
}

function isDismissed(cookies: string, name: string) {
  return cookies.split(";").some((entry) => entry.trim().startsWith(`${name}=`));
}

/**
 * The reference's standing promo stack, a fixed, dismissible pair of pills in the
 * bottom-right corner of every page (its `<aside class="pf … z99">`, z-index 121).
 *
 * Dismissal is read on the client rather than from `cookies()` in the layout, which
 * would put a request-scoped dependency in every page's shell and foreclose the static
 * rendering the layout's `generateStaticParams` is aiming at. The cost is that the
 * pills appear on hydration rather than on first paint.
 */
export function PromoBar() {
  const t = useTranslations("PromoBar");
  const cookies = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const visible =
    cookies === NO_DOCUMENT ? [] : promos.filter((promo) => !isDismissed(cookies, promo.cookie));

  return (
    // The container spans half the viewport height so the pills stack upward from the
    // bottom edge, and stays click-through: only the pills themselves take pointer
    // events, exactly as on the reference.
    //
    // Below `wide` the stack is lifted clear of the floating "Akademia" CTA that `Header`
    // pins to the bottom centre there. Both were anchored 16px off the bottom edge, so the
    // lowest pill covered the CTA outright at every width from 360 to 1059 (measured: the
    // pill spans the CTA's whole 56px box). The reference has the identical fault and simply
    // lets its `z-index: 121` win over the CTA's 120; see docs/migration-tracker.md.
    //
    // The offset is that CTA's own `bottom-4`, plus its fixed `min-h-14`, plus a gap: it never
    // wraps (measured 177px wide at a 360 viewport), so its height is not going to move.
    <aside className="pointer-events-none fixed right-1 bottom-[calc(1rem+3.5rem+0.5rem)] z-[121] flex min-h-[50vh] flex-col items-end justify-end wide:right-7 wide:bottom-7">
      {visible.map((promo) => (
        <div
          key={promo.cookie}
          className={cn(
            "pointer-events-auto m-3 flex items-center rounded-full border border-brand-navy px-7 transition-colors duration-[400ms]",
            promo.tone === "navy" ? "bg-brand-navy text-background" : "bg-background text-brand-navy",
          )}
        >
          <Link
            href={promo.href}
            className="block w-full py-[1.375rem] text-center text-btn font-normal uppercase tracking-[0.1em]"
          >
            {t(promo.labelKey)}
          </Link>
          <button
            type="button"
            onClick={() => persistDismissal(promo.cookie)}
            aria-label={t("close")}
            className="-mr-4 ml-4 flex shrink-0 cursor-pointer items-center justify-center p-1"
          >
            {/* Stroked cross, not a `×` glyph, that never sits optically centred. */}
            <svg width="19" height="19" viewBox="0 0 19 19" aria-hidden fill="none">
              <path d="M4 4L15 15M15 4L4 15" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      ))}
    </aside>
  );
}
