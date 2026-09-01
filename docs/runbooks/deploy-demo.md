> Read when: putting the client demo on the TrueNAS box, loading content into it, or updating it to a newer build.

# Runbook: the demo on TrueNAS

A live demo at `bodywork.czekanski.dev`, with `centrum.` and `admin.` alongside it,
running the real content rather than an empty database, updated by hand when a build is
worth showing.

Pieces: an image built by GitHub Actions into GHCR, a custom app on TrueNAS 25.04 holding
that image plus its own Postgres, and Nginx Proxy Manager in front for TLS and the
password gate, reached through a Cloudflare Tunnel.

## Before you start

- The image is public-repo-private, so the NAS needs a GHCR pull credential: a GitHub
  personal access token with `read:packages`, added under Apps -> Settings -> Manage
  Container Images -> registry `ghcr.io`.
- Three DNS names pointing at the tunnel: `bodywork`, `centrum.bodywork`,
  `admin.bodywork`, all under `czekanski.dev`.
- The datasets, created once:

```
/mnt/<pool>/apps/bodywork/pgdata
/mnt/<pool>/apps/bodywork/media
/mnt/<pool>/apps/bodywork/data
```

`media` and `data` must be owned by uid 1000: the container drops to the `node` user, and
an upload into a root-owned dataset fails with EACCES rather than anything readable.

## 1. Cut an image

Actions -> release -> Run workflow, or push a `v*` tag. It publishes
`ghcr.io/n02b3rt/body-work:latest` plus a `sha-` tag for the exact commit.

The build takes its time on purpose: it stands up a throwaway Postgres inside the
Dockerfile and migrates it, because `next build` reaches Payload while collecting page
data and needs a real schema to query.

## 2. Install the app

Apps -> Discover -> Custom App -> Install via YAML, with
[`deploy/truenas/docker-compose.yml`](../../deploy/truenas/docker-compose.yml). Replace
every `CHANGE_ME`: the pool name, the database password, and `PAYLOAD_SECRET`
(`openssl rand -hex 32`).

On first start the entrypoint runs `pnpm migrate` against the empty database and the site
comes up with no content. That is expected; content arrives next.

## 3. Load the demo content

The content lives in the dev database and in `media/`, neither of which is in the repo.

On the machine that has them:

```bash
docker compose exec -T postgres pg_dump -U payload -d bodywork --no-owner --no-privileges > bodywork.sql
```

Copy `bodywork.sql` and the whole `media/` folder to the NAS, then, with the app stopped:

```bash
psql -U payload -d bodywork -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U payload -d bodywork -f bodywork.sql
```

`media/` goes into the `media` dataset, and gets chowned to 1000:1000 afterwards.

**Then stamp the migration.** The dump came from a database that dev mode pushed a schema
into, so its tables exist but no migration is recorded against them. Without this the
next start tries to create them a second time:

```sql
INSERT INTO payload_migrations (name, batch) VALUES ('20260901_160631', 1);
```

Start the app and read the log. A clean boot means the dump and the migration agree. A
missing-column error means the dev database had drifted from the schema in the repo, and
the honest fix is to regenerate the migration from it, not to patch by hand.

## 4. Reverse proxy

Three proxy hosts in Nginx Proxy Manager, all forwarding to the NAS address on port
`30080`, all with websockets on and a request body cap raised past the default `1m` so
media uploads are not cut off:

| Host | Access list |
|---|---|
| `bodywork.czekanski.dev` | the demo password |
| `centrum.bodywork.czekanski.dev` | the demo password |
| `admin.bodywork.czekanski.dev` | **none** |

The admin host is deliberately outside the password gate. Payload has its own login, and
stacking basic auth on top means two prompts for the person you are demoing to.

In Cloudflare, the tunnel routes all three to Nginx Proxy Manager, and `admin.` gets a
cache rule of Bypass. The free plan caps request bodies at 100 MB, which is the real
ceiling on uploads regardless of what Nginx allows.

## 5. First login

`https://admin.bodywork.czekanski.dev` shows the create-first-user screen only while the
`users` table is empty. Restoring a dump usually means it is not, so log in with an
account that already exists instead.

## Updating to the latest version

1. Merge to `main`, then Actions -> release -> Run workflow.
2. On the NAS: Apps -> bodywork -> Edit -> Update image, or pull `:latest` and recreate.

The entrypoint migrates on every start, so a schema change in the new build applies
itself. `pnpm migrate` is a no-op once every migration is recorded, which is what makes
that safe to run unconditionally.

Content and uploads live in the datasets, not the image, so they survive the swap.

## Gotchas

- **`RUN_MIGRATIONS=false`** exists for exactly one situation: a restored dump that has
  not been stamped yet. Leave it `true` otherwise, or the demo silently runs against a
  schema older than the code.
- **The build needs Google Fonts.** `next/font/google` fetches Plus Jakarta Sans at build
  time and self-hosts it afterwards, so a network that blocks `fonts.googleapis.com`
  fails the image build with no other symptom.
- **Editors do not see changes instantly.** CMS pages carry a 60 second window until
  on-demand revalidation lands ([`../map/page-builder.md`](../map/page-builder.md)), and
  the blog stays on its hour. Do not promise the client a live refresh.
- **One host serves every public name.** Host-based site routing is not built, so
  `centrum.` and the apex serve the same Centrum site. Fine for a demo, worth saying out
  loud before someone reads it as the finished hub.
- **Never point this app at the production database.** It is a demo, and the entrypoint
  migrates whatever it is given.

## Related

[`create-migrations.md`](./create-migrations.md) - [`../map/infra.md`](../map/infra.md)
