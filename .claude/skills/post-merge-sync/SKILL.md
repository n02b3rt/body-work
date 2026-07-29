---
name: post-merge-sync
description: Brings one worktree and its own database back in line after a pull request lands in main - rebase, reinstall, regenerate Payload types and the import map, push the schema to this slot's database, then verify. Use right after any PR is merged (yours or another agent's), or when the user asks to sync/rebase/catch up a worktree after a merge.
---

Read `docs/runbooks/post-merge-sync.md` and follow it step by step. That file is the
procedure; this skill only routes you to it, so do not work from memory of what it
used to say.

Three things it is easy to get wrong, so keep them in mind while reading:

- `src/payload-types.ts` and `src/app/(payload)/admin/importMap.js` are **never**
  merged by hand. Take either side, then regenerate.
- If Payload asks about a destructive schema change during the boot in step 5, stop
  and ask the user. Do not answer it by wiping the shared volume.
- Report failures as failures. A red `tsc` or `build` means the sync is not done.
