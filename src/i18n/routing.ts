import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
  /**
   * No `Accept-Language` sniffing.
   *
   * With it on, a browser asking for English got a **307 to `/en/...`** on its first visit to
   * any page. Lighthouse measured 175ms of redirect for nothing, and worse, `/en` serves the
   * Polish article text for all 62 posts, so detection actively sent people to the copy of
   * the site that is not translated. The canonical tags already point at the Polish URL for
   * the same reason.
   *
   * The EN toggle in the header still works for anyone who wants it.
   */
  localeDetection: false,
});
