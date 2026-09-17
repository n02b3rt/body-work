> Read when: adding or changing a builder element or section, or wondering why the canvas and the site render the same thing.

# Page builder (Kreator stron)

Building a page out of an **element library**: a set of parameterised widgets
(heading, text, image, buttons, columns, gallery, hero, CTA…) that an editor
configures where they place them, the way Elementor does it.

This replaced the first design, where every "component" was a document in
**Wygląd → Komponenty** with a type and one settings group, and a page was a list
of *placements* of those documents. The two jobs turned out to be different:
configuring a widget belongs to the page, and the thing worth saving under a name
is a **composition**, "photo left, heading + copy + button right", not a single
widget. So the library moved into config, and the collection now holds
compositions. See [`appearance.md`](./appearance.md).

## The model

```
pages.layout[]                       ← section: the band across the page
  ├ name, width, spacing, background, anchor, hidden
  └ content[]                        ← blocks: the element library
      └ columns                      ← the one container element
          └ columns[]                ← a column: weight + its own frame
              └ content[]            ← blocks: the library minus `columns`
```

| Level | Field | Meaning |
|---|---|---|
| Section | `width` | `full` / `container` (1440px) / `narrow` (960px) |
| Section | `spacing` | Vertical padding: `none` / `sm` / `md` / `lg` |
| Section | `background` | A `colorChoice`: palette token, custom HEX, or none |
| Section | `anchor` | Optional `id`, so `/strona#cennik` scrolls here |
| Section | `hidden` | Keeps the section on the page without publishing it |
| Element | `style` | Padding, margin, background, text colour, radius, border, shadow, width, alignment, per-breakpoint visibility, anchor id, CSS class |

**Nesting is one level deep on purpose.** Payload blocks cannot reference
themselves, and a fixed depth keeps both the generated types and the Postgres
tables finite. `section → elements → columns → column → elements` covers the
layouts this exists for.

Definitions live in `src/fields/elements/`; the `style` group is one factory
(`style.ts`) appended to every element, and `src/lib/element-styles.ts` is its
only reader.

## Saved compositions

An element called **`savedComponent`** holds a relationship to a
`site-components` document and renders that document's `content` inline.
Referenced, not copied: editing the composition updates every page using it.
A depth guard (`MAX_COMPOSITION_DEPTH`) stops a composition that ends up inside
itself from recursing forever.

## One renderer, two places

`src/components/elements/` renders **both** the builder canvas and the published
page. That is the constraint everything else bends around:

- **No functions in the context.** The public site renders these from a Server
  Component, and props crossing into the interactive elements (gallery, carousel,
  accordion) must be serializable. So `ElementCtx` is `{ mode, labels, depth }`
  and nothing else; media and compositions are resolved **into the data** before
  rendering: by Payload's `depth` on the site, by a REST fetch in the builder
  (`use-canvas-data.ts`).
- **No Tailwind, no next-intl.** The admin panel loads neither. Layout comes from
  `src/styles/elements.css`, imported by `[locale]/[...rest]/page.tsx` *and* by
  `(payload)/custom.css`; the strings the interactive elements need travel in
  `ctx.labels`, looked up by `PageSections` with `getTranslations`. It is **not** in
  `globals.css`: that put 10.6 KB of element styles on all 33 coded pages, none of which
  renders an element.
- **Container queries, not media queries.** The canvas emulates a phone by
  shrinking to 390px; a media query would keep reporting the desktop viewport.
  `.bw-el-root` is the query container, so "ukryj na telefonie" and column
  stacking behave in the preview exactly as they will on a phone.

## The builder UI

`src/components/admin/builder/` replaces the stock UI for two fields:
`pages.layout` (`PageBuilder`) and `site-components.content` (`ComponentBuilder`).
Both are the same three panes:

- **Biblioteka** (`ElementLibrary.tsx`): elements grouped by category, plus the
  editor's saved compositions. Clicking inserts at the current target, which is
  spelled out at the top of the panel: dragging from a scrolling rail into a
  nested canvas is where builders of this kind usually break down.
- **Kanwa** (`CanvasList.tsx`): the real components, wrapped in a selectable
  shell with move / duplicate / delete, drag-to-reorder, and a viewport switch.
  `columns` is handled by the canvas rather than by `ElementBody`, because each
  column has to become its own drop target.
- **Ustawienia** (`InspectorPanel.tsx`): Payload's own `RenderFields`, given the
  selected block's client fields. That is where rich text, upload pickers,
  relationship selectors, conditions and validation come from: none of it is
  hand-written.

Three decisions worth keeping:

- **Every mutation goes through the form's own row actions** (`addFieldRow`,
  `moveFieldRow`, `removeFieldRow`, `DUPLICATE_ROW`), which is exactly what
  Payload's `ArrayField` and `BlocksField` do. No parallel store, so validation,
  drafts, versions and the "unsaved changes" prompt all behave normally, and
  removing the custom components leaves the data editable in the stock UI.
- **Selection is an id, never an index.** Moving or deleting a row shifts every
  index after it. `locateInSections` re-derives the path from the values on each
  render instead of caching one.
- **`RenderFields` needs `parentSchemaPath`, and Payload composes a block row's
  as `${blocksFieldSchemaPath}.${blockSlug}`.** `model.ts` derives both path
  spaces from the fixed nesting rather than walking the client schema.

## Rendering on the site

`src/components/page-blocks/PageSections.tsx` draws the section frames (the same
width/spacing/background the canvas draws) and hands each section's `content` to
`ElementTree`.

The route is the existing catch-all, `src/app/[locale]/[...rest]/page.tsx`. It
keeps its original job of handing unmatched URLs to `not-found.tsx`, and looks
for a published page first. **Catch-all segments have the lowest routing
priority**, so a CMS page can never shadow a hand-built route: `/cennik` stays
the coded page even if somebody creates a page with that slug.

Reads go through `src/lib/cms-page.ts` at **`depth: 3`**: population counts
relationship hops, not field nesting: an upload inside a section's elements is
one hop, a `savedComponent` is one and its own pictures are two.

## Decisions

- **Polish only, and English 404s.** Page fields are not localised, so a CMS page
  has no English text. `docs/i18n.md`'s fallback rule already covers this: no
  translation means the page is absent from EN rather than served as Polish prose
  under an English URL. Metadata is emitted with `singleLanguage: true`.
- **`_status` is filtered explicitly.** With drafts enabled the collection's own
  table holds the draft too, so a query without `_status: { not_equals: 'draft' }`
  publishes unfinished pages.
- **`revalidate = 3600` and `generateStaticParams`.** Published pages prerender;
  a page created later renders on demand and then caches. Same trade as the blog:
  an edit takes up to an hour to appear.
- **Nothing in an element is `required`.** An editor drops a gallery in, then
  picks the photographs. Requiring the field would block saving the whole page in
  between; the renderers show a placeholder on the canvas and nothing on the site.
- **Buttons are not a document type any more.** A button that has to be identical
  in ten places is a saved composition like any other repeated layout.

## Gotchas

- **Postgres caps identifiers at 63 characters**, and the deepest path here is
  `components → blocks → columns → column → blocks → element → style → colour →
  token`. Two things keep it under: `site-components` has `dbName: 'components'`,
  and every element block and repeated array carries a **function** `dbName`
  returning `` `${tableName}_b_hero` ``. It has to be a function: a bare
  string **replaces the whole table name**, which would collapse every occurrence
  of a block into one table. Group fields have no `dbName` at all (they do not
  create tables), so shortening has to happen at the block/array level.
- **The lightbox is portalled to `document.body`.** `container-type` on
  `.bw-el-root` makes it a containing block for `position: fixed` children, so an
  overlay rendered in place is trapped inside the section.
- **`setState` in an effect body is a build error here**, not a warning: the
  React Compiler's `set-state-in-effect` rule. `useDocs` compares a request
  counter, and `CarouselView` subscribes to embla's `select`/`reInit` events
  rather than reading the snap synchronously. This project has been caught by that
  rule seven times now.
- **`embla-carousel` is only a transitive dependency.** Importing types from it
  directly fails to resolve under pnpm's strict `node_modules`; take them from
  `embla-carousel-react`'s own `UseEmblaCarouselType`.
- **`payload run` scripts need top-level `await`, not an async `main()`.** Wrapped
  in a function, the module finishes evaluating while the promise is still
  pending, Node finds no open handle, and the process exits with **code 0 having
  printed only the first line**: which reads exactly like a script that ran and
  did nothing.
- **Unpublishing is `data: { _status: 'draft' }` without `draft: true`.** With the
  flag Payload writes a new draft *version* and leaves the published row in the
  collection's own table, so the page stays live.
- After changing the element fields: `pnpm generate:types`. After adding an admin
  component: `pnpm generate:importmap`.

## Key paths

All of them, plus the surrounding domains: [`map.md`](./map.md#page-builder).
