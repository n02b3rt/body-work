# Conventions — BodyWork Centrum

> Decide once, follow always. Consistency beats personal preference. Written in English.

## Naming

- Files / folders: kebab-case (e.g. `contact-form.tsx`), except Next.js reserved files (`page.tsx`, `layout.tsx`, `route.ts`)
- Variables / functions: camelCase
- Types / interfaces / components: PascalCase
- Constants: UPPER_SNAKE for true constants; camelCase for config objects

## Folder structure

- **Route groups:** public site in `src/app/(frontend)/`, Payload admin/API in `src/app/(payload)/`. Do not add a root `src/app/layout.tsx` that wraps both — each group owns its own `<html>`/`<body>`.
- Feature-first inside `(frontend)/`: each route segment owns its `page.tsx`, and route-local components live alongside it. Shared, cross-route components/utilities go in `src/components/` and `src/lib/` (create these as soon as the first shared piece appears — don't pre-create empty folders).
- **Payload collections:** one file per collection in `src/collections/`, registered in `src/payload.config.ts`.

## Patterns

- Server Components by default; add `"use client"` only where interactivity requires it.
- CMS content: read via `getPayload()` in Server Components; edit in `/admin`. Prefer collections over hard-coded copy once a content type is editable.
- After changing admin UI components or collections that affect the import map: `pnpm generate:importmap`. After schema/field changes: `pnpm generate:types`.
- One way to do one thing — if a second pattern for the same problem appears, consolidate.

## Code style

- Linter / formatter: ESLint (`eslint.config.mjs`, `pnpm lint`) + Tailwind class conventions. Run before committing.
- Comments: only when they explain "why", not "what". No references to AI/tools.

## Tests

- What we test: _(fill in once testing is set up — likely critical page rendering and any interactive forms)_
- Where they live / how we name them / how to run them: _(fill in)_
