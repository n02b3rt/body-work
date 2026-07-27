import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { intlFormats } from "@/lib/format-date";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Polish date/time formats, shared with the admin panel — see src/lib/format-date.ts.
    formats: intlFormats,
  };
});
