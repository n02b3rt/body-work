> Read when: touching the colour scheme, theme tokens, or the editor's saved compositions.

# Appearance

One global palette drives the `--bw-*` CSS variables on the public site, with presets and a live
preview in the panel. Separately, editors can save their own arrangements of elements and drop them
onto any page.

## Colour scheme

| Role | Path |
|---|---|
| Global | `src/globals/ThemeColors.ts` |
| Token definitions (single source) | `src/lib/theme-tokens.ts` |
| CSS variable emission | `src/lib/theme-css.ts` |
| Presets | `src/lib/theme-presets.ts` |
| Read helper | `src/lib/get-theme-colors.ts` |
| Panel UI | `src/components/admin/appearance/` (`ColorField`, `ThemePresets`, `ThemePreview`, `CardRowLabel`, `SlideRowLabel`, `use-preview-data.ts`, `use-theme-colors.ts`) |

Tokens are defined **once** in `theme-tokens.ts` and drive both the `theme-colors` global and the
public-site CSS vars. Do not define a colour in two places.

## Saved compositions

Editors' own arrangements ("photo plus text"), saved under a name and placed on pages through the
`savedComponent` element. Part of the page builder rewrite, see
[`page-builder.md`](./page-builder.md): edited at `dash.localhost/edytor/komponenty/{slug}`, same
as a page. The library UI to save a canvas selection as a new composition and insert one (copy or
reference) is not built yet.

- Collection: `src/collections/SiteComponents.ts` (`builder` json field, `preview` thumbnail)
- Reference resolution, with a depth guard against a composition placed inside itself:
  `src/lib/builder/resolve.ts` (site), `src/components/builder/editor/use-resolved-media.ts` (canvas)

## Gotchas

- **Brand green on buttons is `#28794f`, not the reference's `#2c8657`.** The original measured 4.21
  contrast against cream button text where WCAG AA requires 4.5. Logged as a deliberate deviation.
- **No auto dark mode.** The scaffold's `prefers-color-scheme: dark` was dropped: the brand is a
  defined navy-on-white system and auto-inverting fought the palette.

## Related

[`page-builder.md`](./page-builder.md) · [`../appearance.md`](../appearance.md) · [`../decisions.md`](../decisions.md)
