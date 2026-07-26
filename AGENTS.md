# AGENTS.md — BODYWORK ecosystem

This repo's full AI-agent workflow, docs index, and project map live in [`CLAUDE.md`](./CLAUDE.md) at the repository root. It's written tool-agnostically — no Claude-specific tooling assumed — so treat every rule in it as if it were written here, whichever coding agent you are.

The essentials, restated in case your tooling only reads this file and never follows the pointer:

- **Plan before non-trivial changes.** Reason through edge cases and alternatives before writing code.
- **Read `PRD.md` and `AI_NOTES.md` first** — requirements and the running project journal.
- **Ask before touching the stack.** Installing, removing, upgrading, or swapping any library/service requires telling the user first. Approved list + why: `docs/stack.md`.
- **Git:** feature branches (`feat/`, `fix/`, `refactor/`, `chore/`), small commits, `type: short summary` titles, never non-trivial commits straight to `main`. No AI/tool authorship anywhere — no "Co-Authored-By", "Generated with", or tool names in commits, code, comments, or docs.
- **Definition of done:** code works + the relevant `docs/*.md` file is updated + (larger tasks) an `AI_NOTES.md` entry + commit.
- **Don't duplicate** — check `CLAUDE.md`'s project map and docs index before building something that might already exist.

Everything else — architecture, sites/domains, i18n, conventions, the scraped-content map — is indexed in `CLAUDE.md`. Start there.
