# Paste-able prompts for agents without a skill system

Grok CLI and anything else that has no skills, commands or rules files still runs the
same two procedures: it just has to be told to read them. If your tool *does* support
a project instruction file, point it at the runbooks there instead of pasting; check
its docs for the filename (`AGENTS.md` is the one most tools now read, and this repo
already has it).

Keep these prompts short on purpose: they carry no procedure of their own, so they can
never drift from the runbooks.

---

## Session start

```
You are working on the BODYWORK repo at <path>. Other AI agents are working on the
same repo at the same time, each in its own git worktree with its own database.

Read, in this order: AGENTS.md, CLAUDE.md, docs/parallel-agents.md, and the
.agent-scope file in the worktree root if it exists.

Before you write any code, follow docs/runbooks/start-parallel-work.md step by step to
set up your own worktree, branch, database and port.

Then: <the task>.
```

## After any PR lands in main

```
A pull request has been merged into main. Follow docs/runbooks/post-merge-sync.md step
by step, in this worktree only, and report the result of each verification step.
```

## Guardrails, if the tool ignores everything but the system prompt

```
- Edit only the folders listed in .agent-scope. Need a change elsewhere? Report it.
- Never run `docker compose down -v`: one volume holds every agent's database.
- Never hand-edit src/payload-types.ts or src/app/(payload)/admin/importMap.js;
  regenerate them with pnpm generate:types / pnpm generate:importmap.
- Payload schema changes (src/collections/, src/fields/) are single-agent work.
- Installing, removing or upgrading any library needs the user's approval first.
- Branch names carry your slot letter: feat/b-…, fix/b-…. Never commit to main.
- No AI or tool authorship anywhere: not in commits, PRs, code, comments or docs.
```
