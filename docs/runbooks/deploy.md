> Read when: putting a build on the VPS, or checking what is actually running there.

# Runbook: deploy to the VPS

There is no deploy automation in this repo and this runbook does not invent one. It states what
has to be true after a release and how to prove it, whatever moves the files.

The transfer step is deliberately left open: `git pull` and build on the server, or build locally
and copy `.next`. Everything else applies either way.

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

## The one that is easy to get wrong

**Carry `.next/cache` across releases.**

`/_next/image` encodes on demand and caches under `.next/cache/images`. A cold entry costs up to
1.5 s of server time per image per width (numbers in [`../performance.md`](../performance.md)). A
deploy that builds into a clean directory throws that away, and the next visitor to every page pays
for it again while a blur placeholder sits on screen.

If the deploy cannot preserve it, the warm step below stops being a one-off and becomes part of
every release.

## After the build is live

```bash
# Both formats, only the widths a real device can land on. About 13 minutes.
USER_NAME=klient PASS=<password> pnpm warm:images https://demo.n02b3rt.pl
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
[`create-migrations.md`](./create-migrations.md) · [`../map/infra.md`](../map/infra.md)
