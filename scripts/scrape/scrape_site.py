#!/usr/bin/env python3
"""
Mirror BodyWork site from sitemap.xml into a clean local tree.

IMPORTANT: HTML is saved RAW (no BeautifulSoup re-serialize). This site uses
utility class names with '<' (e.g. parent<--scroll:o00) that BS breaks.

Layout (URL paths preserved so a local HTTP server works):

  scraped/
    assets/...              # /assets/css, fonts, js, images
    content/...             # CMS media
    kontakt/index.html
    kontakt/media/          # gallery copy of page images
    fizjoterapia/rehabilitacja-ruchowa/index.html
    home/index.html         # homepage (/) also mirrored as home/
    index.html              # homepage at site root for http.server
    _meta/manifest.json

Preview:
  py -3.13 -m http.server 8765 --directory scraped
  open http://localhost:8765/kontakt/
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from urllib.parse import urljoin, urlparse, unquote, urldefrag

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Brak zaleznosci. Zainstaluj:")
    print("  py -3.13 -m pip install -r requirements-scrape.txt")
    sys.exit(1)


DEFAULT_BASE = "https://bodywork.testowe.eu"
DEFAULT_SITEMAP = "sitemap.xml"
DEFAULT_OUT = "scraped"
DEFAULT_PAGE_DELAY = 1.0
DEFAULT_ASSET_DELAY = 0.35
USER_AGENT = (
    "BodyWorkMirrorBot/1.1 (+local archive for Next.js rewrite; contact: local)"
)

MEDIA_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico",
    ".bmp", ".tif", ".tiff",
    ".mp4", ".webm", ".ogg", ".mov", ".m4v", ".MP4",
    ".mp3", ".wav", ".m4a",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
}
STYLE_EXT = {".css"}
SCRIPT_EXT = {".js", ".mjs"}
DOC_EXT = {".html", ".htm", ".pdf", ".xml", ".json", ".webmanifest", ".txt"}
IMAGE_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico", ".bmp"}

CSS_URL_RE = re.compile(
    r"""url\(\s*(['"]?)(?!data:)([^)'"]+)\1\s*\)""",
    re.IGNORECASE,
)
SRCSET_PART_RE = re.compile(r"^(\S+)(?:\s+([\d.]+)([wx]))?$", re.IGNORECASE)
IMPORT_RE = re.compile(
    r"""@import\s+(?:url\()?['"]?([^'")\s]+)['"]?\)?""",
    re.IGNORECASE,
)
WIDTH_SUFFIX_RE = re.compile(r"-(\d+)w(\.[a-z0-9]+)$", re.IGNORECASE)

# attrs we rewrite only via regex on the raw HTML (no BS serialize)
ATTR_URL_RE = re.compile(
    r"""\b(src|href|poster|data-src|data-lazy-src|data-bg|data-background|data-background-image|data-original)=([\"'])([^\"']+)\2""",
    re.IGNORECASE,
)
SRCSET_ATTR_RE = re.compile(
    r"""\b(srcset|data-srcset)=([\"'])([^\"']+)\2""",
    re.IGNORECASE,
)


@dataclass
class Stats:
    pages: int = 0
    assets: int = 0
    skipped: int = 0
    errors: int = 0
    bytes: int = 0


@dataclass
class MirrorState:
    base_netloc: str
    out_dir: Path
    meta_dir: Path
    page_delay: float
    asset_delay: float
    session: requests.Session
    srcset_mode: str = "largest"
    prefer_webp: bool = True
    rewrite_html_urls: bool = True  # relative paths so file:// AND http.server work
    stats: Stats = field(default_factory=Stats)
    downloaded: dict[str, str] = field(default_factory=dict)
    failed: set[str] = field(default_factory=set)
    page_media: dict[str, list[str]] = field(default_factory=dict)
    last_request_at: float = 0.0
    dry_run: bool = False

    def wait_rate_limit(self, *, is_page: bool) -> None:
        delay = self.page_delay if is_page else self.asset_delay
        if delay <= 0:
            return
        elapsed = time.monotonic() - self.last_request_at
        if elapsed < delay:
            time.sleep(delay - elapsed)

    def get(self, url: str, *, is_page: bool = False) -> requests.Response | None:
        url = canonicalize_url(url)
        key = strip_query(url)
        if key in self.failed:
            self.stats.skipped += 1
            return None

        self.wait_rate_limit(is_page=is_page)
        self.last_request_at = time.monotonic()
        try:
            resp = self.session.get(url, timeout=60, allow_redirects=True)
            if resp.status_code >= 400:
                self.failed.add(key)
                self.log_error(f"HTTP {resp.status_code}  {url}")
                self.stats.errors += 1
                return None
            return resp
        except requests.RequestException as exc:
            self.failed.add(key)
            self.log_error(f"{exc.__class__.__name__}: {exc}  ({url})")
            self.stats.errors += 1
            return None

    def log_error(self, msg: str) -> None:
        print(f"  ! {msg}", file=sys.stderr)
        err_file = self.meta_dir / "errors.log"
        err_file.parent.mkdir(parents=True, exist_ok=True)
        with err_file.open("a", encoding="utf-8") as f:
            f.write(msg + "\n")

    def save_manifest(self) -> None:
        payload = {
            "downloaded": self.downloaded,
            "failed": sorted(self.failed),
            "page_media": self.page_media,
            "stats": self.stats.__dict__,
        }
        path = self.meta_dir / "manifest.json"
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def canonicalize_url(url: str) -> str:
    url, _ = urldefrag(url.strip())
    return url


def is_same_site(url: str, base_netloc: str) -> bool:
    parsed = urlparse(url)
    if not parsed.netloc:
        return True
    return parsed.netloc.lower() == base_netloc.lower()


def strip_query(url: str) -> str:
    p = urlparse(url)
    return p._replace(query="", fragment="").geturl()


def guess_filename(url: str, content_type: str | None = None) -> str:
    path = unquote(urlparse(strip_query(url)).path)
    name = PurePosixPath(path).name
    if name and "." in name:
        return name
    ext = mimetypes.guess_extension((content_type or "").split(";")[0].strip()) or ""
    if not name:
        name = "file"
    if ext and not name.endswith(ext):
        name += ext
    return name or "file.bin"


def url_to_page_dir(url: str, out_dir: Path, base: str) -> Path:
    base_path = urlparse(base).path.rstrip("/") or ""
    path = urlparse(url).path
    if base_path and path.startswith(base_path):
        path = path[len(base_path) :] or "/"
    path = unquote(path)
    if path in ("", "/"):
        return out_dir / "home"
    parts = [p for p in path.strip("/").split("/") if p]
    return out_dir.joinpath(*parts)


def local_path_for_asset(url: str, out_dir: Path, base: str) -> Path:
    """Map https://host/assets/x.css -> scraped/assets/x.css"""
    path = unquote(urlparse(strip_query(url)).path)
    base_path = urlparse(base).path.rstrip("/") or ""
    if base_path and path.startswith(base_path):
        path = path[len(base_path) :] or "/"
    path = path.lstrip("/")
    if not path or path.endswith("/"):
        digest = hashlib.sha1(url.encode()).hexdigest()[:10]
        return out_dir / "_orphan" / f"file_{digest}"
    return out_dir.joinpath(*path.split("/"))


def is_media_url(url: str) -> bool:
    ext = Path(urlparse(strip_query(url)).path).suffix.lower()
    return ext in {e.lower() for e in MEDIA_EXT}


def is_image_url(url: str) -> bool:
    ext = Path(urlparse(strip_query(url)).path).suffix.lower()
    return ext in IMAGE_EXT


def is_downloadable_asset(url: str) -> bool:
    if url.startswith(("data:", "mailto:", "tel:", "javascript:", "#")):
        return False
    path = urlparse(strip_query(url)).path.lower()
    ext = Path(path).suffix.lower()
    if ext in {e.lower() for e in MEDIA_EXT} | STYLE_EXT | SCRIPT_EXT | DOC_EXT:
        return True
    if any(x in path for x in ("/assets/", "/uploads/", "/media/", "/content/")):
        return True
    return False


def unique_media_name(page_media_dir: Path, filename: str, url: str) -> Path:
    target = page_media_dir / filename
    if not target.exists():
        return target
    stem, suffix = Path(filename).stem, Path(filename).suffix
    digest = hashlib.sha1(strip_query(url).encode()).hexdigest()[:8]
    return page_media_dir / f"{stem}__{digest}{suffix}"


def is_gallery_candidate(url: str) -> bool:
    name = PurePosixPath(urlparse(strip_query(url)).path).name
    if WIDTH_SUFFIX_RE.search(name):
        return False
    ext = Path(name).suffix.lower()
    return ext in IMAGE_EXT | {".mp4", ".webm", ".mov"}


def parse_srcset(value: str) -> list[tuple[str, float]]:
    items: list[tuple[str, float]] = []
    for part in value.split(","):
        part = part.strip()
        if not part:
            continue
        m = SRCSET_PART_RE.match(part)
        if not m:
            continue
        u, num, unit = m.group(1), m.group(2), m.group(3)
        score = float(num) if num else 0.0
        if unit and unit.lower() == "x":
            score *= 10000
        items.append((u, score))
    return items


def pick_from_srcset(value: str, mode: str) -> list[str]:
    items = parse_srcset(value)
    if not items:
        return []
    if mode == "all":
        return [u for u, _ in items]
    best = max(items, key=lambda it: (it[1], items.index(it)))
    if best[1] == 0:
        return [items[-1][0]]
    return [best[0]]


def prefer_webp_filter(urls: set[str]) -> set[str]:
    by_stem: dict[str, set[str]] = {}
    for u in urls:
        path = urlparse(strip_query(u)).path
        stem, ext = os.path.splitext(path)
        by_stem.setdefault(stem.lower(), set()).add(ext.lower())

    drop_exts = {".png", ".jpg", ".jpeg"}
    out: set[str] = set()
    for u in urls:
        path = urlparse(strip_query(u)).path
        stem, ext = os.path.splitext(path)
        ext_l = ext.lower()
        twins = by_stem.get(stem.lower(), set())
        if ext_l in drop_exts and ".webp" in twins:
            continue
        out.add(u)
    return out


def load_sitemap_urls(sitemap_path: Path, base: str) -> list[str]:
    text = sitemap_path.read_text(encoding="utf-8", errors="replace")
    text = re.sub(r'\sxmlns="[^"]+"', "", text, count=1)
    root = ET.fromstring(text)
    urls: list[str] = []
    for loc in root.iter("loc"):
        if loc.text:
            u = loc.text.strip()
            if is_same_site(u, urlparse(base).netloc):
                urls.append(u)
    seen: set[str] = set()
    ordered: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


def extract_urls_from_html(html: str, page_url: str, srcset_mode: str) -> set[str]:
    """Parse-only with BS — never serialize back."""
    soup = BeautifulSoup(html, "lxml")
    found: set[str] = set()

    def add(raw: str | None) -> None:
        if not raw:
            return
        raw = raw.strip()
        if not raw or raw.startswith(("data:", "mailto:", "tel:", "javascript:", "#")):
            return
        found.add(canonicalize_url(urljoin(page_url, raw)))

    for tag in soup.find_all(True):
        for attr in (
            "src", "href", "poster", "data-src", "data-lazy-src",
            "data-bg", "data-background", "data-background-image",
            "data-original", "content",
        ):
            val = tag.get(attr)
            if not val or not isinstance(val, str):
                continue
            if attr == "content":
                name = (tag.get("property") or tag.get("name") or "").lower()
                if not any(k in name for k in ("image", "icon", "thumbnail")):
                    continue
            if attr == "href":
                abs_u = canonicalize_url(urljoin(page_url, val))
                if not is_downloadable_asset(abs_u):
                    continue
            add(val)

        for attr in ("srcset", "data-srcset"):
            val = tag.get(attr)
            if val and isinstance(val, str):
                for u in pick_from_srcset(val, srcset_mode):
                    add(u)

        style = tag.get("style")
        if style and isinstance(style, str):
            for m in CSS_URL_RE.finditer(style):
                add(m.group(2))

    for style_tag in soup.find_all("style"):
        text = style_tag.string or style_tag.get_text() or ""
        for m in CSS_URL_RE.finditer(text):
            add(m.group(2))
        for m in IMPORT_RE.finditer(text):
            add(m.group(1))

    return found


def extract_urls_from_css(css_text: str, css_url: str) -> set[str]:
    found: set[str] = set()
    for m in CSS_URL_RE.finditer(css_text):
        raw = m.group(2).strip()
        if raw and not raw.startswith("data:"):
            found.add(canonicalize_url(urljoin(css_url, raw)))
    for m in IMPORT_RE.finditer(css_text):
        raw = m.group(1).strip()
        if raw and not raw.startswith("data:"):
            found.add(canonicalize_url(urljoin(css_url, raw)))
    return found


def write_bytes(path: Path, data: bytes, dry_run: bool) -> None:
    if dry_run:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def write_text(path: Path, text: str, dry_run: bool) -> None:
    if dry_run:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def download_asset(state: MirrorState, url: str, base: str) -> Path | None:
    url = canonicalize_url(url)
    if not is_same_site(url, state.base_netloc):
        return None
    if not is_downloadable_asset(url):
        return None

    key = strip_query(url)
    if key in state.failed:
        state.stats.skipped += 1
        return None
    if key in state.downloaded:
        state.stats.skipped += 1
        return state.out_dir / state.downloaded[key]

    dest = local_path_for_asset(url, state.out_dir, base)
    if dest.exists() and dest.is_file():
        rel = dest.relative_to(state.out_dir).as_posix()
        state.downloaded[key] = rel
        state.stats.skipped += 1
        return dest

    short = url if len(url) < 110 else url[:107] + "..."
    print(f"    asset  {short}")
    resp = state.get(url, is_page=False)
    if resp is None:
        return None

    data = resp.content
    if dest.suffix == "" and resp.headers.get("Content-Type"):
        guess = guess_filename(url, resp.headers.get("Content-Type"))
        if Path(guess).suffix:
            dest = dest.with_name(dest.name + Path(guess).suffix)

    write_bytes(dest, data, state.dry_run)
    state.stats.assets += 1
    state.stats.bytes += len(data)
    rel = dest.relative_to(state.out_dir).as_posix()
    state.downloaded[key] = rel

    ctype = (resp.headers.get("Content-Type") or "").lower()
    if dest.suffix.lower() == ".css" or "text/css" in ctype:
        css_text = data.decode(resp.encoding or "utf-8", errors="replace")
        for nested_url in extract_urls_from_css(css_text, url):
            if is_same_site(nested_url, state.base_netloc) and is_downloadable_asset(nested_url):
                download_asset(state, nested_url, base)

    return dest


def copy_media_into_page(
    state: MirrorState,
    asset_url: str,
    shared_file: Path,
    page_dir: Path,
    page_key: str,
) -> None:
    if not is_gallery_candidate(asset_url):
        return
    if not shared_file.exists():
        return

    media_dir = page_dir / "media"
    filename = guess_filename(asset_url)
    filename = re.sub(r"[^\w.\-()+]+", "_", filename, flags=re.UNICODE) or "media.bin"
    dest = unique_media_name(media_dir, filename, asset_url)

    if not state.dry_run:
        media_dir.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            dest.write_bytes(shared_file.read_bytes())

    rel_media = f"media/{dest.name}"
    state.page_media.setdefault(page_key, [])
    if rel_media not in state.page_media[page_key]:
        state.page_media[page_key].append(rel_media)


def maybe_rewrite_html_urls(html: str, page_url: str, page_dir: Path, state: MirrorState) -> str:
    """Optional: rewrite absolute same-site asset URLs to relative paths.
    Default is OFF — keep /assets/... so http.server works like production.
    """
    if not state.rewrite_html_urls:
        return html

    def to_local(abs_url: str) -> str | None:
        key = strip_query(canonicalize_url(abs_url))
        rel = state.downloaded.get(key)
        if not rel:
            return None
        local = state.out_dir / rel
        try:
            return Path(os.path.relpath(local, start=page_dir)).as_posix()
        except ValueError:
            return None

    def repl_attr(m: re.Match[str]) -> str:
        attr, quote, val = m.group(1), m.group(2), m.group(3)
        if val.startswith(("data:", "mailto:", "tel:", "javascript:", "#", "http")):
            if val.startswith("http") and not is_same_site(val, state.base_netloc):
                return m.group(0)
        abs_u = canonicalize_url(urljoin(page_url, val))
        if not is_downloadable_asset(abs_u):
            return m.group(0)
        local = to_local(abs_u)
        if not local:
            return m.group(0)
        return f"{attr}={quote}{local}{quote}"

    def repl_srcset(m: re.Match[str]) -> str:
        attr, quote, val = m.group(1), m.group(2), m.group(3)
        parts_out = []
        for part in val.split(","):
            part = part.strip()
            if not part:
                continue
            bits = part.split()
            abs_u = canonicalize_url(urljoin(page_url, bits[0]))
            local = to_local(abs_u)
            if local:
                bits[0] = local
            parts_out.append(" ".join(bits))
        return f"{attr}={quote}{', '.join(parts_out)}{quote}"

    html = ATTR_URL_RE.sub(repl_attr, html)
    html = SRCSET_ATTR_RE.sub(repl_srcset, html)
    return html


def process_page(state: MirrorState, page_url: str, base: str, *, force: bool = False) -> None:
    page_url = canonicalize_url(page_url)
    page_dir = url_to_page_dir(page_url, state.out_dir, base)
    page_key = page_dir.relative_to(state.out_dir).as_posix()
    index_path = page_dir / "index.html"

    print(f"\n-> [{state.stats.pages + 1}] {page_url}")
    print(f"  folder: {page_dir}")

    if index_path.exists() and not force and not state.dry_run:
        print("  (juz jest index.html - pomijam; uzyj --force aby nadpisac)")
        state.stats.skipped += 1
        return

    resp = state.get(page_url, is_page=True)
    if resp is None:
        return

    # Keep original bytes decoded the way the server sent them
    html = resp.content.decode(resp.encoding or "utf-8", errors="replace")
    # Normalize only newlines for Windows editors; do NOT touch < in classes
    html = html.replace("\r\n", "\n").replace("\r", "\n")

    state.stats.pages += 1
    state.stats.bytes += len(html.encode("utf-8", errors="replace"))

    discovered = extract_urls_from_html(html, page_url, state.srcset_mode)
    if state.prefer_webp:
        images = {u for u in discovered if is_image_url(u)}
        other = discovered - images
        discovered = other | prefer_webp_filter(images)

    asset_urls = sorted(
        u for u in discovered
        if is_same_site(u, state.base_netloc) and is_downloadable_asset(u)
    )
    print(f"  assets na stronie: {len(asset_urls)}")

    for asset_url in asset_urls:
        local = download_asset(state, asset_url, base)
        if local is None:
            continue
        copy_media_into_page(state, asset_url, local, page_dir, page_key)

    html_out = maybe_rewrite_html_urls(html, page_url, page_dir, state)
    comment = (
        f"<!-- Archived from {page_url} by scrape_site.py "
        f"(raw HTML preserved). Preview via local http.server. -->\n"
    )
    if not html_out.lstrip().startswith("<!-- Archived"):
        html_out = comment + html_out

    write_text(index_path, html_out, state.dry_run)

    # Homepage also at site root so http://localhost:8765/ works
    if page_dir.name == "home" and page_dir.parent == state.out_dir:
        write_text(state.out_dir / "index.html", html_out, state.dry_run)

    meta = {
        "source_url": page_url,
        "media": state.page_media.get(page_key, []),
        "assets_linked": [strip_query(u) for u in asset_urls],
    }
    write_text(
        page_dir / "page.meta.json",
        json.dumps(meta, ensure_ascii=False, indent=2),
        state.dry_run,
    )


def build_session() -> requests.Session:
    s = requests.Session()
    s.headers.update(
        {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "pl-PL,pl;q=0.9,en;q=0.8",
        }
    )
    return s


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Pobiera strony z sitemap.xml do lokalnego mirroru (raw HTML)."
    )
    p.add_argument("--base", default=DEFAULT_BASE)
    p.add_argument("--sitemap", default=DEFAULT_SITEMAP)
    p.add_argument("--out", default=DEFAULT_OUT)
    p.add_argument("--delay", type=float, default=DEFAULT_PAGE_DELAY)
    p.add_argument("--asset-delay", type=float, default=DEFAULT_ASSET_DELAY)
    p.add_argument(
        "--srcset-mode",
        choices=("smart", "largest", "all"),
        default="smart",
    )
    p.add_argument("--no-prefer-webp", action="store_true")
    p.add_argument(
        "--no-rewrite-urls",
        action="store_true",
        help="Zostaw absolutne /assets/... (tylko pod http.server)",
    )
    p.add_argument("--limit", type=int, default=0)
    p.add_argument("--force", action="store_true")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--only", default="")
    return p.parse_args()


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    args = parse_args()
    base = args.base.rstrip("/") + "/"
    base_netloc = urlparse(base).netloc

    sitemap_path = Path(args.sitemap)
    if not sitemap_path.is_file():
        print(f"Brak sitemap: {sitemap_path.resolve()}")
        return 1

    out_dir = Path(args.out)
    meta_dir = out_dir / "_meta"
    if not args.dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)
        meta_dir.mkdir(parents=True, exist_ok=True)

    urls = load_sitemap_urls(sitemap_path, base)
    if args.only:
        urls = [u for u in urls if args.only in urlparse(u).path]
    if args.limit and args.limit > 0:
        urls = urls[: args.limit]

    mode = "largest" if args.srcset_mode == "smart" else args.srcset_mode

    print(f"Base:         {base}")
    print(f"Sitemap:      {sitemap_path} ({len(urls)} URL-i)")
    print(f"Output:       {out_dir.resolve()}")
    print(f"Page delay:   {args.delay}s")
    print(f"Asset delay:  {args.asset_delay}s")
    print(f"Srcset mode:  {args.srcset_mode} (-> {mode})")
    print(f"Prefer webp:  {not args.no_prefer_webp}")
    print(f"Rewrite URLs: {not args.no_rewrite_urls}")
    print(f"Force:        {args.force}")
    print("-" * 60)
    print("Preview:")
    print(f"  {out_dir}/home/index.html   (dziala tez file://)")
    print(f"  albo: py -3.13 -m http.server 8765 --directory {out_dir}")
    print("-" * 60)

    state = MirrorState(
        base_netloc=base_netloc,
        out_dir=out_dir,
        meta_dir=meta_dir,
        page_delay=args.delay,
        asset_delay=args.asset_delay,
        session=build_session(),
        srcset_mode=mode,
        prefer_webp=not args.no_prefer_webp,
        rewrite_html_urls=not args.no_rewrite_urls,
        dry_run=args.dry_run,
    )

    manifest_path = meta_dir / "manifest.json"
    if manifest_path.exists():
        try:
            prev = json.loads(manifest_path.read_text(encoding="utf-8"))
            state.downloaded.update(prev.get("downloaded") or {})
            # Remap old _shared/ paths from previous scraper version
            remapped = {}
            for k, v in state.downloaded.items():
                if isinstance(v, str) and v.startswith("_shared/"):
                    remapped[k] = v[len("_shared/") :]
                else:
                    remapped[k] = v
            state.downloaded = remapped
            state.failed.update(prev.get("failed") or [])
            state.page_media.update(prev.get("page_media") or {})
            print(f"Wznowienie: {len(state.downloaded)} assetow, {len(state.failed)} failed")
        except json.JSONDecodeError:
            pass

    # Also index existing files under assets/ and content/ for resume
    for folder in ("assets", "content"):
        root = out_dir / folder
        if root.is_dir():
            for f in root.rglob("*"):
                if f.is_file():
                    rel = f.relative_to(out_dir).as_posix()
                    fake_url = strip_query(urljoin(base, "/" + rel))
                    state.downloaded.setdefault(fake_url, rel)

    started = time.time()
    for i, page_url in enumerate(urls, 1):
        try:
            process_page(state, page_url, base, force=args.force)
        except KeyboardInterrupt:
            print("\nPrzerwano - zapisuje manifest...")
            state.save_manifest()
            return 130
        except Exception as exc:
            state.log_error(f"PAGE FAIL {page_url}: {exc}")
            state.stats.errors += 1

        if i % 3 == 0:
            state.save_manifest()

    state.save_manifest()

    readme = f"""# BodyWork local mirror

Zrodlo: `{base}`

## Jak ogladac (WAZNE)

Nie otwieraj `index.html` przez `file://` — fonty i sciezki `/assets/...` wtedy nie dzialaja.

```bat
py -3.13 -m http.server 8765 --directory scraped
```

Potem: http://localhost:8765/kontakt/

## Struktura

- `assets/`, `content/` — jak na produkcji (absolutne `/assets/...` dzialaja na lokalnym serwerze)
- `kontakt/index.html` — **surowy** HTML ze strony (bez BeautifulSoup rewrite)
- `*/media/` — galeria obrazkow strony
- `_meta/manifest.json` — resume

## Statystyki

- strony: {state.stats.pages}
- assety: {state.stats.assets}
- skip: {state.stats.skipped}
- bledy: {state.stats.errors}
- bajty: {state.stats.bytes}
- czas: {time.time() - started:.1f}s
"""
    write_text(out_dir / "README.md", readme, args.dry_run)

    print("\n" + "=" * 60)
    print("GOTOWE")
    print(f"  strony:   {state.stats.pages}")
    print(f"  assety:   {state.stats.assets}")
    print(f"  skip:     {state.stats.skipped}")
    print(f"  bledy:    {state.stats.errors}")
    print(f"  rozmiar:  {state.stats.bytes / 1_000_000:.2f} MB (transfer)")
    print(f"  czas:     {time.time() - started:.1f}s")
    print(f"  output:   {out_dir.resolve()}")
    print()
    print("OGLADAJ TAK:")
    print(f"  py -3.13 -m http.server 8765 --directory {out_dir}")
    print("  http://localhost:8765/kontakt/")
    return 0 if state.stats.pages > 0 or state.stats.skipped > 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
