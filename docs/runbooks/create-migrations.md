> Read when: you changed a collection, a global or a field, and the schema has to reach an environment that dev mode will never touch.

# Runbook: migrations

**The initial migration exists** (`src/migrations/20260901_160631`), generated from the
schema as of 1 September 2026 and proved by replaying it onto an empty database. That is
what lets `pnpm build` run in a fresh environment, what put the build back into CI, and
what a deployed container runs on start.

Payload pushes the schema automatically in development and expects migrations everywhere
else. The push is not a fallback you can enable: the adapter checks
`NODE_ENV !== 'production'` before it looks at the `push` option, so a production build
cannot be talked into shaping its own database.

## Every schema change from here

A change to a collection, a global or a field is not finished until its migration is
committed with it.

1. Make the change, and let dev mode settle it.

   ```bash
   pnpm dev
   ```

2. Generate the migration.

   ```bash
   pnpm migrate:create
   ```

   It lands in `src/migrations/`. Read it before committing: it should describe your
   change and nothing else. An unexpected `DROP` means dev mode had already drifted from
   `main`, and the fix is a clean database, not a hand-edited migration.

3. Prove it replays, against an empty database rather than the one you just changed.

   ```bash
   pnpm migrate
   ```
   ```bash
   pnpm migrate:status
   ```

CI runs `pnpm migrate` before `pnpm build` on a throwaway Postgres, so a missing migration
fails the pull request rather than the deploy.

## Databases that predate this

A dump taken before 1 September 2026 has the tables but no row in `payload_migrations`,
so migrating it tries to create them a second time. Stamp it instead, once:

```sql
INSERT INTO payload_migrations (name, batch) VALUES ('20260901_160631', 1);
```

Then read the app's log on the next start. Anything missing means that database had
drifted from the repo, and the answer is a migration generated from it, not manual SQL.

## Related

[`deploy-demo.md`](./deploy-demo.md) - [`../map/infra.md`](../map/infra.md)
