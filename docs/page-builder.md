# Page builder (Kreator stron)

Building a page out of the components defined in **Zarządzanie → Wygląd →
Komponenty**, in **Treści → Strony → Nowa strona**. This is the piece
`docs/appearance.md` used to list as a follow-up: components were data only,
with nothing that put them on a page.

## The model: a placement, not a copy

`pages.layout` is an array of **sections**. A section is a *placement* of a
component plus the settings that belong to this page rather than to the
component:

| Field | Meaning |
|---|---|
| `component` | Relationship to `site-components`. Required. |
| `width` | `full` / `container` (1440px) / `narrow` (960px) |
| `spacing` | Vertical padding: `none` / `sm` / `md` / `lg` |
| `background` | A `colorChoice`: palette token, custom HEX, or none |
| `anchor` | Optional `id`, so `/strona#cennik` scrolls here |
| `hidden` | Keeps the section on the page without publishing it |

The split is the point. One "CTA: bezpłatna konsultacja" component can sit on a
dark full-bleed band on one page and inside a narrow column on another, and
editing its copy in the library updates both. Duplicating the component to
change its background would have thrown that away.

Definitions live in `src/fields/page-layout.ts`; the value maps that turn
`width`/`spacing` into CSS are in `src/lib/page-sections.ts`.

## The builder UI

`src/components/admin/builder/` replaces Payload's stock array UI for that one
field via `admin.components.Field`. Three panes:

- **Biblioteka** (`ComponentLibrary.tsx`): every `site-components` document,
  grouped by type, searchable. Clicking one inserts it *after* the selected
  section, or at the end.
- **Kanwa** (`PageBuilder.tsx` + `CanvasSection.tsx`): each section rendered
  live inside its own frame, with move / duplicate / hide / delete controls and
  drag-to-reorder.
- **Ustawienia sekcji** (`SectionInspector.tsx`): the selected section's fields.

Two decisions worth keeping:

- **Every mutation goes through the form's own row actions** (`addFieldRow`,
  `moveFieldRow`, `removeFieldRow`, `DUPLICATE_ROW`, and `useField` per control),
  which is exactly what Payload's own `ArrayField` does. No parallel store, so
  validation, drafts, versions and the "unsaved changes" prompt all behave
  normally, and removing the custom component leaves the data editable in the
  stock array UI.
- **Selection is keyed by row id, never by index.** Moving or deleting a section
  shifts every index after it; an index-keyed selection would silently re-point
  the inspector at a different section.

The canvas reuses the **same preview renderers as the component editor**
(`src/components/admin/appearance/previews/`), so a block looks the same
wherever it is previewed.

## Rendering on the site

`src/components/page-blocks/` renders the published page:
`PageSections.tsx` draws the section frames (the same width/spacing/background
the canvas draws) and dispatches on component type. Blocks are Server
Components except the two that need interaction: `GalleryGrid` (lightbox) and
`CarouselTrack` (embla, wired like the hand-built carousels).

The route is the existing catch-all, `src/app/[locale]/[...rest]/page.tsx`. It
keeps its original job of handing unmatched URLs to `not-found.tsx`, and now
looks for a published page first. **Catch-all segments have the lowest routing
priority**, so a CMS page can never shadow a hand-built route: `/cennik` stays
the coded page even if somebody creates a page with that slug.

Reads go through `src/lib/cms-page.ts`, always at `depth: 2`: depth 1 resolves
the component on a section, depth 2 the media and linked buttons inside it. At
depth 1 every photograph renders as a bare id.

## Decisions

- **Polish only, and English 404s.** Page fields are not localised, so a CMS page
  has no English text. `docs/i18n.md`'s fallback rule already covers this: no
  translation means the page is absent from EN rather than served as Polish prose
  under an English URL. Metadata is emitted with `singleLanguage: true`, so the
  canonical points at the Polish URL and no `hreflang` pair is claimed.
- **`_status` is filtered explicitly.** With drafts enabled the collection's own
  table holds the draft too, so a query without `_status: { not_equals: 'draft' }`
  publishes unfinished pages.
- **`revalidate = 3600` and `generateStaticParams`.** Published pages prerender;
  a page created later renders on demand and then caches. Same trade as the blog:
  an edit takes up to an hour to appear.
- **Column counts are static classes** (`src/components/page-blocks/grid-columns.ts`).
  Tailwind only emits what it can see, so `grid-cols-${n}` produces nothing, and
  the variant is `lg:` not `wide:`, because `wide:` orders before `sm:` and loses
  to it (see `docs/architecture.md`).
- **The pure value readers moved to `src/lib/component-values.ts`.** The admin
  previews and the public blocks now read one source, which is what keeps
  "medium radius" identical in both. `previews/helpers.ts` re-exports them and
  overrides only `sectionHeight`, because the admin panel is not full-bleed and
  caps "screen".

## Gotchas

- **`setState` in an effect body is a build error here**, not a warning: the
  React Compiler's `set-state-in-effect` rule. `useSiteComponents` derives
  `loading` by comparing a request counter instead, and `CarouselTrack`
  subscribes to embla's `select`/`reInit` events rather than reading the snap
  synchronously. This project has been caught by that rule five times now.
- **`embla-carousel` is only a transitive dependency.** Importing types from it
  directly fails to resolve under pnpm's strict `node_modules`; take them from
  `embla-carousel-react`'s own `UseEmblaCarouselType`.
- **New client-facing copy needs `src/i18n/client-namespaces.ts`.** The gallery
  lightbox added a `Gallery` namespace; without registering it, next-intl renders
  the key path rather than the text, silently. `pnpm check:messages` catches it.
- After changing the section fields: `pnpm generate:types`. After adding an admin
  component: `pnpm generate:importmap`.

## Key paths

| Piece | Path |
|---|---|
| Section field definitions | `src/fields/page-layout.ts` |
| Width / spacing / anchor maps | `src/lib/page-sections.ts` |
| Builder UI | `src/components/admin/builder/` |
| Builder styles | `src/app/(payload)/builder.css` |
| Public renderer | `src/components/page-blocks/` |
| Page lookup | `src/lib/cms-page.ts` |
| Route | `src/app/[locale]/[...rest]/page.tsx` |
| Shared parameter readers | `src/lib/component-values.ts` |
| Smoke test | `scripts/smoke-page-builder.ts` (`pnpm smoke:builder`) |
