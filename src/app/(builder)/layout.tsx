import type { Metadata } from "next";
import "../globals.css";
import "../../styles/builder-ui.css";

/**
 * Own `<html>`, same reason `[locale]` and `(payload)` each have one: this app
 * has no root layout, so every top-level route group owns its own document
 * shell. Tailwind comes along with `globals.css` (the whole point of this
 * route group existing outside `(payload)`, where Tailwind is unavailable);
 * no next-intl, since the editor chrome is Polish-only, same as the admin panel.
 */
export const metadata: Metadata = {
  title: "Kreator stron: BodyWork Panel",
  robots: { index: false, follow: false },
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="h-full bg-surface-alt text-text-body" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
