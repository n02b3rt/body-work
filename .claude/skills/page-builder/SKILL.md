---
name: page-builder
description: The constraints that make the page builder's canvas and the public site render identically. Use whenever you add or change an element or section under src/fields/elements/, src/components/elements/, src/components/admin/builder/, or src/components/page-blocks/, or when a builder element renders differently in the admin canvas than on the site.
---

Read `docs/page-builder.md` for the model. This skill is the short list of things that look like
bugs but are deliberate constraints.

**One set of renderers draws the canvas and the site** (`src/components/elements/`). Three
consequences follow, and they explain most of the odd-looking choices:

- **No functions in the element context.** The site renders these from a Server Component, so
  `ElementCtx` is `{ mode, labels, depth }`; media and compositions are resolved *into the data*
  first (Payload `depth` on the site, a REST fetch in the panel).
- **No Tailwind and no next-intl in the admin.** Layout lives in `src/styles/elements.css`, imported
  by `globals.css` *and* `(payload)/custom.css`; a11y strings travel in `ctx.labels`.
- **Container queries, not media queries.** The canvas fakes a phone by shrinking, so a media query
  would keep answering for the desktop viewport.

Also:

- **Reads need `depth: 3`.** Less than that and saved compositions resolve to bare ids.
- **Nesting is fixed at one level** (`section → elements → columns → column → elements`). Payload
  blocks cannot reference themselves and a bounded depth keeps the generated types finite.
- **Nothing in an element is `required`.** An editor drops a gallery in and picks photos afterwards.
- **CMS pages are Polish-only** and 404 in EN.

Schema changed? Follow the `payload-schema` skill. Verify with `pnpm smoke:builder`.
