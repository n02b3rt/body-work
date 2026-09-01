> Read when: adding or changing a builder element, the editor shell, or wondering why the canvas and the site render the same thing.

# Page builder (Kreator stron)

Rewrite in progress on `refactor/page-builder-v2`, replacing the Payload-blocks builder
described in git history. A full-screen editor at `dash.localhost/edytor/{strony|wpisy|komponenty}/{slug}`,
in the style of Elementor: drag elements from a library onto a canvas, edit their content and
Tailwind-token styles in an inspector, arrange them in a navigation tree.

## The model

`pages.builder` / `posts.builder` / `site-components.builder` are one `json` field each: a flat,
normalised tree (`src/lib/builder/types.ts`, `BuilderDoc`/`BuilderNode`). Unlike the old blocks
model, a `container` node can hold another `container`: nesting is bounded only by
`MAX_TREE_DEPTH` (`registry.ts`), not by the schema. `pages.componentRefs` /
`posts.componentRefs` (a `text`, hasMany field) record which saved components a document
references, written by hand today, not yet by a hook (see Not built yet).

`src/lib/builder/elements/registry.ts` is the element library: 18 types, their default
`props`/`tw`, inspector controls, and `canContain` nesting rules. `src/lib/builder/tw-tokens.ts`
is the finite Tailwind scale an inspector control can pick from: spacing, colour (from
`THEME_TOKEN_GROUPS`), radius, shadow, border, flex/grid, text size.

## One renderer, two places

`src/components/builder/render/BuilderRender.tsx` draws **both** the editor canvas and the
public page, dispatching to one component per element type under `render/elements/`. `doc` is
always an explicit prop (never read from the store), so the exact same tree renders from a
Server Component on the site and from client state on the canvas. `ctx: RenderCtx`
(`render/ctx.ts`) carries `mode` (`'canvas' | 'site'`), and `media`/`components` **resolved
into the context already**: `json` fields are opaque to Payload's `depth`, so a `mediaId`
sitting in `props` is never auto-populated the way an `upload` field was in the old builder.
`src/lib/builder/resolve.ts` does this server-side (site, one Local API pass); the canvas does
the equivalent over REST in `src/components/builder/editor/use-resolved-media.ts`.

Tailwind classes on a node (`node.tw.base/md/lg`) are assembled into `md:`/`lg:`-prefixed class
names **at render time** (`render/class-names.ts`), which defeats Tailwind's static scanner.
`src/lib/builder/tw-safelist.ts` enumerates every class the builder can produce;
`scripts/generate-tw-safelist.ts` writes `src/styles/builder-safelist.css`
(`pnpm generate:tw-safelist`, regenerate after touching `tw-tokens.ts` or an element's
`defaultTw`). `tests/builder-tw-safelist.test.ts` fails if the two drift apart.

`node.css` (per breakpoint, like `tw`) is the escape hatch for values outside that scale, set
from the Styl tab's nested box-model editor (`inspector/BoxModelEditor.tsx`). It renders as a
generated `.bw-css-{id}` rule with a real `@media` query per breakpoint
(`class-names.ts`'s `styleRuleFromCss`), not an inline `style`, so it can vary by viewport the
same way a `tw` class does.

Inline rich-text `html` props are sanitised server-side on every save
(`src/lib/builder/sanitize-html.ts`, a small hand-written allowlist: `jsdom` is a
devDependency only, see `docs/stack.md`), not only client-side, so a direct API write cannot
smuggle a script tag into `dangerouslySetInnerHTML`.

## The editor

`src/components/builder/editor/`: `store.ts` (Zustand, tree CRUD, selection, viewport, 50-step
undo/redo), `BuilderShell.tsx` (the `DndContext`, three-pane layout, keyboard shortcuts),
`LibraryPanel.tsx`, `Tree.tsx`, `Toolbar.tsx`, `ViewportSwitch.tsx`, `save.ts` (REST `PATCH`
through Payload's own API, `?draft=true` for "Zapisz szkic"). `src/components/builder/inspector/`
is the Zawartość/Układ/Styl panel; `src/components/builder/media/MediaPicker.tsx` is the media
library modal.

**No iframe.** The canvas renders in the same document as the editor chrome, not the isolated,
viewport-shrunk frame an earlier plan called for: real `md:`/`lg:` classes, so the desktop/
tablet/mobile switch narrows the canvas wrapper but does not itself trigger a breakpoint-gated
layout change the way a real device width would. Verify a responsive layout at `/podglad/{type}/{slug}`
in an actual narrow browser window until this gets a container-query pass.

Route gating: `src/proxy.ts` keeps `/edytor` and `/podglad` off public hosts (plain 404, same
as `/admin`); `src/lib/builder/document.ts` resolves the URL's `{type}` segment to a collection
and checks `isStaff`.

## Not built yet

- **Component library save/insert** (copy vs. reference mode) and the "used on N pages" panel.
- **Accessibility audit** (contrast, heading order, alt text, publish-blocking).
- **Translation overlay** (side-by-side PL/EN editor), `docs/page-builder.md`'s own Phase 3.
- **Carousel** renders as a gallery grid for now (`BuilderRender.tsx`'s `RENDERERS` map); no
  dedicated Embla-powered carousel yet.
- `componentRefs` is not yet written by a hook, and nothing yet calls `revalidatePath` after a
  save: a publish is live in the database immediately but the cached page is not force-rebuilt.

## Verification

`pnpm smoke:builder` (`scripts/smoke-builder.ts`): creates a page through every current
element type via the Local API, confirms the tree round-trips through `builder`, and checks
the public route renders every node type. `pnpm generate:tw-safelist` after a token/element-default
change.

`pnpm convert:richtext` (`scripts/convert-richtext-to-builder.ts`, `src/lib/builder/convert/lexical-to-builder.ts`):
one-off migration for a database that still carries the old `content` (Lexical) columns
alongside the new `builder` column; nothing in this repo's own database needs it right now,
see the script's own comment.

## Related

[`cms-payload.md`](./cms-payload.md) · [`media.md`](./media.md) · [`admin-panel.md`](./admin-panel.md)
