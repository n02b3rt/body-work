> Read when: adding or changing a builder element or section, or when the admin canvas renders differently from the site.

# Page builder

`pages.layout` is an ordered list of **sections** (width, spacing, background, anchor), each holding
a tree of **elements**. One set of React components renders both the admin canvas and the public site.

## Schema

- `src/fields/page-layout.ts`: the section definitions
- `src/fields/elements/`: the 16-element library, split by kind
  - `basic.ts` (heading, text, image, buttons, icon list, divider, spacer)
  - `layout.ts` (columns, column)
  - `media.ts` (gallery, carousel, video)
  - `sections.ts` (hero, cta, features, accordion)
  - `shared.ts` (the saved-composition element)
  - `style.ts` (the `style` group every element carries: padding, margin, background, text colour, radius, border, shadow, width, alignment, per-breakpoint visibility, anchor id, CSS class)

## Editor UI

`src/components/admin/builder/`: `PageBuilder.tsx` (the Field component), `ElementLibrary.tsx`,
`CanvasList.tsx`, `InspectorPanel.tsx`, `ComponentBuilder.tsx` (saved compositions),
`ViewportSwitch.tsx`, `CanvasOnlyField.tsx`, `model.ts`, `use-canvas-data.ts`, `use-site-components.ts`.

The inspector is Payload's own `RenderFields`, so rich text, uploads, conditions and validation come free.

## Renderers, shared between canvas and site

`src/components/elements/`: `ElementTree.tsx`, `BasicElements.tsx`, `MediaElements.tsx`,
`SectionElements.tsx`, `AccordionView.tsx`, `CarouselView.tsx`, `GalleryView.tsx`, `Picture.tsx`,
`ElementButton.tsx`, `ElementLink.tsx`, `Icon.tsx`, `grid.ts`, `types.ts`.

Public entry point: `src/components/page-blocks/PageSections.tsx`.

## Parameter readers and styling

`src/lib/component-values.ts`, `component-styles.ts`, `element-styles.ts`, `page-sections.ts`,
`element-catalog.ts` (client-safe names and categories), `element-icons.ts`, `cms-page.ts` (page lookup).

CSS: `src/styles/elements.css`, imported by `[locale]/[...rest]/page.tsx` **and**
`(payload)/custom.css`. Not by `globals.css`: it was on all 33 coded pages, and `[...rest]` is
the only public route that renders an element.
Builder chrome: `src/app/(payload)/builder.css`.

## Route, seed, verification

- Public route: `src/app/[locale]/[...rest]/page.tsx`
- Sample compositions: `src/seed/appearance-samples.ts` (`pnpm seed:appearance`)
- End-to-end check: `scripts/smoke-page-builder.ts` (`pnpm smoke:builder`)

## Gotchas

- **Reads need `depth: 3`.** Below that, saved compositions resolve to bare ids.
- **CMS pages are Polish-only** and 404 in EN.
- **Container queries, not media queries.** The canvas fakes a phone by shrinking, so a media query
  would keep answering for the desktop viewport.
- **Nesting is fixed at one level** (`section → elements → columns → column → elements`). Payload
  blocks cannot reference themselves, and a bounded depth keeps generated types and tables finite.
- **A block's `dbName` must be a function.** A bare string replaces the whole table name and collapses
  every block of that type into one table. Postgres caps identifiers at 63 characters.
- **Nothing in an element is `required`**, so an editor can drop a gallery in and pick photos later.
- **Compositions are referenced, not copied**, with a depth guard: nothing stops an editor putting a
  composition inside itself.

## Related

Skill `page-builder` · [`../page-builder.md`](../page-builder.md) (the full model and decisions) ·
[`appearance.md`](./appearance.md) (saved compositions)
