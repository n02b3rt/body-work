---
name: start-parallel-work
description: Sets up an isolated slot for this agent before starting a task - its own git worktree, branch, database and dev port - so several agents can work on the repo at once without corrupting each other's Payload schema. Use when starting work while another agent may be running, or when the user asks to "work in a separate branch/worktree", "start a parallel task", or "set up a slot".
---

**Read `.claude/skills/start-parallel-work/SKILL.md` and follow it.** That file holds the actual guidance and
is written tool-agnostically, so ignore its frontmatter and treat every rule in it as if it were
written here.

This file exists only so Grok Code can see the trigger above. It is generated: run `pnpm sync:skills`
after editing the source, and never edit this copy by hand.
