# Appearance (Wygląd)

Admin section for the site's visual theme: a global colour scheme applied to
the whole site, and the editor's own saved compositions — reusable arrangements
of elements from the page builder's library.

## Colour scheme (`theme-colors` global)

- Tokens are defined once in `src/lib/theme-tokens.ts` (groups: brand, text,
  surface, state). Each token has a form path (`brand.primary`), a CSS
  variable (`--bw-primary`) and a default hex value.
- The global `src/globals/ThemeColors.ts` builds its tabs/fields
  programmatically from that token list, adding a token there is enough to
  get an admin field and a CSS variable.
- Colour fields use a custom `ColorField` component (swatch + hex input).
  `ThemePresets` applies a full palette in one click (`src/lib/theme-presets.ts`);
  `ThemePreview` renders a live mock (buttons, card, states) from form state.
- On the public site, `src/lib/get-theme-colors.ts` reads the global and
  `src/lib/theme-css.ts` turns it into a `:root { --bw-*: … }` block, injected
  in `(frontend)/layout.tsx`. `globals.css` maps `--bw-*` to Tailwind
  `@theme inline` colours (`--color-brand`, `--color-heading`, …) with
  fallbacks, so the site renders even if the global was never saved.

## Components (`site-components` collection)

**Saved compositions, not widgets.** The collection used to hold one document
per configured hero / button / gallery, with a `type` select deciding which
parameter group showed. That job moved into the **element library**
(`src/fields/elements/`), where a widget is configured where it is placed.

What is left here is the thing the library cannot express: "a two-column row
with a photograph on the left and a heading, a paragraph and a button on the
right", saved under a name and dropped into any page as one item.

- Fields: `name`, `category` (sekcja / nagłówek / karta / CTA / inne),
  `content` (the element blocks), `slug`, `description`.
- `content` is edited with `ComponentBuilder`, the same canvas the page builder
  uses, minus sections — a composition *is* the contents of one.
- Pages **reference** a composition through the `savedComponent` element, so
  editing it here updates every page that uses it.
- Shared parameter helpers (colour choice, radius, gap, alignment, aspect ratio,
  link, button rows) live in `src/fields/elements/shared.ts`. Colour parameters
  default to a palette token but allow a custom HEX or "none".

Full write-up of the element model, the builder and the public renderer:
[`page-builder.md`](./page-builder.md).

## Key paths

| Piece | Path |
|---|---|
| Token definitions | `src/lib/theme-tokens.ts` |
| Palette presets | `src/lib/theme-presets.ts` |
| Theme → CSS | `src/lib/theme-css.ts`, `src/lib/get-theme-colors.ts` |
| Colour global | `src/globals/ThemeColors.ts` |
| Colour picker / presets / preview UI fields | `src/components/admin/appearance/` |
| Element library (blocks) | `src/fields/elements/` |
| Components collection | `src/collections/SiteComponents.ts` |
| Element renderers (site + canvas) | `src/components/elements/` |
| Shared style value maps | `src/lib/component-styles.ts`, `src/lib/element-styles.ts` |
| Sample data | `src/seed/appearance-samples.ts` (`pnpm seed:appearance`) |
| Styles | `src/app/(payload)/appearance.css` (imported from `custom.css`) |

## Notes

- Colour scheme changes only affect the public site after the global is
  saved (the admin preview is live, the site is server-rendered per request).
- The builder canvas resolves media and compositions over the REST API
  client-side: fine for the admin panel, not meant for the public renderer,
  which gets them from Payload's `depth` instead.
- **Pages are built from the element library**, see
  [`page-builder.md`](./page-builder.md). `pages.layout` holds one row per
  *section*, each with its own tree of elements; a saved composition is placed
  through the `savedComponent` element. Adding an element type means adding a
  block in `src/fields/elements/`, a case in `ElementTree`, a renderer in
  `src/components/elements/` and a row in `src/lib/element-catalog.ts` — miss the
  last one and it never appears in the library panel.
- The pure parameter readers live in `src/lib/component-values.ts` and
  `src/lib/element-styles.ts`, read by the canvas and the public site alike:
  there is no second set of preview components any more.
- After adding a component type or admin field component, run
  `pnpm generate:importmap`; after field/schema changes, `pnpm generate:types`.
