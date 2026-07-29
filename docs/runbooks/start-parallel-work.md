# Runbook: start work in an isolated slot

> **This file is the single source of truth for the procedure**, whichever agent you
> are. Claude Code reaches it through the `start-parallel-work` skill, Cursor through
> `/start-parallel-work`, every other tool by being told to read it. Change the
> procedure here; the adapters are three-line pointers and must stay that way.

**Run when:** starting a task while another agent may be working, or when the user
asks to work in a separate branch/worktree, start a parallel task, or set up a slot.

Every parallel agent needs three things of its own: a **worktree**, a **database**
and a **dev port**. Payload pushes the dev schema on startup, so two agents sharing
one database will overwrite each other's tables.

Background and the reasoning behind each rule: `docs/parallel-agents.md`.

**A slot is not tied to any part of the codebase.** Slot `a` is not "the admin
agent". The slot is just an isolated sandbox; the scope of the work comes from the
task you were given and is recorded per session in step 6.

## 1. Take the task's scope from the user, not from the slot

Before touching anything, state in one line which folders this task will touch,
based on what the user asked for. Use the project map in `CLAUDE.md` to name real
paths. If another agent is already running, this list must not overlap theirs —
check the `.agent-scope` files of the sibling worktrees (step 6) and say so if it
does, instead of proceeding.

## 2. Find a free slot

```bash
git -C <repo> worktree list
```

Slots are letters `a`, `b`, `c`, … mapped to `../bw-<slot>`, port `3000 + n`
(a → 3001, b → 3002, c → 3003) and database `bodywork_<slot>`. Take the first
letter with no worktree. If every slot is taken but one is stale (its branch is
merged and nothing is running on its port), reuse it rather than adding a fourth.

## 3. Create the database if it is missing

```bash
docker compose up -d
docker compose exec postgres psql -U payload -lqt | grep bodywork_<slot> \
  || docker compose exec postgres psql -U payload -d bodywork -c "CREATE DATABASE bodywork_<slot>;"
```

Never `docker compose down -v` — one volume holds every slot's database.

## 4. Create the worktree

Branch off the remote's `main`, never off whatever the current worktree happens to
hold:

```bash
git fetch origin
git worktree add ../bw-<slot> -b <prefix>/<slot>-<topic> origin/main
```

`<prefix>` follows `docs/conventions.md` (`feat`, `fix`, `refactor`, `chore`).
The slot letter in the branch name is what makes a PR list readable.

## 5. Give the worktree its own environment

Nothing gitignored is inherited — the new worktree has no `.env`, no `media/`, no
`node_modules/`.

```bash
cp <repo>/.env ../bw-<slot>/.env
```

Then edit those three lines in the copy (the variable is `DATABASE_URL`, and every
URL must agree on the port):

```
DATABASE_URL=postgresql://payload:payload@localhost:5432/bodywork_<slot>
NEXT_PUBLIC_SERVER_URL=http://localhost:<port>
NEXT_PUBLIC_DASHBOARD_URL=http://dash.localhost:<port>
```

`DASHBOARD_HOST` stays `dash.localhost` — the host proxy matches on hostname, not
port. `PAYLOAD_SECRET` can stay as it is; it is a dev secret.

```bash
cd ../bw-<slot> && pnpm install
```

## 6. Record the scope so the other agents can see it

Write `../bw-<slot>/.agent-scope`:

```
slot: <slot>
branch: <prefix>/<slot>-<topic>
port: <port>
db: bodywork_<slot>
task: <one line: what the user asked for>
owns:
  - <path>
  - <path>
started: <YYYY-MM-DD HH:MM>
```

Keep it out of git without touching the tracked `.gitignore` — once per repo:

```bash
grep -q '^\.agent-scope$' <repo>/.git/info/exclude || echo '.agent-scope' >> <repo>/.git/info/exclude
```

## 7. Start and hand over

```bash
pnpm dev --port <port>
```

The database is empty, so `http://dash.localhost:<port>/admin` will ask for a first
admin user — each slot has its own. Uploads land in this worktree's own `media/`,
so Media documents created in another slot will not resolve here. That is
deliberate: it keeps a destructive reset local to one agent.

Report to the user: slot letter, path, branch, port, admin URL and the scope from
step 1.

## Rules that hold for the rest of the session

- **Stay inside the scope from step 1.** Need a change outside it? Report it, do
  not make it.
- **Never hand-edit generated files** — `src/payload-types.ts`,
  `src/app/(payload)/admin/importMap.js`. Regenerate them.
- **Payload schema changes** (`src/collections/`, `src/fields/`) are single-agent
  work. If another `.agent-scope` claims them, stop and say so.
- **Stack changes need the user's approval** — see `docs/stack.md`.
- **`pnpm build` reserves a 4 GB heap.** Do not run one while another slot is
  building.
- When someone else's PR lands, run the `post-merge-sync` skill before continuing.
