#!/usr/bin/env python3
"""
Rewrite absolute /assets/ and /content/ URLs in scraped HTML+CSS to relative paths,
WITHOUT BeautifulSoup (preserves class names with '<').

Also strips accidental trailing spaces in hrefs (site bug: 'aos.css ').
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parent / "scraped"

# Match quoted URLs that point at site-root assets/content (with optional host)
ABS_IN_ATTR = re.compile(
    r"""(?P<prefix>\b(?:src|href|poster|data-src|data-lazy-src|data-bg|data-background|data-background-image|data-original|content)\s*=\s*(?P<q>["']))"""
    r"""(?P<url>(?:https?://bodywork\.testowe\.eu)?/(?:assets|content)/[^"']+)(?P=q)""",
    re.IGNORECASE,
)

SRCSET_ATTR = re.compile(
    r"""(?P<prefix>\b(?:srcset|data-srcset)\s*=\s*(?P<q>["']))(?P<val>[^"']+)(?P=q)""",
    re.IGNORECASE,
)

CSS_URL = re.compile(
    r"""url\(\s*(?P<q>['"]?)(?P<url>(?:https?://bodywork\.testowe\.eu)?/(?:assets|content)/[^'")]+)(?P=q)\s*\)""",
    re.IGNORECASE,
)

META_OG = re.compile(
    r"""(?P<prefix>(?:property|name)=["']og:image["'][^>]*content=|content=)(?P<q>["'])(?P<url>/(?:assets|content)/[^"']+)(?P=q)""",
    re.IGNORECASE,
)


def depth_prefix(html_path: Path) -> str:
    """home/index.html -> '../' ; blog/foo/index.html -> '../../' ; index.html -> ''"""
    rel = html_path.relative_to(ROOT)
    depth = len(rel.parts) - 1  # minus filename
    if depth <= 0:
        return ""
    return "../" * depth


def clean_url_path(url: str) -> str:
    """Return path starting with /assets or /content, no query/fragment, strip spaces."""
    url = url.strip()
    # drop host if present
    if url.lower().startswith("http"):
        p = urlparse(url)
        url = p.path + (("?" + p.query) if p.query else "")
    # strip query for local file lookup; keep path only
    path = url.split("?", 1)[0].split("#", 1)[0].strip()
    return path


def to_relative(url: str, prefix: str) -> str | None:
    path = clean_url_path(url)
    if not path.startswith(("/assets/", "/content/")):
        return None
    # local file uses unquoted path segments
    rel = prefix + path.lstrip("/")
    return rel


def rewrite_html(text: str, html_path: Path) -> tuple[str, int]:
    prefix = depth_prefix(html_path)
    n = 0

    def repl_attr(m: re.Match[str]) -> str:
        nonlocal n
        rel = to_relative(m.group("url"), prefix)
        if not rel:
            return m.group(0)
        n += 1
        return f"{m.group('prefix')}{rel}{m.group('q')}"

    def repl_srcset(m: re.Match[str]) -> str:
        nonlocal n
        q = m.group("q")
        parts_out = []
        changed = False
        for part in m.group("val").split(","):
            part = part.strip()
            if not part:
                continue
            bits = part.split()
            rel = to_relative(bits[0], prefix)
            if rel:
                bits[0] = rel
                changed = True
                n += 1
            parts_out.append(" ".join(bits))
        if not changed:
            return m.group(0)
        return f"{m.group('prefix')}{', '.join(parts_out)}{q}"

    text2 = ABS_IN_ATTR.sub(repl_attr, text)
    text2 = SRCSET_ATTR.sub(repl_srcset, text2)

    # inline url(...) in style attributes / style tags
    def repl_css(m: re.Match[str]) -> str:
        nonlocal n
        rel = to_relative(m.group("url"), prefix)
        if not rel:
            return m.group(0)
        n += 1
        q = m.group("q") or ""
        return f"url({q}{rel}{q})"

    text2 = CSS_URL.sub(repl_css, text2)
    return text2, n


def rewrite_css_file(css_path: Path) -> int:
    """Rewrite url(/assets/...) relative to the CSS file location."""
    text = css_path.read_text(encoding="utf-8", errors="replace")
    prefix = depth_prefix(css_path)  # assets/css/auto.css -> ../

    n = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal n
        rel = to_relative(m.group("url"), prefix)
        if not rel:
            return m.group(0)
        n += 1
        q = m.group("q") or ""
        return f"url({q}{rel}{q})"

    text2 = CSS_URL.sub(repl, text)
    if n:
        css_path.write_text(text2, encoding="utf-8", newline="\n")
    return n


def main() -> int:
    if not ROOT.is_dir():
        print(f"Brak folderu: {ROOT}")
        return 1

    html_files = list(ROOT.rglob("index.html"))
    # also root index if present
    root_index = ROOT / "index.html"
    if root_index.exists() and root_index not in html_files:
        html_files.append(root_index)

    total_html = 0
    total_repl = 0
    for path in sorted(html_files):
        if "_meta" in path.parts or "_shared" in path.parts:
            continue
        original = path.read_text(encoding="utf-8", errors="replace")
        # sanity: must still have parent<--
        had_raw = original.count("parent<--")
        updated, n = rewrite_html(original, path)
        if updated.count("parent<--") != had_raw:
            print(f"ABORT: class names damaged in {path}")
            return 2
        if n:
            path.write_text(updated, encoding="utf-8", newline="\n")
            total_html += 1
            total_repl += n
            print(f"  HTML {path.relative_to(ROOT)}  ({n} urls)")

    css_total = 0
    for css in ROOT.rglob("*.css"):
        if "_meta" in css.parts:
            continue
        n = rewrite_css_file(css)
        if n:
            css_total += n
            print(f"  CSS  {css.relative_to(ROOT)}  ({n} urls)")

    print("-" * 50)
    print(f"HTML files updated: {total_html}, replacements: {total_repl}")
    print(f"CSS url() fixed: {css_total}")
    print()
    print("Teraz mozesz otworzyc plik BEZPOSREDNIO albo przez serwer:")
    print("  scraped/home/index.html")
    print("  http://localhost:8765/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
