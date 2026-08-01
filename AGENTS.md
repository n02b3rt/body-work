# AGENTS.md: BODYWORK ecosystem

The full rules, protocol and project map live in [`CLAUDE.md`](./CLAUDE.md). It is written
tool-agnostically: no Claude-specific tooling assumed, so treat every rule in it as if it were
written here, whichever coding agent you are.

The essentials, restated in case your tooling only reads this file:

- **Start at [`docs/map.md`](./docs/map.md)** before you search this repo for anything. It says where
  things live and, more usefully, **what doesn't exist yet** (payments, hub, akademia, tests).
  Grep only when the map has no answer. Found something the map doesn't list → add its row.
- **The PRD is a spec, not a briefing.** Don't read it end to end:
  [`docs/prd/00-index.md`](./docs/prd/00-index.md) tells you which of the 10 files to open.
  Recent decisions and gotchas: [`docs/log.md`](./docs/log.md).
- **Stack:** installing, removing, upgrading or swapping any library or service = **you ask first**.
  Approved list and why: [`docs/stack.md`](./docs/stack.md).
- **Git:** branches `feat/`, `fix/`, `refactor/`, `chore/`, small commits, `type: short summary` titles,
  never a non-trivial commit straight to `main`. **No AI/tool authorship anywhere**: no "Co-Authored-By",
  "Generated with", or tool names in commits, code, comments, or docs.
- **Admin UI copy is short and dry** (section leads, field descriptions, card hints): one line that
  names the thing, not a tutorial. Rule and examples: [`docs/admin-copy.md`](./docs/admin-copy.md).
- **Definition of done:** code works + `docs/map.md` current + the relevant `docs/*.md` updated + commit.
- **Don't duplicate**: check `docs/map.md` before building something that may already exist.

## Working next to other agents

This repo is often worked on by several agents at once, in separate terminals. Full workflow:
[`docs/parallel-agents.md`](./docs/parallel-agents.md). Two runbooks carry it, and they are
tool-agnostic: read the file and follow it, whatever agent you are:

- **Starting a task** next to another agent → [`docs/runbooks/start-parallel-work.md`](./docs/runbooks/start-parallel-work.md)
- **A PR just landed in `main`** → [`docs/runbooks/post-merge-sync.md`](./docs/runbooks/post-merge-sync.md)

Claude Code invokes them as skills, Cursor as `/start-parallel-work` and `/post-merge-sync`;
anything else is pointed at the files directly (paste-able prompts:
[`prompts/parallel-agent-bootstrap.md`](./prompts/parallel-agent-bootstrap.md)). The steps are
identical: the runbook is the only copy.

The rules that will bite you if you skip all of it:

- **Your own worktree, your own database, your own port.** `git worktree add`, a separate
  `DATABASE_URL` (`bodywork_a`, `bodywork_b`, …) and `pnpm dev --port 300X`. Payload pushes the dev
  schema on startup, so two agents on one database corrupt each other's tables. Each worktree needs
  its own `.env` and gets its own `media/`.
- **Never run `docker compose down -v`.** One volume holds every agent's database.
- **Stay in your module.** Ownership is split by folder (admin / public site / API + collections).
  Need a change outside it? Report it, don't make it.
- **Never hand-edit generated files** (`src/payload-types.ts`, `src/app/(payload)/admin/importMap.js`).
  Regenerate after merging instead.
- **Small PRs, rebase onto `main` as soon as another PR lands.** Branch names carry your agent letter:
  `feat/a-…`, `fix/b-…`.
- **Schema changes and stack changes are single-agent work.** Don't start one if another agent is mid-flight.

Everything else (architecture, sites/domains, i18n, conventions, the scraped-content map) is
indexed in `CLAUDE.md` and `docs/map.md`. Start there.
