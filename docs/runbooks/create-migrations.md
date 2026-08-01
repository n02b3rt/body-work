> Read when: the project needs to start somewhere other than a database that has already been through a dev push. First deploy, a rebuilt environment, or putting `pnpm build` back in CI.

# Runbook: give Payload a migration story

**This has not been done yet.** Until it is, the project can only start against a database that a
dev-mode schema push has already shaped. That is why CI cannot run `pnpm build` and why a first
production deploy would fail: `pnpm build` compiles and type-checks, then dies collecting page data
because static generation queries tables that a clean database does not have.

Payload pushes the schema automatically in development and **does not** in production, where it
expects migrations instead. There are none.

## What running this gets you

A file under `src/migrations/` describing the whole current schema, committed to the repo, which
`pnpm migrate` can replay onto any empty database.

## Steps

Do this on a machine with dependencies installed and Docker running. **One person, once**, not in
parallel with another agent: see [`../parallel-agents.md`](../parallel-agents.md).

1. **Start from a database that matches `main`.** Your own slot, not a shared one.

   ```bash
   docker compose up -d
   ```

2. **Let dev mode settle the schema**, so what gets captured is the real thing. Start the dev server,
   let it finish booting, answer any prompt carefully, then stop it.

   ```bash
   pnpm dev
   ```

3. **Generate the initial migration.**

   ```bash
   pnpm migrate:create
   ```

   It lands in `src/migrations/`. Read it before committing: it should create every table you expect
   (nine collections, two globals, the builder's block tables) and drop nothing.

4. **Prove it replays.** Point `DATABASE_URL` at an empty database, then:

   ```bash
   pnpm migrate
   ```
   ```bash
   pnpm migrate:status
   ```

   Anything less than a clean run means the migration is not trustworthy yet. Do not skip this: a
   migration that has only ever been generated, never applied, is a guess.

5. **Then, and only then**, put the build back in CI. Uncomment the `build` step in
   `.github/workflows/checks.yml` and give the job a Postgres service plus `PAYLOAD_SECRET`,
   `DATABASE_URL` and `NEXT_PUBLIC_SERVER_URL`, running `pnpm migrate` before `pnpm build`.

## Afterwards

Every schema change gets its own migration from then on: `pnpm migrate:create` after changing
collections, committed with the change. The `payload-schema` skill covers the rest of that loop.

Update [`../map/infra.md`](../map/infra.md) and this file's opening line once it is done, and drop a
line in [`../log.md`](../log.md).
