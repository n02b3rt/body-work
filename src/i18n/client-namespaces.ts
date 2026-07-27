/**
 * The message namespaces that have to reach the browser.
 *
 * `getMessages()` returns all 46 namespaces, about **188 KB**, and handing that to
 * `NextIntlClientProvider` shipped every word of every page to every visitor. A post page
 * carried the newsletter status copy, the blog filter labels and the trainer biographies,
 * none of which it renders. Measured: 188 KB against **7.1 KB** for the namespaces client
 * components actually read, so 96% of it was dead weight on every request.
 *
 * Server components read their copy through `getTranslations`, which resolves on the server
 * and sends nothing, so only namespaces used inside a `"use client"` file belong here.
 *
 * **Adding a `useTranslations("Something")` to a client component means adding it here too.**
 * Miss it and next-intl renders the key path instead of the text. `pnpm check:messages`
 * compares this list against the source and fails if they have drifted.
 */
export const CLIENT_NAMESPACES = [
  "Blog",
  "Carousel",
  "Errors",
  "Footer",
  "Header",
  "Nav",
  "News",
  "Newsletter",
  "PromoBar",
  "Services",
  "Statements",
] as const;

/** Narrows a full message object to the namespaces above. */
export function clientMessages<T extends Record<string, unknown>>(all: T): Partial<T> {
  const picked: Record<string, unknown> = {};

  for (const namespace of CLIENT_NAMESPACES) {
    if (namespace in all) picked[namespace] = all[namespace];
  }

  return picked as Partial<T>;
}
