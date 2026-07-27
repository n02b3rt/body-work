import type { Media } from "@/payload-types";

/**
 * Payload builds absolute upload URLs from `serverURL`, and this project points
 * `serverURL` at the **dashboard** host so the admin panel links correctly. The public
 * site must not reference that host: in production it is a separate domain that visitors
 * have no business reaching, and `next/image` rejects it outright as an unconfigured
 * remote host.
 *
 * Stripping the origin turns it into a path, which the browser resolves against
 * whatever host served the page, and which `next/image` accepts because
 * `images.localPatterns` in `next.config.ts` allows `/api/media/file/**`.
 */
export function mediaPath(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export type SizeName = "thumbnail" | "card" | "content" | "hero";

/**
 * Pick a generated size, falling back through smaller ones and finally the original.
 * A size is missing whenever the upload was narrower than its target width, see
 * `withoutEnlargement` on the Media collection.
 */
export function mediaFrom(
  value: unknown,
  preferred: SizeName,
  fallbackAlt = "",
): { url: string; alt: string; width?: number; height?: number } | null {
  if (!value || typeof value !== "object") return null;
  const media = value as Media;

  const order: SizeName[] = ["hero", "content", "card", "thumbnail"];
  const candidates = [preferred, ...order.filter((name) => name !== preferred)];

  for (const name of candidates) {
    const size = media.sizes?.[name];
    const url = mediaPath(size?.url);
    if (url) {
      return {
        url,
        alt: media.alt || fallbackAlt,
        width: size?.width ?? undefined,
        height: size?.height ?? undefined,
      };
    }
  }

  const original = mediaPath(media.url);
  return original
    ? {
        url: original,
        alt: media.alt || fallbackAlt,
        width: media.width ?? undefined,
        height: media.height ?? undefined,
      }
    : null;
}
