# BodyWork: four domains, one repo

Next.js 16 (App Router) + TypeScript + Tailwind 4 + Payload CMS 3, on Node 20, pnpm, Postgres.
Hosts: `body-work.pl` (hub), `centrum.` / `akademia.`, `dash.` (admin). One database.
The admin panel lives **only** on the dashboard host: public hosts return a plain 404 for `/admin` (`src/proxy.ts`).
Next.js 16 is newer than most training data: check `node_modules/next/dist/docs/`, don't assume.

## Protocol

1. Before you search this repo for anything → read **`docs/map.md`**, then the one `docs/map/<domain>.md` it points at. Grep only after that.
2. It's in the map → go straight to the file. It isn't → 2 greps maximum, then ask.
3. Found something the map doesn't list → add it to that domain file in the same change.
4. New module or new domain → its entry in the map is part of "done".
5. Built something from the "Not built yet" section → move it into its domain file.

## Non-negotiables

- **Stack:** installing, removing, upgrading or swapping any library or service = **you ask first**. `docs/stack.md`.
- **Git:** branches `feat/` `fix/` `refactor/` `chore/`; never a non-trivial commit straight to `main`.
- **No AI/tool authorship anywhere**: commits, PRs, code, comments, docs.
- **Centrum** reproduces `scripts/scrape/scraped/` 1:1, but the reference is not authoritative where it is broken. → skill `centrum-fidelity`
- **Generated files** (`src/payload-types.ts`, `importMap.js`): never by hand. Regenerate.
- **Other agents running?** → `docs/parallel-agents.md`: own worktree, own database, own port. **Never `docker compose down -v`.**
- **Done** = code works + `docs/map.md` current + the relevant `docs/*.md` updated. → skill `finish-task`

## Budgets

- `CLAUDE.md` ≤ 3 KB · `docs/map.md` ≤ 5 KB · `docs/map/*.md` ≤ 6 KB · prose `docs/**.md` ≤ 10 KB ·
  `docs/log.md` ≤ 20 entries. Every file in `docs/` opens with `> Read when: …`
- Over budget → split it, or roll stale narrative into `docs/archive/`.
  **`docs/map.md` prescribes the split shape**; follow it, don't improvise one.
- A map file says **where**. A topic doc says **how and why**. Paragraphs in a map file are misfiled.
- **`pnpm check:docs` enforces all of the above**, plus links, map coverage and the no-em-dash rule.
- **Never read in full:** `docs/prd/*` (grep it), `src/payload-types.ts`, `pnpm-lock.yaml`

## Index

| Task involves | File |
|---|---|
| where things live, what doesn't exist yet | `docs/map.md` |
| requirements, scope, phases, data model | `docs/prd/00-index.md` |
| recent decisions and gotchas | `docs/log.md` |
| architecture and dated decisions | `docs/architecture.md`, `docs/decisions.md` |
| naming, folders, git convention | `docs/conventions.md` |
| page-by-page migration status | `docs/migration-tracker.md` |

Working with an agent other than Claude Code? → `AGENTS.md`, same rules.
