# Start work in an isolated slot

Read `docs/runbooks/start-parallel-work.md` and follow it step by step, then start
the task I gave you inside the worktree it creates.

That runbook is the procedure — do not work from memory. It sets up this agent's own
git worktree, branch, Postgres database and dev port, so that we do not corrupt each
other's Payload schema.

Non-negotiable while you read it:

- A slot is a sandbox, not a specialisation. The scope comes from my task, and you
  write it to `.agent-scope`.
- The new worktree inherits nothing gitignored — it needs its own `.env`,
  `pnpm install`, and it starts with an empty `media/`.
- Never run `docker compose down -v`. One volume holds every agent's database.
