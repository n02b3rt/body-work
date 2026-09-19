import type { Metadata, Viewport } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/hub/Header";
import { Footer } from "@/components/hub/Footer";
import { HUB_URL, CENTRUM_URL } from "./urls";
import "../../globals.css";

/** Same stand-in typeface as Centrum, see the note in `(centrum)/layout.tsx`. */
const fontSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(HUB_URL),
  applicationName: "BODYWORK",
  icons: {
    icon: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#001e3d",
  colorScheme: "light",
};

type HubLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * The hub's own root layout: a sibling of `(centrum)/layout.tsx`, not a child of it (Next's
 * "multiple root layouts" pattern, same reason `(payload)` owns its own `<html>` too, see
 * docs/conventions.md). It carries none of Centrum's chrome or its `LocalBusiness` data.
 *
 * Deliberately lighter than Centrum's: every hub component is a server component, so there is no
 * `NextIntlClientProvider` shipping message namespaces to the browser, and no `getThemeCss()`,
 * which booted Payload on every render for `--bw-*` tokens no hub component reads.
 */
export default async function HubLayout({ children, params }: HubLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${fontSans.variable} h-full scroll-smooth antialiased motion-reduce:scroll-auto`}>
      <body className="flex min-h-full flex-col bg-background" suppressHydrationWarning>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer centrumUrl={CENTRUM_URL} locale={locale} />
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
