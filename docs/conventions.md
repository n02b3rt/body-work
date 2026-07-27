# Conventions — BodyWork Centrum

> Decide once, follow always. Consistency beats personal preference. Written in English.

## Naming

- Files / folders: kebab-case (e.g. `contact-form.tsx`), except Next.js reserved files (`page.tsx`, `layout.tsx`, `route.ts`)
- Variables / functions: camelCase
- Types / interfaces / components: PascalCase
- Constants: UPPER_SNAKE for true constants; camelCase for config objects

## Folder structure

- **Route groups:** public site in `src/app/(frontend)/`, Payload admin/API in `src/app/(payload)/`. Do not add a root `src/app/layout.tsx` that wraps both — each group owns its own `<html>`/`<body>`.
- **Dashboard host:** staff open the panel only via `DASHBOARD_HOST` (dev: `dash.localhost`). Never link to `/admin` on the public site host.
- Feature-first inside `(frontend)/`: each route segment owns its `page.tsx`, and route-local components live alongside it. Shared, cross-route components/utilities go in `src/components/` and `src/lib/` (create these as soon as the first shared piece appears — don't pre-create empty folders).
- **Payload collections:** one file per collection in `src/collections/`, registered in `src/payload.config.ts`. Access helpers live in `src/access/`.
- **Roles:** `administrator` | `moderator` | `redaktor` | `klient` — use helpers from `src/access/roles.ts`; do not invent parallel permission checks.
- **Public UI strings:** next-intl — add keys to `messages/pl.json` (and `en.json`); do not hardcode user-facing Polish in frontend components when a message key exists.
- **Dates/times (display):** use helpers from `src/lib/format-date.ts` (`formatDatePl`, `formatDateTimePl`) or next-intl `useFormatter().dateTime(value, 'dateTime')` — never ad-hoc `toLocaleString` / ISO strings in UI. Storage stays ISO/UTC.
- **Admin labels:** Polish strings in Payload collection/global configs are fine (editors work in PL).
- **Admin sidebar:** structure lives in `src/admin/nav-tree.ts`; do not rely on Payload `admin.group` for multi-level nav (custom `AdminNav` replaces DefaultNav). Stub leaves use `/admin/coming-soon?section=<id>`.
- **Short admin URLs:** nav links use `/admin/c/<slug>` and `/admin/g/<slug>`; `src/proxy.ts` rewrites them to Payload’s `/collections/` and `/globals/`. Built-in Payload links may still show the long form.
- **Media library:** collection fields + conversion hooks in `src/collections/Media.ts` / `src/lib/compress-media.ts`; explorer UI under `src/components/admin/media/` (see `docs/media.md`).
- **Appearance:** colour tokens defined once in `src/lib/theme-tokens.ts` (drives both the `theme-colors` global and the public-site CSS vars); component types registered in `src/fields/component-settings/index.ts`, one settings group per type (see `docs/appearance.md`).

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
