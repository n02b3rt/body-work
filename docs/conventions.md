> Read when: naming a file, picking a folder, writing a commit, or wondering whether a pattern is already settled here.

# Conventions: BODYWORK ecosystem

Decide once, follow always. Consistency beats personal preference. Written in English.

## Git

- **Repo from the start**, `main` always in a working state.
- **Branches:** `feat/<short>`, `fix/<short>`, `refactor/<short>`, `chore/<short>`. Don't commit non-trivial changes straight to `main`.
- **Commit = one logical change.** Commit often, in small steps.
- **Commit title:** `type: short, on-point summary` (≤ ~60 chars), English. Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`.
- **No long body**: a short body (2-4 bullets) only when the change is large or non-obvious.
- **No AI/tool authorship anywhere**: no "Co-Authored-By", "Generated with", or tool names, in commits, PRs, code, comments, or docs. Enforced by `.claude/settings.json` (`includeCoAuthoredBy: false`): don't change it.

## Naming

- Files / folders: kebab-case (e.g. `contact-form.tsx`), except Next.js reserved files (`page.tsx`, `layout.tsx`, `route.ts`)
- Variables / functions: camelCase
- Types / interfaces / components: PascalCase
- Constants: UPPER_SNAKE for true constants; camelCase for config objects

## Folder structure

Feature-first inside `src/app/`: each route segment owns its `page.tsx`, route-local components live alongside it. Shared, cross-route components/utilities go in `src/components/` and `src/lib/` (create these as soon as the first shared piece appears: don't pre-create empty folders).

Site split (hub/centrum/akademia/dash): route groups under `src/app/`, see [`sites.md`](./sites.md) for the full model. Hub and Akademia aren't created yet; create the first route group when the first real route is built, not before.

- **Route groups today:** the public site is `src/app/[locale]/`, Payload admin/API is `src/app/(payload)/`. **Do not add a root `src/app/layout.tsx`** that wraps both: each tree owns its own `<html>`/`<body>`, which is what lets Payload render its own document shell.
- **Dashboard host:** staff open the panel only via `DASHBOARD_HOST` (dev: `dash.localhost`). Never link to `/admin` from the public site.
- **Payload collections:** one file per collection in `src/collections/`, registered in `src/payload.config.ts`. Access helpers live in `src/access/`.
- **Roles:** `administrator` | `edytor` | `klient`: use the helpers in `src/access/roles.ts`; don't invent parallel permission checks. User display name: `getDisplayName` from `src/lib/users/`.
- **Public UI strings:** next-intl, add keys to `messages/pl.json` (and `en.json`); don't hardcode user-facing Polish in frontend components when a message key exists.
- **Dates/times (display):** use helpers from `src/lib/format-date.ts` (`formatDatePl`, `formatDateTimePl`) or next-intl `useFormatter().dateTime(value, 'dateTime')`: never ad-hoc `toLocaleString` / ISO strings in UI. Storage stays ISO/UTC.
- **Admin labels:** Polish strings in Payload collection/global configs are fine (editors work in PL).
- **Admin sidebar:** structure lives in `src/admin/nav-tree.ts`; don't rely on Payload's `admin.group` for multi-level nav (a custom `AdminNav` replaces DefaultNav). Stub leaves use `/admin/coming-soon?section=<id>`. Presentation (size, hover/active motion) is in `src/app/(payload)/custom.css` under `.bw-nav*`; icons in `src/components/admin/nav-icons.tsx`.
- **Short admin URLs:** nav links use `/admin/c/<slug>` and `/admin/g/<slug>`; `src/proxy.ts` rewrites them to Payload's `/collections/` and `/globals/`. Built-in Payload links may still show the long form.
- **Media library:** collection fields + conversion hooks in `src/collections/Media.ts` / `src/lib/compress-media.ts`; explorer UI under `src/components/admin/media/` (see [`media.md`](./media.md)).
- **Appearance:** colour tokens defined once in `src/lib/theme-tokens.ts` (drives both the `theme-colors` global and the public-site CSS vars); see [`appearance.md`](./appearance.md).

## Reuse before you build (scraped-site workflow)

When turning a scraped Centrum page into a real one:

1. Check [`map.md`](./map.md), then [`migration-tracker.md`](./migration-tracker.md) and `src/components/`, for a component that already covers this section (hero, service tile grid, testimonial carousel) before writing a new one.
2. Build it to be reused across pages, not page-specific, even if only one page needs it today: Centrum and Akademia are expected to share ~70% of components (`prd/04-architektura.md`).
3. After adding or reusing a component for a page, update its row in `migration-tracker.md` (components used/created, status).
4. New component = bilingual from the start (see [`i18n.md`](./i18n.md)): don't hardcode Polish strings "for now."
5. Use the real photos/video/logo from that page's `media/` folder, not a placeholder, see "Using real media assets" in [`scraped-site-map.md`](./scraped-site-map.md).

## Patterns

- Server Components by default; add `"use client"` only where interactivity requires it.
- CMS content, read via `getPayload()` in Server Components; edit in `/admin`. Prefer collections over hard-coded copy once a content type is editable. The existing page copy still lives in `messages/*.json`: migrate it to Payload deliberately, page by page, rather than hand-rolling a second data layer in between.
- After changing admin UI components or collections that affect the import map: `pnpm generate:importmap`. After schema/field changes: `pnpm generate:types`.
- One way to do one thing: if a second pattern for the same problem appears, consolidate.

## Admin UI copy

Short and dry, one line that names the thing. Full rule, examples and where it applies: [`admin-copy.md`](./admin-copy.md).

## Code style

- Linter / formatter: ESLint (`eslint.config.mjs`, `pnpm lint`) + Tailwind class conventions. Run before committing. PRD's target is Biome: still a pending stack decision, don't switch without asking (see [`stack.md`](./stack.md)).
- **Quote style is inconsistent across the seam** between the site files (double quotes, semicolons) and the CMS files (single quotes, no semicolons), inherited from the Payload template. Pick one and apply it with a formatter rather than letting each new file guess.
- Comments: only when they explain "why", not "what". No references to AI/tools.

## Tests

```bash
pnpm test
```

- **Runner: Node's built-in one** (`node --test`), which runs TypeScript directly. **No dependency**, in keeping with the stack rule. The PRD names Vitest and Playwright; neither is installed, and neither is needed for what we test today.
- **Tests need Node 22.18 or newer**, because that is where running TypeScript without a build landed. The app itself still targets Node 20 (`engines`); CI pins 22 for this reason alone.
- **Imports inside `tests/` carry the explicit `.ts` extension**, because `node` will not guess it. That is why the root `tsconfig.json` sets `allowImportingTsExtensions`. It only permits the extension: **code under `src/` keeps writing imports without one.**
- **New code arrives tested.** `tests/coverage.test.ts` fails when an importable module under `src/lib/` or `src/access/` has none. Its `GRANDFATHERED` list covers what predates the suite and **may only shrink**.
- **Where:** `tests/`, mirroring `src/`, one file per module (`tests/media.test.ts`). Not co-located, so nothing lands in the Next build or Payload's import map.
- **What we test:** pure functions whose behaviour is load-bearing and easy to break silently: media size resolution, slug and date formatting, user helpers. Write a test when you find yourself writing a comment explaining why something must not change.
- **What we do not test yet:** anything importing `@/…` path aliases or reaching Payload. Node resolves neither. That is the boundary where Vitest starts earning its place: **ask before adding it**.
- Name a test after the guarantee, not the function: `cardWide never substitutes for another size` beats `mediaFrom works`.

## Healthy growth (so it doesn't become a colossus)

- **Small files, single responsibility.** A file that does two things or grows past ~300 lines: split it.
- **Module boundaries early.** One domain = one module. Don't mix layers (UI / logic / data) in one bag.
- **Don't duplicate**: check [`map.md`](./map.md) first to see whether something already exists.
- **Refactoring is normal work**, not "someday". Notice a mess in passing: clean it up and commit it separately.
- **Docs have budgets too, and they are enforced.** See the limits in `CLAUDE.md`; a `docs/*.md` past 10 KB gets split, and a stale narrative gets rolled into `docs/archive/`. `pnpm check:docs` fails when you ignore it.

## Context handoff (session reset)

An agent degrades once a session runs long: it loops, or gets sloppy. Don't push through it. Get a dump, open a fresh session, paste it, continue.

> Produce a full technical dump of our current state (Context Handoff). List, in bullets: 1) exactly what we've done and that works, 2) where we're stuck / what we're working on now, 3) the next steps, 4) all key decisions and the names of changed files. Format it so I can paste it into a fresh chat and continue without losing context.

Before ending a heavy session, capture anything that won't be obvious from the diff as one line in [`log.md`](./log.md).

## Punctuation: no em-dashes

**Do not use the em-dash anywhere: not in copy, comments, commit messages, PR descriptions or docs.**
Use a colon where the second half explains the first, a comma where it is a subordinate clause, a
semicolon between two independent clauses, or split the sentence.

Two reasons. The client asked for it directly. And the site's own Polish copy uses the half-pause `–`
(576 of them across the imported posts, against 95 em-dashes), so em-dashes were never this project's
voice to begin with.

Two things stay untouched: copy transcribed verbatim from the reference site, including the strings in
`messages/*.json` that came from it, and the 62 imported posts in the database. Their punctuation is
the client's, not ours.
