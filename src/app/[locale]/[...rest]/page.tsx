import { notFound } from "next/navigation";

/**
 * Catch-all whose only job is to hand unmatched URLs to `[locale]/not-found.tsx`.
 *
 * Without it, Next resolves an unmatched path against the **root** `not-found`, and this
 * app deliberately has no root layout (`[locale]` and `(payload)` each own their `<html>`)
 * — so visitors got Next's unstyled built-in 404 instead of ours. A `notFound()` raised
 * from a page *inside* the segment does resolve to the segment's own boundary, which is
 * what this turns every bad URL into.
 *
 * The alternative is Next's `global-not-found`, still behind an experimental flag.
 *
 * Catch-all segments have the lowest routing priority, so this never shadows a real page.
 */
export default async function CatchAllNotFound() {
  notFound();
}
