import blurMap from "./static-blur.json";

/**
 * Blur placeholders for the static images under `public/images`.
 *
 * The blog's placeholders come from Payload (`blurDataURL` on the Media collection). The marketing
 * pages have no CMS behind them, so theirs are generated at build time by
 * `scripts/generate-blur-placeholders.mjs` and committed as JSON. Re-run that script after adding
 * or replacing an image.
 *
 * **Use this from server components.** The map is 3.4KB of base64 across 18 entries, and importing
 * it into a client component would ship all of it to the browser whether the page needs it or not.
 * A client component should take the string as a prop instead: see how the homepage hands
 * `posterBlur` to `FullBleedVideo`.
 */

const map = blurMap as Record<string, string>;

/** The raw data URI for one public image path, or undefined if it has no placeholder. */
export function blurFor(src: string): string | undefined {
  return map[src];
}

/**
 * Spreadable `next/image` props, empty when there is no placeholder for that path.
 *
 * Written as a spread rather than two separate props because `placeholder="blur"` without a
 * `blurDataURL` is a runtime error in `next/image`, so the pair has to travel together.
 */
export function blurProps(src: string): { placeholder: "blur"; blurDataURL: string } | Record<string, never> {
  const blurDataURL = map[src];
  return blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {};
}
