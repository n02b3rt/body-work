> Read when: shipping a build, changing the Docker image or the release workflow, or adding a schema change that has to reach another environment.

# Deployment

Two targets, and they are not the same machine.

- **The client demo**, self-hosted on TrueNAS, not the Hetzner target in
  [`../../stack.md`](../../stack.md). `Dockerfile` builds it, standing up a throwaway Postgres of
  its own because `next build` reaches Payload for page data; `.dockerignore` trims the context and
  `docker-entrypoint.sh` migrates before starting the server.
  `.github/workflows/release.yml` publishes the image to GHCR, by hand or on a `v*` tag.
  `deploy/truenas/docker-compose.yml` is the app definition, with Nginx Proxy Manager in front.
  Procedure, content import and the update path: [`../../runbooks/deploy-demo.md`](../../runbooks/deploy-demo.md).
- **The VPS**, served through Apache: [`../../runbooks/deploy.md`](../../runbooks/deploy.md),
  including why `.next/cache` must survive a release, and
  [`../../runbooks/apache-http2-brotli.md`](../../runbooks/apache-http2-brotli.md) for the parts
  the proxy owns.

## Gotchas

- ⚠ **A schema change without a migration breaks every environment but yours.** `src/migrations/`
  now shapes an empty database, which is what lets CI build and a container start. The dev-mode push
  cannot cover for a missing one: the adapter gates it on `NODE_ENV` before reading the `push`
  option, so there is no flag that makes production push. Procedure:
  [`../../runbooks/create-migrations.md`](../../runbooks/create-migrations.md).
- ⚠ **`next/font/google` fetches its font at build time.** An image build on a network that blocks
  `fonts.googleapis.com` fails there and nowhere else. The font is self-hosted afterwards.

## Related

[`index.md`](./index.md) · [`scripts.md`](./scripts.md) · [`../../architecture.md`](../../architecture.md)
