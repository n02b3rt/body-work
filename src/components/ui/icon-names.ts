/**
 * Names and viewBoxes only. Deliberately separate from `icon-shapes.ts`.
 *
 * `Icon` is used inside client components (Header, MegaMenu, MobileNav), so whatever it
 * imports is bundled for the browser. It needs a viewBox and an id, nothing else. Keeping
 * the 12 KB of path data in a second module means the client never sees it: the shapes
 * reach the page as markup from the server-rendered sprite instead.
 *
 * Splitting the file rather than relying on tree-shaking is the point. Both would probably
 * work; only one of them is guaranteed.
 *
 * `logo-mark.svg` is deliberately absent: it paints in the mega menu and at the foot of the
 * page, never above the fold, so it stays a lazily loaded file. See `icon-shapes.ts`.
 */

export const ICON_VIEWBOX = {
  logo: "0 0 336 46",
  instagram: "0 0 24 24",
  instagramSolid: "0 0 24 24",
  facebook: "0 0 24 24",
  facebookSolid: "0 0 24 24",
} as const;

export type IconName = keyof typeof ICON_VIEWBOX;
