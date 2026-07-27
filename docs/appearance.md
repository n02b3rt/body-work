# Appearance (Wygląd)

Admin section for the site's visual theme: a global colour scheme applied to
the whole site, and a library of parameterized page components (like
Elementor blocks) editors can configure and reuse.

## Colour scheme (`theme-colors` global)

- Tokens are defined once in `src/lib/theme-tokens.ts` (groups: brand, text,
  surface, state). Each token has a form path (`brand.primary`), a CSS
  variable (`--bw-primary`) and a default hex value.
- The global `src/globals/ThemeColors.ts` builds its tabs/fields
  programmatically from that token list — adding a token there is enough to
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

- One collection, one `type` select (`button`, `hero`, `carousel`, `gallery`,
  `cta`, `features` — registry in `src/fields/component-settings/index.ts`).
  Each type owns a settings group shown only when that type is selected
  (`admin.condition`), so data stays namespaced (`doc.hero.heading`, …).
- Shared parameter helpers (colour choice, radius, gap, alignment, aspect
  ratio, link) live in `src/fields/component-settings/shared.ts`. Colour
  parameters default to a palette token but allow a custom HEX or "none".
- `ComponentPreview` (`src/components/admin/appearance/ComponentPreview.tsx`)
  renders the block live from form state, using the **saved** theme palette
  (fetched once via `/api/globals/theme-colors`). Per-type render logic lives
  in `src/components/admin/appearance/previews/`.
- Hero and CTA components can reference an existing `button` component via a
  `relationship` field, instead of duplicating button settings.

## Key paths

| Piece | Path |
|---|---|
| Token definitions | `src/lib/theme-tokens.ts` |
| Palette presets | `src/lib/theme-presets.ts` |
| Theme → CSS | `src/lib/theme-css.ts`, `src/lib/get-theme-colors.ts` |
| Colour global | `src/globals/ThemeColors.ts` |
| Colour picker / presets / preview UI fields | `src/components/admin/appearance/` |
| Component parameter groups | `src/fields/component-settings/` |
| Components collection | `src/collections/SiteComponents.ts` |
| Component preview renderers | `src/components/admin/appearance/previews/` |
| Shared style value maps | `src/lib/component-styles.ts` |
| Sample data | `src/seed/appearance-samples.ts` (`pnpm seed:appearance`) |
| Styles | `src/app/(payload)/appearance.css` (imported from `custom.css`) |

## Notes

- Colour scheme changes only affect the public site after the global is
  saved (the admin preview is live, the site is server-rendered per request).
- `ComponentPreview` and the hero/CTA button lookups fetch over the REST API
  client-side — fine for the admin panel, not meant for the public renderer.
- No frontend block renderer yet: `site-components` documents are data only;
  a page builder / block field that inserts them into `Pages` content is a
  follow-up.
- After adding a component type or admin field component, run
  `pnpm generate:importmap`; after field/schema changes, `pnpm generate:types`.
