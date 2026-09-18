import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { routing } from "@/i18n/routing";
import { clientMessages } from "@/i18n/client-namespaces";
import { Header } from "@/components/hub/Header";
import { Footer } from "@/components/hub/Footer";
import { getThemeCss } from "@/lib/get-theme-colors";
import "../../globals.css";

/** Same stand-in typeface as Centrum, see the note in `(centrum)/layout.tsx`. */
const fontSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "BODYWORK",
  icons: {
    icon: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
};

type HubLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * The hub's own root layout: a sibling of `(centrum)/layout.tsx`, not a child of it (Next's
 * "multiple root layouts" pattern, same reason `(payload)` owns its own `<html>` too, see
 * docs/conventions.md). It carries none of Centrum's chrome (`Header`/`Footer`/`PromoBar`)
 * or its `LocalBusiness` structured data, just the shared brand font and colour tokens.
 */
export default async function HubLayout({ children, params }: HubLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const themeCss = await getThemeCss();

  return (
    <html lang={locale} className={`${fontSans.variable} h-full antialiased`}>
      <head>
        <style id="bw-theme">{themeCss}</style>
      </head>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={clientMessages(messages)}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
