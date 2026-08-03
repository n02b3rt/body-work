> Read when: the site is served over HTTP/1.1 or without brotli, or Lighthouse reports "Modern HTTP".

# Apache: HTTP/2 and brotli

Measured on `demo.n02b3rt.pl`, 3 August 2026: TLS ALPN offered only `http/1.1`. Brotli has
since been enabled and works; HTTP/2 has not. Lighthouse priced the missing
HTTP/2 at **1390 ms**, its single largest line. Both are server configuration; nothing in this repo
can reach them.

Run these on the VPS. Nothing here touches the application.

## 1. Find out what is available

```bash
apachectl -v
apachectl -M | grep -E 'http2|brotli|deflate|proxy'
```

`mod_http2` is a server-level module: it cannot be turned on from `.htaccess`. `mod_brotli` can.
If this is managed hosting with no access to the vhost, HTTP/2 is out of reach and only step 3
applies.

## 2. HTTP/2

```bash
sudo a2enmod http2
```

Then, in the SSL vhost:

```apache
Protocols h2 http/1.1
```

```bash
sudo apachectl configtest && sudo systemctl reload apache2
```

**HTTP/2 matters more here than the byte count does.** The page loads 16 JS and CSS files, 2 fonts
and its images from one host. On HTTP/1.1 that is six connections and a queue, and the LCP image
waits in it.

## 3. Brotli: done, 3 August 2026

Working on `demo.n02b3rt.pl`, measured with a realistic browser `Accept-Encoding`:

```
gzip, deflate, br, zstd  ->  Content-Encoding: br    19 940 bytes
gzip                     ->  Content-Encoding: gzip  27 967 bytes
```

29% off the HTML. Nothing in this repo had to change for it.

**An earlier version of this runbook claimed `compress: false` was required in `next.config.ts`,
and that was wrong.** The reasoning looked sound: Next compresses its own responses (`compress`
defaults to true) and Apache will not recompress an encoded body, which is exactly what happens
locally against a bare `next start`. Behind this proxy it does not, and brotli wins. Leave
`compress` alone.

If brotli ever stops appearing, Next's own gzip is still the first thing to suspect, and
`compress: false` is the thing to try. It is a fix to reach for on evidence, not a prerequisite.

```bash
sudo a2enmod brotli
```

```apache
AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/plain text/xml \
  application/javascript application/json image/svg+xml
BrotliCompressionQuality 5
```

Quality 5, not the default 11: 11 is for files compressed once and stored, and these responses come
off a proxy on every request.

```apache
AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/plain text/xml \
  application/javascript application/json image/svg+xml
BrotliCompressionQuality 5
```

Quality 5, not the default 11: 11 is for files compressed once and stored, and these responses come
off a proxy on every request. 5 is roughly gzip's cost for meaningfully better output.

Gzip already works, so this is an improvement on ~217 KB of JS and ~27 KB of HTML, not a fix for
something broken. Expect roughly 20% off both.

## 4. Verify

```bash
# must print: ALPN protocol: h2
echo | openssl s_client -alpn h2,http/1.1 -connect demo.n02b3rt.pl:443 \
  -servername demo.n02b3rt.pl 2>/dev/null | grep -i ALPN

# must print: content-encoding: br
curl -sS -D - -o /dev/null -H 'Accept-Encoding: gzip, deflate, br, zstd' -u '<user>:<pass>' \
  https://demo.n02b3rt.pl/ | grep -i content-encoding
```

Two ways to fool yourself here, both of which I did:

**A `HEAD` request is not a test.** Apache skips compression on it, so `curl -I` reports no
`Content-Encoding` even when the filter is working. Use `-D - -o /dev/null`.

**`Accept-Encoding: br` on its own is not a test either.** Next only speaks gzip, so with `br`
alone it stops compressing and the proxy takes over, which can make a broken setup look fine and a
working one look like it needs `compress: false`. Send the full list a browser sends.

## Not a problem, do not fix

The demo host sends `X-Robots-Tag: noindex, nofollow, noarchive`. That is what holds Lighthouse's
SEO score at 69, and it is correct for a client preview. On the production domain the audit passes
on its own.

## Related

[`../performance.md`](../performance.md) · [`../map/infra.md`](../map/infra.md)
