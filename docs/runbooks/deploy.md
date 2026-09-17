> Read when: putting a build on the VPS, or checking what is actually running there.

# Runbook: deploy to the VPS

There is no deploy automation in this repo and this runbook does not invent one. It states what
has to be true after a release and how to prove it, whatever moves the files.

The transfer step is deliberately left open: `git pull` and build on the server, or build locally
and copy `.next`. Everything else applies either way.

> **Every command here is written as `node scripts/...`, not `pnpm <script>`, on purpose.**
> `packageManager` pins pnpm 11.17, which needs Node 22.13, and the machine holding the content
> runs 20.9, so every `pnpm` command dies before it reads a file. The `package.json` scripts exist
> and are the nicer spelling once Node moves; until then they are a command that cannot run, which
> in a runbook is worse than no command at all. Same reason `next` is invoked through `node` below.
> Upgrading Node fixes this, `pnpm install`, `pnpm test` and the embla lockfile mismatch in one go.

## Content and media do not travel with the code

**A deploy moves the app. It does not move the blog.** Both of these are gitignored, so no `git
pull` and no build will ever produce them on the server:

- `/media` (1216 files, 55 MB here): every upload. `media` rows in the database point at files that
  simply are not there otherwise.
- `scripts/scrape/scraped/`: the source `import-blog.ts` reads, which is why re-running the import
  on the server is not a fallback.

The 62 blog posts live in a **database**, not in the repo. If the server's database does not have
them, they are not missing from the deploy, they were never there.

How to tell in one request, because it queries Payload live rather than reading the build:

```bash
curl -sS -u '<user>:<pass>' https://demo.n02b3rt.pl/api/posts?limit=0 | grep -o '"totalDocs":[0-9]*'
```

`"totalDocs":0` means the database is empty and no amount of rebuilding will change it. A build run
on a machine that **does** have the content bakes 62 posts into static HTML, which then looks
correct until something rebuilds on the server. `/feed.xml` and `/api/*` tell the truth either way.

To move it, from the machine that has the content:

```bash
node scripts/backup-content.mjs                       # here: database, /media, a manifest
scp -r ../backups/<stamp> <user>@<host>:/tmp/         # across
I_MEAN_IT=1 node scripts/restore-content.mjs /tmp/<stamp>   # there
```

The restore checks every row count against the manifest and exits non-zero if one disagrees, so a
half-landed restore is loud rather than something you find out about from the blog. It refuses to
run without `I_MEAN_IT=1`, because the dump carries `--clean --if-exists` and drops the tables it
is about to recreate.

**Rebuild afterwards.** The blog is statically generated, so the pages still hold whatever the
database looked like when they were last built.

⚠ **There are no migrations, so a dump is currently the only way to produce the schema and the
content in one step.** That makes these backups load-bearing rather than a nicety, and it is why
`create-migrations.md` is worth doing.

## Before anything moves

**1. The lockfile.** `package.json` currently declares `embla-carousel-react` and
`embla-carousel-autoplay` and nothing imports them. Finish that on a machine with Node 22.13 or
newer, or leave both alone:

```bash
pnpm remove embla-carousel-react embla-carousel-autoplay
```

Removing them from `package.json` **without** running `pnpm install` breaks CI's
`--frozen-lockfile`. That already happened once.

**2. `public/videos/` has to travel.** The hero video encodes are binary files tracked in git, and
the last release added two of them (`hero-md.webm`, `hero-md.mp4`). A transfer with excludes, or a
build from a checkout that skipped LFS-ish assets, silently leaves the old 736 KB phone encode in
place. It is the single biggest item on the homepage's LCP.

## Build through the cache-preserving script, not plain `next build`

```bash
NEXT_CACHE_DIR=/var/cache/bodywork-next node scripts/build-with-cache.mjs
```

That is the whole of it. The script copies the cache in before the build and back out after, and
prints its size both times, so a release that loses it says so in the log instead of showing up as
a slow site three days later.

**Why it matters.** `/_next/image` encodes on demand and caches under `.next/cache/images`. A cold
entry costs up to 1.5 s of server time for one image at one width, and the visitor spends it
looking at a blur placeholder ([`../performance.md`](../performance.md)). Next keeps that cache
between builds in the same directory, so building in place was always fine. The moment a deploy
builds into a fresh release directory, a container layer or a CI workspace, it starts empty and
every visitor pays again.

`NEXT_CACHE_DIR` has to be an absolute path **outside** whatever the deploy replaces. The script
refuses to run without it rather than guessing.

If for some reason the build cannot go through this script, the warm step below stops being a
one-off and becomes part of every release.

## After the build is live

```bash
# Both formats, only the widths a real device can land on. About 13 minutes.
USER_NAME=klient PASS=<password> node scripts/warm-image-cache.mjs https://demo.n02b3rt.pl
```

Run it a second time. Every response should come back `HIT` and the slowest should be tens of
milliseconds. If it is still reporting cold entries, the cache is not surviving whatever the first
run wrote it to.

## Verify, in order of how badly it bites

```bash
B=https://demo.n02b3rt.pl; A='-u klient:<password>'

# 1. The new phone video shipped. Want ~372000, not ~750000.
curl -sS -I --max-time 30 $A "$B/videos/hero-sm.webm" | grep -i content-length
# 2. The middle rung exists at all. Want 200, not 404.
curl -sS -o /dev/null -w '%{http_code}\n' --max-time 30 $A "$B/videos/hero-md.webm"
# 3. Images are warm. Want a HIT and tens of ms.
curl -sS -D - -o /dev/null --max-time 60 $A -H 'Accept: image/avif,image/webp,*/*' \
  "$B/_next/image?url=%2Fimages%2Fmasaz%2Fhero.webp&w=1920&q=75" | grep -i x-nextjs-cache
# 4. Brotli. Send what a browser sends, not `br` alone. Want: br
curl -sS -D - -o /dev/null --max-time 30 $A -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  "$B/" | grep -i content-encoding
# 5. HTTP/2. Want: h2. Still outstanding.
echo | openssl s_client -alpn h2,http/1.1 -connect demo.n02b3rt.pl:443 \
  -servername demo.n02b3rt.pl 2>/dev/null | grep -i ALPN
```

Checks 1 to 3 are what a release is responsible for. Check 4 passes today. Check 5 is the one thing
still not done, and Lighthouse prices it at 1390 ms on its own:
[`apache-http2-brotli.md`](./apache-http2-brotli.md).

## Measuring afterwards

Lighthouse **in incognito**, or the number is meaningless. A run with the usual extensions loaded
carries over a megabyte of their JavaScript and about a second of their CPU, which lands squarely
on the metric this site is short on.

## Related

[`../performance.md`](../performance.md) · [`apache-http2-brotli.md`](./apache-http2-brotli.md) ·
[`create-migrations.md`](./create-migrations.md) · [`../map/infra/deployment.md`](../map/infra/deployment.md)
