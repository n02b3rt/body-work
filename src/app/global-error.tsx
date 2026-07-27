"use client";

import { useEffect } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// This file replaces the root layout when it renders, so it has to bring its own document
// shell, styles and font: nothing above it is available.
const fontSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
});

/**
 * Last resort: a failure in the locale layout itself, before any translation provider
 * exists. That rules out `useTranslations`, so the copy here is hard-coded, and Polish,
 * the default locale, because at this point we cannot know which one was requested.
 *
 * Deliberately plain: whatever broke may well be the thing this page would depend on.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[BodyWork] fatal error:", error);
  }, [error]);

  return (
    <html lang="pl" className={`${fontSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background">
        {/* `global-error` can't export metadata (it's a Client Component), so the title
          * comes from React's own <title> support. */}
        <title>Błąd | BODYWORK Centrum</title>
        <main className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-8 py-16">
              <p className="text-h-mobile text-brand-navy wide:text-h-section">BODYWORK</p>
              <h1 className="text-h-mobile text-brand-navy wide:text-h-section">
                Strona chwilowo nie działa.
              </h1>
              <p className="max-w-[42rem] text-body leading-[1.7] text-brand-navy">
                Pracujemy nad tym. Spróbuj odświeżyć stronę, a jeśli problem się powtarza: zadzwoń
                do recepcji pod{" "}
                <a href="tel:+48609805660" className="hover:underline">
                  609 805 660
                </a>{" "}
                albo napisz na{" "}
                <a href="mailto:info@body-work.pl" className="hover:underline">
                  info@body-work.pl
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex min-h-14 w-fit items-center justify-center rounded-full border border-brand-navy bg-brand-navy px-7 text-btn font-normal uppercase tracking-[0.1em] text-background transition-colors hover:bg-background hover:text-brand-navy"
                >
                  Spróbuj ponownie
                </button>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a plain
                  * anchor on purpose: this renders when the React tree itself failed, so a
                  * full page load is more likely to recover than client-side navigation. */}
                <a
                  href="/"
                  className="inline-flex min-h-14 w-fit items-center justify-center rounded-full border border-brand-navy-soft bg-background px-7 text-btn font-normal uppercase tracking-[0.1em] text-brand-navy transition-colors hover:bg-brand-navy hover:text-background"
                >
                  Strona główna
                </a>
              </div>
              {error.digest ? (
                <p className="text-label uppercase tracking-[1px] text-brand-navy/70">
                  Numer zgłoszenia: {error.digest}
                </p>
              ) : null}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
