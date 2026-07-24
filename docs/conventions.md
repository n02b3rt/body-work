# Conventions — BodyWork Centrum

> Decide once, follow always. Consistency beats personal preference. Written in English.

## Naming

- Files / folders: kebab-case (e.g. `contact-form.tsx`), except Next.js reserved files (`page.tsx`, `layout.tsx`, `route.ts`)
- Variables / functions: camelCase
- Types / interfaces / components: PascalCase
- Constants: UPPER_SNAKE for true constants; camelCase for config objects

## Folder structure

Feature-first inside `src/app/`: each route segment owns its `page.tsx`, and route-local components live alongside it. Shared, cross-route components/utilities go in `src/components/` and `src/lib/` (create these as soon as the first shared piece appears — don't pre-create empty folders).

## Patterns

- Server Components by default; add `"use client"` only where interactivity requires it.
- Static content (page copy) can start as local constants/props; move to a CMS or data layer only when there's a real need to edit content without a deploy.
- One way to do one thing — if a second pattern for the same problem appears, consolidate.

## Code style

- Linter / formatter: ESLint (`eslint.config.mjs`, `next lint` via `npm run lint`) + Tailwind class conventions. Run before committing.
- Comments: only when they explain "why", not "what". No references to AI/tools.

## Tests

- What we test: _(fill in once testing is set up — likely critical page rendering and any interactive forms)_
- Where they live / how we name them / how to run them: _(fill in)_
