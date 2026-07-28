/**
 * How wide an in-article image is allowed to render.
 *
 * Two problems this solves, both raised by the client after looking at real posts.
 *
 * **Images were soft.** The tablecloth photograph in "Czy to na pewno rwa kulszowa?" is
 * 1024x702 and was rendering at 1024 CSS px. On a 2x display that needs 2048 device pixels and
 * only 1024 exist, so it looks slightly pixelated. No amount of re-encoding fixes that: the
 * pixels are not in the file. Rendering it smaller does.
 *
 * **There was no way to choose.** Every image filled whatever width was available. An editor
 * can now pick from a short list per image, and anything left alone gets a sensible size worked
 * out from the file itself.
 */

export const IMAGE_DISPLAY_SIZES = {
  small: 480,
  medium: 720,
  large: 1024,
  /** The article container itself, 1440px capped less its padding. */
  full: 1376,
} as const;

export type ImageDisplaySize = keyof typeof IMAGE_DISPLAY_SIZES;

/** What the editor sees in the panel. Values match the keys above. */
export const IMAGE_DISPLAY_OPTIONS = [
  { label: 'Automatycznie (dopasuj do rozdzielczości pliku)', value: 'auto' },
  { label: 'Mała, 480 px', value: 'small' },
  { label: 'Średnia, 720 px', value: 'medium' },
  { label: 'Duża, 1024 px', value: 'large' },
  { label: 'Pełna szerokość', value: 'full' },
] as const;

/**
 * Doubling the displayed width is what a 2x screen needs to look sharp, so `auto` picks the
 * largest step that stays inside half the file's own width.
 *
 * Where even the smallest step would need pixels the file does not have, it falls back to the
 * largest step that at least avoids upscaling, and finally to the file's own width. A small
 * image then renders small, which is honest: better a crisp 400px photograph than a blurry one
 * stretched across the column.
 */
export function autoDisplayWidth(intrinsicWidth: number | null | undefined): number | null {
  if (!intrinsicWidth || intrinsicWidth <= 0) return null;

  const steps = Object.values(IMAGE_DISPLAY_SIZES).sort((a, b) => b - a);

  const crisp = steps.find((step) => step <= intrinsicWidth / 2);
  if (crisp) return crisp;

  const noUpscale = steps.find((step) => step <= intrinsicWidth);
  if (noUpscale) return noUpscale;

  return intrinsicWidth;
}

/**
 * The width to render at: the editor's choice when there is one, otherwise `auto`.
 *
 * A chosen size is still never allowed to exceed the file's own width, because upscaling is the
 * thing that made 75 of the 150 in-article images mushy in the first place. Pick "Pełna
 * szerokość" for a 400px image and it renders at 400px.
 */
export function resolveDisplayWidth(
  choice: string | null | undefined,
  intrinsicWidth: number | null | undefined,
): number | null {
  if (!choice || choice === 'auto') return autoDisplayWidth(intrinsicWidth);

  const requested = IMAGE_DISPLAY_SIZES[choice as ImageDisplaySize];
  if (!requested) return autoDisplayWidth(intrinsicWidth);

  if (!intrinsicWidth) return requested;
  return Math.min(requested, intrinsicWidth);
}
