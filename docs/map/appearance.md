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
`savedComponent` element.

- Collection: `src/collections/SiteComponents.ts`
- Builder: `src/components/admin/builder/ComponentBuilder.tsx`
- Samples: `src/seed/appearance-samples.ts` (`pnpm seed:appearance`)

Compositions are **referenced, not copied**, with a depth guard, because nothing stops an editor
putting a composition inside itself.

## Gotchas

- **Brand green on buttons is `#28794f`, not the reference's `#2c8657`.** The original measured 4.21
  contrast against cream button text where WCAG AA requires 4.5. Logged as a deliberate deviation.
- **No auto dark mode.** The scaffold's `prefers-color-scheme: dark` was dropped: the brand is a
  defined navy-on-white system and auto-inverting fought the palette.

## Related

[`page-builder.md`](./page-builder.md) · [`../appearance.md`](../appearance.md) · [`../decisions.md`](../decisions.md)
