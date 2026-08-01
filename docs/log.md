> Read when: coming back to the project after a break, or something behaves oddly and you want to know whether someone already hit it.

# Decision log

One line per entry, newest first. **20 entries maximum**; older ones roll into `archive/`.

**An entry exists only when there is a decision or a gotcha the diff doesn't show.**
"What I did" is `git log`, not this file. Append with `/log`.

Older: [`archive/ai-notes-2026-07.md`](./archive/ai-notes-2026-07.md) (84 entries, 24–30 July 2026).

---

- **2026-08-01, docs enforced:** `pnpm check:docs` fails on budgets, missing `> Read when:` headers, broken links, map paths that do not exist, uncovered source folders and em-dashes. ⚠ It caught two long-standing false claims: media downscales to **1920px, not 2560**, and there are **48 namespaces, not 46**.
- **2026-08-01, agent workflow:** session boot cut from ~190 KB to 2.6 KB. `AI_NOTES.md` archived, `PRD.md` split into `prd/`, `map.md` turned into a router over `docs/map/*.md`, domain knowledge moved into `.claude/skills/`. ⚠ A **global** gitignore excludes `.claude/`; the repo `.gitignore` now negates it or the skills never ship. ⚠ Only three domains multiply per site when Akademia lands; the split shape is at the foot of `map.md`.
- **2026-07-30, media create:** no Placeholder column (`blurDataURL` is `admin.hidden`), a successful create returns to the library. ⚠ Payload still briefly aims at `/:id`; a session marker catches the race.
- **2026-07-29, accounts:** roles are `administrator` / `edytor` / `klient`, login by username or email. ⚠ Existing rows with `redaktor`/`moderator` need a one-off update.
- **2026-07-29, CSRF:** "Nie możesz wykonać tej akcji" when saving media is port drift, not Media access rules. Dev `csrf`/`cors` now cover ports 3000–3005. ⚠ Keep `.env` in sync with `pnpm dev --port`.
- **2026-07-29, media form:** picking a file autofills title/ALT/slug/`kind`. Extra formats come from the sharp + ffmpeg already installed, **no new library**. ⚠ `kind` lost its `defaultValue` because it blocked MIME classification.
- **2026-07-29, admin copy:** one dry line instead of a tutorial. Rule in `admin-copy.md`. ⚠ Old copy gets fixed opportunistically, no mass rewrite.
- **2026-07-29, Aktualizacje vs Biblioteki:** Aktualizacje shows only outdated packages, Biblioteki is pure inventory. Shared report, different table modes. ⚠ GitHub tag URLs assume a `v` prefix.
- **2026-07-29, admin nav:** structure in `nav-tree.ts`, presentation exclusively in `custom.css` (`.bw-nav*`). Active state is background + weight, no border.
- **2026-07-29, page builder:** "components" split into a 16-element library and saved compositions; nesting fixed at one level; one set of renderers draws canvas and site. Full rules: skill `page-builder`. ⚠ A block's `dbName` **must be a function**, or every block of that type collapses into one table. ⚠ `payload run` needs top-level `await`: skill `payload-script`.
- **2026-07-29, publishing:** unpublish is `data: { _status: 'draft' }` **without** `draft: true`. With the flag Payload writes a new draft version and the page stays live.
- **2026-07-29, blur placeholders:** counting them from the live page returns zero, because `next/image` drops the placeholder once the real file decodes. Check the served HTML for `data:image/webp;base64,` instead.

> ⚠ **`pnpm lint` is broken on `main` too** (eslint-plugin-react 7.37 vs ESLint 10, fails while linting `eslint.config.mjs`). Not caused by your change; needs its own fix.
