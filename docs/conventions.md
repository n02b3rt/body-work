# Conventions — BODYWORK ecosystem

> Decide once, follow always. Consistency beats personal preference. Written in English.

## Git

- **Repo from the start**, `main` always in a working state.
- **Branches:** `feat/<short>`, `fix/<short>`, `refactor/<short>`, `chore/<short>`. Don't commit non-trivial changes straight to `main`.
- **Commit = one logical change.** Commit often, in small steps.
- **Commit title:** `type: short, on-point summary` (≤ ~60 chars), English. Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `perf`.
- **No long body** — a short body (2-4 bullets) only when the change is large or non-obvious.
- **No AI/tool authorship anywhere** — no "Co-Authored-By", "Generated with", or tool names, in commits, PRs, code, comments, or docs. Enforced by `.claude/settings.json` (`includeCoAuthoredBy: false`) — don't change it.

## Naming

- Files / folders: kebab-case (e.g. `contact-form.tsx`), except Next.js reserved files (`page.tsx`, `layout.tsx`, `route.ts`)
- Variables / functions: camelCase
- Types / interfaces / components: PascalCase
- Constants: UPPER_SNAKE for true constants; camelCase for config objects

## Folder structure

Feature-first inside `src/app/`: each route segment owns its `page.tsx`, route-local components live alongside it. Shared, cross-route components/utilities go in `src/components/` and `src/lib/` (create these as soon as the first shared piece appears — don't pre-create empty folders).

Site split (hub/centrum/akademia/dash): route groups under `src/app/`, e.g. `app/(centrum)/`, `app/(akademia)/` — see [`sites.md`](./sites.md) for the full model. Not created yet; create the first route group when the first real route is built, not before.

## Reuse before you build (scraped-site workflow)

When turning a scraped Centrum page into a real one:

1. Check [`migration-tracker.md`](./migration-tracker.md) and `src/components/` for a component that already covers this section (hero, service tile grid, testimonial carousel, etc.) before writing a new one.
2. Build it to be reused across pages, not page-specific, even if only one page needs it today — Centrum and Akademia are expected to share ~70% of components (PRD §7.2).
3. After adding or reusing a component for a page, update its row in `migration-tracker.md` (components used/created, status).
4. New component = bilingual from the start (see [`i18n.md`](./i18n.md)) — don't hardcode Polish strings "for now."

## Patterns

- Server Components by default; add `"use client"` only where interactivity requires it.
- Static content (page copy) can start as local constants/props; move to Payload once it's installed — don't hand-roll a data layer in between.
- One way to do one thing — if a second pattern for the same problem appears, consolidate.

## Code style

- Linter / formatter: ESLint today (`eslint.config.mjs`, `npm run lint`); PRD's target is Biome — that's a pending stack decision, don't switch without asking (see [`stack.md`](./stack.md)).
- Comments: only when they explain "why", not "what". No references to AI/tools.

## Tests

- What we test: _(fill in once testing is set up — likely critical page rendering and any interactive forms)_
- Where they live / how we name them / how to run them: _(fill in — PRD specifies Vitest for unit tests, Playwright for E2E, neither installed yet)_

## Healthy growth (so it doesn't become a colossus)

- **Small files, single responsibility.** A file that does two things or grows past ~300 lines → split it.
- **Module boundaries early.** One domain = one module. Don't mix layers (UI / logic / data) in one bag.
- **Don't duplicate** — check `CLAUDE.md`'s docs index and project map first to see whether something already exists.
- **Refactoring is normal work**, not "someday". Notice a mess in passing → clean it up and commit it separately.

## Context handoff (session reset)

An AI degrades when a chat gets too long (context pollution) or nears the token limit — it starts looping or making sloppy mistakes. When you notice that, don't push through it. Reset: get a clean technical dump, open a fresh chat, paste the dump, and continue on a fast, clean model.

Prompt to paste when you want a handoff:

> Produce a full technical dump of our current state (Context Handoff). List, in bullets: 1) exactly what we've done and that works, 2) where we're stuck / what we're working on now, 3) the next steps, 4) all key decisions and the names of changed files. Format it so I can paste it into a fresh chat and continue without losing context.

Before ending a heavy session, capture the same summary in `AI_NOTES.md` so nothing is lost.
