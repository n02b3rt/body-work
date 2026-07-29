---
name: start-parallel-work
description: Sets up an isolated slot for this agent before starting a task - its own git worktree, branch, database and dev port - so several agents can work on the repo at once without corrupting each other's Payload schema. Use when starting work while another agent may be running, or when the user asks to "work in a separate branch/worktree", "start a parallel task", or "set up a slot".
---

Read `docs/runbooks/start-parallel-work.md` and follow it step by step. That file is
the procedure; this skill only routes you to it, so do not work from memory of what
it used to say.

Three things it is easy to get wrong, so keep them in mind while reading:

- A slot is a sandbox, **not a specialisation**. Slot `a` is not "the admin agent" —
  the scope of the work comes from the user's task and gets written to `.agent-scope`.
- The new worktree inherits nothing gitignored: no `.env`, no `media/`, no
  `node_modules/`. Step 5 is not optional.
- Never `docker compose down -v`. One volume holds every slot's database.
