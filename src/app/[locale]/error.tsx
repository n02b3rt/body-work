"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { NoticeLayout } from "@/components/centrum/NoticeLayout";

/**
 * Error boundary for everything under `[locale]`, a rendering failure in any page shows
 * this instead of a blank screen, with the header and footer still in place.
 *
 * Must be a Client Component (Next's requirement for error boundaries), which is also why
 * it can't export `metadata`.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");

  useEffect(() => {
    // Nothing is wired to an error tracker yet, so at least make the real cause visible
    // in the browser console rather than swallowing it behind the friendly copy.
    console.error("[BodyWork] unhandled render error:", error);
  }, [error]);

  return (
    <NoticeLayout
      code={t("errorCode")}
      heading={t("errorHeading")}
      body={t("errorBody")}
      // The digest is the only handle a visitor can quote back to us, so it is shown
      // rather than hidden, but only when Next actually produced one.
      footnote={
        error.digest ? (
          <p className="text-label uppercase tracking-[1px] text-brand-navy/70">
            {t("errorReference")}: {error.digest}
          </p>
        ) : null
      }
    >
      <button type="button" onClick={reset} className={buttonClasses("solid")}>
        {t("tryAgain")}
      </button>
      <Link href="/" className={buttonClasses("outline")}>
        {t("goHome")}
      </Link>
    </NoticeLayout>
  );
}
