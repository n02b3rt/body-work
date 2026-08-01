> Read when: a pull request just landed in `main` and this worktree needs to catch up. This file is the procedure; follow it step by step.

# Runbook: sync one slot after a merge

> **This file is the single source of truth for the procedure**, whichever agent you
> are. Claude Code reaches it through the `post-merge-sync` skill, Cursor through
> `/post-merge-sync`, every other tool by being told to read it. Change the procedure
> here; the adapters are three-line pointers and must stay that way.

**Run when:** any pull request has landed in `main` — yours or another agent's — or
when the user asks to sync, rebase or catch up a worktree after a merge.

Run this **in the worktree that needs catching up**, once per merged PR. It touches
only this slot's checkout and this slot's database (`DATABASE_URL` in the local
`.env`); it never reaches into another agent's slot.

Rebasing late is what makes parallel work fail: a conflict across three files after
an hour is solvable, the same conflict across forty files after three days is not.

Background: `docs/parallel-agents.md`.

## 1. Know where you are

```bash
pwd && git branch --show-current && git status --short
```

Read `.agent-scope` if it exists — it says which slot, port and database this
worktree owns.

If the working tree is dirty, commit or stash before rebasing. Never rebase over
uncommitted work.

## 2. Rebase onto the new main

```bash
git fetch origin
git rebase origin/main
```

**If the merged PR was this branch's own**, there is nothing to rebase — start the
next task from a fresh branch instead, and delete the old one:

```bash
git switch -c <prefix>/<slot>-<next-topic> origin/main
git branch -D <old-branch>
```

### Resolving conflicts

- `src/payload-types.ts`, `src/app/(payload)/admin/importMap.js` — **do not merge
  them by hand.** Take either side (`git checkout --theirs`), finish the rebase and
  regenerate in step 4; the generator is the source of truth.
- `pnpm-lock.yaml` — take `origin/main`'s version. Only one agent installs
  anything, and installing needs the user's approval anyway.
- `messages/pl.json` / `en.json` — keep both sides' keys; they are appended in
  different namespaces.
- `CLAUDE.md`, `docs/*.md` — plain prose, keep both entries and put
  the newer one on top.
- Source files inside another agent's area — a signal that the scope split leaked.
  Resolve in favour of `origin/main` and tell the user.

## 3. Reinstall if dependencies moved

```bash
git diff --stat HEAD@{1} -- pnpm-lock.yaml package.json
```

Anything there means `pnpm install`. Otherwise skip it.

## 4. Regenerate what is generated

```bash
pnpm generate:types
pnpm generate:importmap
```

Both write into the working tree. If they produce a diff, that diff belongs in a
commit of its own (`chore: regenerate payload types after merge`), never mixed into
a feature commit.

## 5. Push the schema to this slot's database

The merge may have brought new collections or fields. Payload pushes the dev schema
on boot, so booting it once is the migration:

```bash
pnpm smoke:builder
```

It boots Payload against `DATABASE_URL` from this worktree's `.env` and exercises
the page builder end to end, so it doubles as a check.

If Payload asks about a destructive change (a dropped column, a renamed enum),
**stop and ask the user** — accepting it silently deletes data from this slot's
database. Never answer it by wiping the shared volume; `docker compose down -v`
would destroy every agent's database, not just this one.

## 6. Verify

Run in this order and stop at the first failure:

```bash
npx tsc --noEmit
pnpm check:messages
pnpm build
```

Notes:

- `pnpm build` reserves a 4 GB heap. Confirm no other slot is building first.
- `pnpm lint` fails on `main` for reasons unrelated to any change here
  (eslint-plugin-react against ESLint 10, while linting `eslint.config.mjs`). Do
  not spend the session chasing it, and do not "fix" it by touching the stack.
- A dev server started before the rebase is stale — restart it.

## 7. If this branch is the one that just merged

Per `docs/parallel-agents.md`, the `docs/log.md` line is written at merge time,
not while the branch lives, so that three agents do not all prepend to the same
file. If yours was the merged PR and the entry is not in `main` yet, add it now on
a small follow-up branch, together with any `docs/*.md` row the feature needs.

## 8. Report

One short paragraph: what came in from `main`, which conflicts you resolved and
how, whether types or the import map changed, whether the schema push touched this
slot's database, and the result of each verification step. If anything is still
red, say so plainly instead of reporting the sync as done.
