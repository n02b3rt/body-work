# AI Notes — BodyWork Centrum

> Running journal for whoever works on this project (human or agent).
> **Read this file at the start of every session** — it's the memory that survives between sessions and context resets.
> At the end of every larger task, add a dated entry at the top (newest first): what was done, key architectural decisions, and what to watch out for next time. Keep entries short.

<!-- Copy this block for each new entry, newest on top:

## {{DATE}} — <short task title>
- **Done:** what now works.
- **Decisions:** architectural choices made and why (one line each).
- **Watch out:** gotchas, debts, or things that will bite next time.

-->

## 2026-07-24 — project scaffold

- **Done:** repository initialized; Next.js 16 (App Router, TypeScript, Tailwind CSS 4) scaffolded at repo root; existing Python scraper/mirror toolkit relocated to `scripts/scrape/` (paths and `.bat` scripts updated to still work from their new location); `CLAUDE.md`, `docs/`, and `AI_NOTES.md` in place.
- **Decisions:** stack — Next.js 16 + TypeScript + Tailwind CSS 4, with the Python scraper kept as a supporting reference tool, not the product itself; repo language — English; UI language — Polish. The scraped mirror (`scripts/scrape/scraped/`, ~300MB) is gitignored and regenerable via `scripts/scrape/run_scrape.bat` — it's a content/design reference, not something the Next.js app depends on at runtime.
- **Watch out:** Next.js 16 is newer than most model training data — API/conventions may differ from what's expected; check `node_modules/next/dist/docs/` before assuming behavior. No actual site pages/content have been built yet — homepage is still the default `create-next-app` starter.
