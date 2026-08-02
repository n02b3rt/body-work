---
name: post-merge-sync
description: Brings one worktree and its own database back in line after a pull request lands in main - rebase, reinstall, regenerate Payload types and the import map, push the schema to this slot's database, then verify. Use right after any PR is merged (yours or another agent's), or when the user asks to sync/rebase/catch up a worktree after a merge.
---

**Read `.claude/skills/post-merge-sync/SKILL.md` and follow it.** That file holds the actual guidance and
is written tool-agnostically, so ignore its frontmatter and treat every rule in it as if it were
written here.

This file exists only so Grok Code can see the trigger above. It is generated: run `pnpm sync:skills`
after editing the source, and never edit this copy by hand.
