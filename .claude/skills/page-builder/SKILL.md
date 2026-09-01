---
name: page-builder
description: The constraints that make the page builder's canvas and the public site render identically. Use whenever you add or change an element under src/lib/builder/elements/registry.ts, src/components/builder/render/, src/components/builder/editor/, or src/components/builder/inspector/, or when a builder element renders differently in the editor canvas than on the site.
---

Read `docs/map/page-builder.md` for the model. This skill is the short list of things that look
like bugs but are deliberate constraints, on the rewrite (`refactor/page-builder-v2`).

**One renderer draws the canvas and the site**, `src/components/builder/render/BuilderRender.tsx`.
Consequences:

- **`doc` is always an explicit prop, never read from a store.** The site has no store, only a
  server-fetched `BuilderDoc`; the canvas passes `store.doc`, re-rendered on every edit. A
  component that reaches into `useBuilderStore` for node data instead of its `doc` prop breaks
  on the site.
- **Media and saved-component references are resolved *before* rendering, not during.** A `json`
  field is opaque to Payload's `depth`: an id sitting in `props.mediaId` is never auto-populated,
  however deep `depth` is set, unlike the old builder's `upload` fields. `src/lib/builder/resolve.ts`
  (site) and `use-resolved-media.ts` (canvas) do this walk explicitly.
- **No iframe.** The canvas renders in the same document as the editor chrome; the desktop/
  tablet/mobile switch narrows a wrapper `div`, it does not emulate a real viewport. A `container`
  query pass would be needed before the canvas can be trusted for verifying where a layout
  actually breaks; use `/podglad/{type}/{slug}` at a real narrow width until then.

Also:

- **A node's `tw` classes are assembled at render time** (`md:${cls}`, `class-names.ts`), which
  Tailwind's static scanner cannot see. Any class the builder can produce has to be enumerable in
  `src/lib/builder/tw-safelist.ts`, or it silently does nothing on the page. Add a value to
  `tw-tokens.ts` or an element's `defaultTw`? Run `pnpm generate:tw-safelist` and check
  `tests/builder-tw-safelist.test.ts` still passes.
- **`container` replaces the old `columns`/`column` pair**, and nests without limit (bounded only
  by `MAX_TREE_DEPTH`), because it is a plain node with `children`, not a Payload block. Payload
  blocks could not reference themselves, which is why the previous builder capped nesting at one
  level; that constraint is gone.
- **Inline `html` props are sanitised server-side on save** (`sanitize-html.ts`), not only in the
  editor. Rendering trusts the stored value via `dangerouslySetInnerHTML` precisely because saving
  is the only place untrusted markup could get in.
- **`/edytor` and `/podglad` are staff-only and off public hosts entirely** (`src/proxy.ts`,
  same treatment as `/admin`), resolved through `src/lib/builder/document.ts`.

Schema changed (a field on `pages`/`posts`/`site-components`)? Follow the `payload-schema` skill.
Verify with `pnpm smoke:builder`.
