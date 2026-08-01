# Sync this slot after a merge

Read `docs/runbooks/post-merge-sync.md` and follow it step by step, in this worktree
only.

That runbook is the procedure: do not work from memory. It rebases this checkout on
`origin/main`, regenerates the Payload types and the import map, pushes the schema to
this slot's own database and verifies the result.

Non-negotiable while you read it:

- Never hand-merge `src/payload-types.ts` or `src/app/(payload)/admin/importMap.js`.
  Take either side, then regenerate.
- If Payload asks about a destructive schema change, stop and ask me.
- If `tsc`, `check:messages` or `build` comes back red, report it as red.
