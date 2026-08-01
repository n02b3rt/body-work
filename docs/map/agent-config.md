> Read when: adding a skill, a slash command, a doc, or changing how agents are told to work here.

# Docs and agent config

The rules an agent reads, and the files that carry them. Three layers, each with one job.

## 1. Rules, always loaded

| File | Job |
|---|---|
| `CLAUDE.md` | router, protocol, non-negotiables, budgets. **Kept under 3 KB on purpose** |
| `AGENTS.md` | the same rules, tool-agnostic, for anything that is not Claude Code |
| `README.md` | for humans: what the project is, how to run it |

## 2. Knowledge, loaded on demand

| Layer | Where | Answers |
|---|---|---|
| Map | `docs/map.md` plus `docs/map/*.md` | **where** something lives |
| Topic docs | `docs/*.md` | **how and why** it works |
| Requirements | `docs/prd/` | what was specified |
| History | `docs/log.md`, then `docs/archive/` | what was decided, and what bit us |

Every file in `docs/` opens with a `> Read when:` line. That line is the whole point: it lets an
agent decide not to open the file.

## 3. Triggers, loaded by the harness

`.claude/skills/`, thirteen of them. A skill's `description` says **when** it applies; the harness keeps
only that one line in context and pulls the body in when the task matches. The prose inside is
tool-agnostic, and `AGENTS.md` routes other tools to the same files.

| Skill | Fires on |
|---|---|
| `centrum-fidelity` | Centrum pages and section components |
| `new-route` | a new `page.tsx` or `route.ts` |
| `blog-content` | the blog: listing, posts, archives, EN versions |
| `images-and-video` | any image, gallery, hero or video |
| `payload-schema` | collections, globals, fields, config |
| `page-builder` | builder elements and sections |
| `payload-script` | anything under `scripts/` using `payload run` |
| `write-tests` | a function under `src/lib` or `src/access`, or a red coverage ratchet |
| `admin-copy` | any string an editor will read |
| `i18n-messages` | translation keys, client components reading them |
| `finish-task` | before a commit or PR |
| `start-parallel-work`, `post-merge-sync` | worktree setup and post-merge catch-up |

Also: `.claude/settings.json` (permission allow and deny lists), `.claude/commands/log.md` (`/log`),
`.cursor/commands/` for Cursor, `prompts/parallel-agent-bootstrap.md` for everything else.

## Gotchas

- **A global gitignore (`~/.gitignore_global`) excludes `.claude/`.** The repo `.gitignore` negates it.
  Undo that and the skills silently stop shipping to anyone who clones.
- **Skills are thin routers.** The procedure lives in `docs/`; edit the doc, not the skill's summary.
- **`pnpm check:docs` (`scripts/check-docs.mjs`) enforces every rule here**: budgets, `> Read when:`
  headers, link validity, that each path the map claims actually exists, that every source folder and
  script is covered, the 20-entry log cap, and an em-dash ratchet whose debt may shrink but never grow.
  It is the difference between rules and wishes. Run it before committing.
- **Budgets are the only thing stopping this from regrowing.** They are in `CLAUDE.md`, and so is the
  growth rule for when a map file gets too big.
- **`.claude/settings.json` deny rules are load-bearing**, not decoration: they block reading the
  754 KB generated types file and wiping the shared Docker volume.

## Related

[`../conventions.md`](../conventions.md) · [`parallel-work.md`](./parallel-work.md)
