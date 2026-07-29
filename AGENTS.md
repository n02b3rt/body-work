# AGENTS.md: BODYWORK ecosystem

This repo's full AI-agent workflow, docs index, and project map live in [`CLAUDE.md`](./CLAUDE.md) at the repository root. It's written tool-agnostically: no Claude-specific tooling assumed, so treat every rule in it as if it were written here, whichever coding agent you are.

The essentials, restated in case your tooling only reads this file and never follows the pointer:

- **Plan before non-trivial changes.** Reason through edge cases and alternatives before writing code.
- **Read `PRD.md` and `AI_NOTES.md` first**: requirements and the running project journal.
- **Ask before touching the stack.** Installing, removing, upgrading, or swapping any library/service requires telling the user first. Approved list + why: `docs/stack.md`.
- **Git:** feature branches (`feat/`, `fix/`, `refactor/`, `chore/`), small commits, `type: short summary` titles, never non-trivial commits straight to `main`. No AI/tool authorship anywhere: no "Co-Authored-By", "Generated with", or tool names in commits, code, comments, or docs.
- **Definition of done:** code works + the relevant `docs/*.md` file is updated + (larger tasks) an `AI_NOTES.md` entry + commit.
- **Don't duplicate**: check `CLAUDE.md`'s project map and docs index before building something that might already exist.

## Working next to other agents

This repo is often worked on by several agents at once, in separate terminals. Full workflow: [`docs/parallel-agents.md`](./docs/parallel-agents.md). The rules that will bite you if you skip it:

- **Your own worktree, your own database, your own port.** `git worktree add`, a separate `DATABASE_URL` (`bodywork_a`, `bodywork_b`, …) and `pnpm dev --port 300X`. Payload pushes the dev schema on startup, so two agents on one database corrupt each other's tables. Each worktree needs its own `.env` and gets its own `media/`.
- **Never run `docker compose down -v`.** One volume holds every agent's database.
- **Stay in your module.** Ownership is split by folder (admin / public site / API + collections). Need a change outside it? Report it, don't make it.
- **Never hand-edit generated files** (`src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`). Regenerate after merging instead.
- **Small PRs, rebase onto `main` as soon as another PR lands.** Branch names carry your agent letter: `feat/a-…`, `fix/b-…`.
- **Schema changes and stack changes are single-agent work.** Don't start one if another agent is mid-flight.

Everything else, architecture, sites/domains, i18n, conventions, the scraped-content map, is indexed in `CLAUDE.md`. Start there.
