# syntax=docker/dockerfile:1.7

# BODYWORK, one image serving every host. Routing is by request Host, see src/proxy.ts.
#
# Debian slim rather than Alpine on purpose: `sharp` and the `@ffmpeg-installer` binary
# are both glibc builds, and chasing musl variants of them buys nothing here.
#
# The build stage runs a throwaway Postgres of its own, migrates it, and builds against
# it. That is not decoration: `next build` reaches Payload to collect page data, so it
# needs a database with the schema in it. Doing it here keeps `docker build .` working
# on any machine, with no service container to wire up, and the database is thrown away
# with the stage. Note that the schema can only come from `src/migrations/`: the adapter
# gates its dev-mode push on NODE_ENV, so a production build cannot push.

ARG NODE_VERSION=22-bookworm-slim

# ---------------------------------------------------------------- dependencies
FROM node:${NODE_VERSION} AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------------------------------------------- build
FROM node:${NODE_VERSION} AS builder
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql \
 && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile-time only. Nothing here reaches the running image: the secret is a literal so
# the build stays reproducible, and the database dies with the stage.
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_SECRET=build-time-only-not-a-runtime-secret
ENV DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/bodywork

RUN set -eux; \
    cluster="$(ls /etc/postgresql)"; \
    pg_ctlcluster "$cluster" main start; \
    su postgres -c "psql -q -c \"ALTER USER postgres PASSWORD 'postgres'\""; \
    su postgres -c "createdb bodywork"; \
    pnpm migrate; \
    NODE_ENV=production pnpm build; \
    pg_ctlcluster "$cluster" main stop

# ------------------------------------------------------- runtime dependencies
FROM node:${NODE_VERSION} AS prod-deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# -------------------------------------------------------------------- runtime
#
# No pnpm here on purpose. Corepack fetches the pinned pnpm on first use, which as the
# unprivileged `node` user would mean a network round trip on every cold start and a
# write to a root-owned cache. The two binaries this image actually runs are already in
# node_modules, so it calls them directly and the container needs no network to boot.
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--no-deprecation
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TZ=Europe/Warsaw

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/src ./src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml next.config.ts tsconfig.json postcss.config.mjs ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Payload writes uploads under the working directory, and the admin's package-updates
# view caches into .data. Declared so a container still starts when the host forgets to
# mount them; a real deployment mounts over both.
RUN mkdir -p /app/media /app/.data && chown -R node:node /app/media /app/.data

# `.next` has to be writable by the same user, and not only `.next/cache`: ISR writes the
# rendered page back to `.next/server/app/...`. Arriving root-owned from the COPY above,
# it leaves every revalidation failing with EACCES while the page still answers 200, so
# the site keeps serving its build-time content and nothing looks wrong from outside.
RUN chown -R node:node /app/.next

USER node
EXPOSE 3000

# Payload boots lazily, so a real request is the only honest readiness signal.
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/pl').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node_modules/.bin/next", "start"]
