> Read when: the site is served over HTTP/1.1 or without brotli, or Lighthouse reports "Modern HTTP".

# Apache: HTTP/2 and brotli

Measured on `demo.n02b3rt.pl`, 3 August 2026: TLS ALPN offered only `http/1.1`, and a request
carrying `Accept-Encoding: br` came back uncompressed at 168 KB. Lighthouse priced the missing
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

## 3. Brotli, and the half of it that is in this repo

**Enabling `mod_brotli` on its own will do nothing, and will look like it worked.**

Next compresses its own responses: `compress` defaults to `true`, so Node hands Apache a body that
already carries `Content-Encoding: gzip`, and Apache will not recompress an encoded response.
Verified locally against `next start`, with no proxy in front: `Content-Encoding: gzip` comes back
on a bare request.

So the two changes ship together, or neither works:

1. In `next.config.ts`, hand compression over to the proxy:

   ```ts
   compress: false,
   ```

2. Only then, on the server:

```bash
sudo a2enmod brotli
```

Doing step 1 without step 2 ships **uncompressed HTML and JavaScript**, which is far worse than the
gzip we have now. Sequence it as: configure and reload Apache first, confirm with the `curl` in
step 4 that a plain request still comes back gzipped by Apache, then deploy the `compress: false`
build and confirm it comes back `br`.

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
curl -sS -D - -o /dev/null -H 'Accept-Encoding: br' -u '<user>:<pass>' \
  https://demo.n02b3rt.pl/ | grep -i content-encoding
```

A `HEAD` request is not a test: Apache skips compression on it, so `curl -I` reports no
`Content-Encoding` even when the filter is working. Use `-D - -o /dev/null` as above.

## Not a problem, do not fix

The demo host sends `X-Robots-Tag: noindex, nofollow, noarchive`. That is what holds Lighthouse's
SEO score at 69, and it is correct for a client preview. On the production domain the audit passes
on its own.

## Related

[`../performance.md`](../performance.md) · [`../map/infra.md`](../map/infra.md)
