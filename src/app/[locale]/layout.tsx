import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/i18n/client-namespaces";
import { Header } from "@/components/centrum/Header";
import { Footer } from "@/components/centrum/Footer";
import { PromoBar } from "@/components/centrum/PromoBar";
import { getThemeCss } from "@/lib/get-theme-colors";
import { localBusinessJsonLd } from "@/lib/structured-data";
import "../globals.css";

// Temporary stand-in for the real typeface (Circular Pro Book, a paid Lineto
// font found in the scrape's @font-face rules) pending a licensing decision,
// see docs/scraped-site-map.md. `latin-ext` is required for Polish diacritics.
const fontSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "BODYWORK Centrum",
  description:
    "BODYWORK: centrum treningu personalnego, fizjoterapii, dietetyki i masażu w Poznaniu.",
  icons: {
    icon: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
};

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Opts this tree into static rendering. Without it, reading any next-intl API in a Server
  // Component marks the route dynamic, which is why every page in the build was `f` and
  // every response carried `Cache-Control: no-store`.
  setRequestLocale(locale);

  const messages = await getMessages();
  const themeCss = await getThemeCss();

  // One LocalBusiness block for the whole site. Values come from the footer's own strings so
  // the address lives in a single place. See src/lib/structured-data.ts for why the type is
  // HealthAndBeautyBusiness rather than MedicalBusiness.
  const tFooter = await getTranslations({ locale, namespace: "Footer" });
  const business = localBusinessJsonLd({
    streetAddress: tFooter("addressLine2"),
    postalCodeAndCity: tFooter("addressLine3"),
    phone: tFooter("phone"),
    email: tFooter("email"),
  });

  return (
    <html lang={locale} className={`${fontSans.variable} h-full antialiased`}>
      <head>
        {/* Palette from Wygląd → Schemat kolorów, as `--bw-*` custom properties on :root.
          * `globals.css` aliases them into Tailwind colour tokens with static fallbacks, so
          * an unsaved global or an unreachable database degrades to those rather than
          * leaving the page unstyled. This block arrived with the media-library branch,
          * which put it in the old `(frontend)/layout.tsx`; that route group no longer
          * exists, so it lives here: the locale layout owns `<html>` now. */}
        <style id="bw-theme">{themeCss}</style>
        <script
          type="application/ld+json"
          // Our own object, serialised by us. No user input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
        />
      </head>
      {/* Extensions (Grammarly, Video Speed Controller, …) often mutate <body>
        * attributes before hydration; without this React logs a recoverable mismatch. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* Only the namespaces a client component actually reads. `getMessages()` returns
          * all 46, about 188KB, and shipping the lot put the trainer biographies and the
          * newsletter status copy into every page's payload. See
          * `src/i18n/client-namespaces.ts`; `pnpm check:messages` guards the list. */}
        <NextIntlClientProvider locale={locale} messages={clientMessages(messages)}>
          <Header />
          {/* Header is `fixed`, so this reserves its (tallest, unscrolled) height in
           * normal flow: must stay in sync with Header's row1 (65px) + row2 (96px
           * from 1060px up, hidden below it). */}
          <div className="h-[65px] wide:h-[161px]" aria-hidden />
          <main className="flex-1">{children}</main>
          <Footer />
          {/* Standing promo pills, bottom-right on every page, as on the reference. */}
          <PromoBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
