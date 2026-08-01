> Read when: another agent may be working on this repo right now, or a pull request just landed in `main`.

# Parallel work

Several coding agents, in different terminals, share this repo. It works only because each one gets
its own worktree, its own database and its own port. Payload pushes the dev schema on startup, so
two agents on one database corrupt each other's tables.

## Files

| Piece | Path |
|---|---|
| The rules | [`../parallel-agents.md`](../parallel-agents.md) |
| Starting a task | [`../runbooks/start-parallel-work.md`](../runbooks/start-parallel-work.md) |
| Catching up after a merge | [`../runbooks/post-merge-sync.md`](../runbooks/post-merge-sync.md) |
| Claude Code | skills `start-parallel-work`, `post-merge-sync` |
| Cursor | `.cursor/commands/` |
| Any other tool | [`../../prompts/parallel-agent-bootstrap.md`](../../prompts/parallel-agent-bootstrap.md) |

**The runbook is the only copy of the procedure.** Skills and commands are thin routers to it; fix
the runbook, not a copy.

## The rules that bite

- **Never `docker compose down -v`.** One volume holds every agent's database.
- **Own worktree, own `DATABASE_URL` (`bodywork_a`, `bodywork_b`, …), own `pnpm dev --port 300X`,**
  own `.env`, own `media/`.
- **Stay in your module.** Ownership splits by folder: admin, public site, API plus collections.
  Need a change outside it? Report it, do not make it.
- **Never hand-edit or hand-merge generated files** (`src/payload-types.ts`, `importMap.js`).
  Take either side and regenerate.
- **Small PRs, rebase onto `main` the moment someone else's lands.** Branch names carry the agent
  letter: `feat/a-…`, `fix/b-…`.
- **Schema changes and stack changes are single-agent work.** Do not start one while another agent is
  in flight.
- **Port drift breaks admin saves.** `.env` must match `--port`, or CSRF rejects POSTs while the panel
  still looks logged in.

## Related

[`infra.md`](./infra.md) · [`cms-payload.md`](./cms-payload.md)
