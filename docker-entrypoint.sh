#!/bin/sh
# Bring the database up to the code's schema, then hand over to the server.
#
# Payload applies migrations only when asked, and an image is often newer than the
# database it meets, so this runs on every start. `payload migrate` is a no-op once
# every migration in src/migrations/ is recorded in payload_migrations, which is what
# makes it safe to run unconditionally.
#
# RUN_MIGRATIONS=false skips it. The one case that needs that: a database restored from
# a dump taken before migrations existed. Its tables are already there but no migration
# is recorded, so migrating would try to create them a second time. Stamp it instead,
# see docs/runbooks/deploy-demo.md.
set -e

APP_UID="$(id -u node)"
APP_GID="$(id -g node)"

# First pass, as root: take the mounted paths, then drop privileges and re-enter.
# `exec` keeps the server as PID 1, so signals from `docker stop` still reach it.
if [ "$(id -u)" = "0" ]; then
  chown "$APP_UID:$APP_GID" /app/media /app/.data 2>/dev/null || true
  exec setpriv --reuid="$APP_UID" --regid="$APP_GID" --init-groups "$0" "$@"
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "entrypoint: applying migrations"
  node_modules/.bin/payload migrate
else
  echo "entrypoint: RUN_MIGRATIONS=false, skipping migrations"
fi

exec "$@"
