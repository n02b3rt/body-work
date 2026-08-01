> Read when: coming back to the project after a break, or something behaves oddly and you want to know whether someone already hit it.

# Decision log

One line per entry, newest first. **20 entries maximum**; older ones roll into `archive/`.

**An entry exists only when there is a decision or a gotcha the diff doesn't show.**
"What I did" is `git log`, not this file. Append with `/log`.

Older: [`archive/ai-notes-2026-07.md`](./archive/ai-notes-2026-07.md) (84 entries, 24–30 July 2026).

---

- **2026-08-01, docs are now enforced:** `pnpm check:docs` (`scripts/check-docs.mjs`, no dependencies) fails on size budgets, missing `> Read when:` headers, broken links, map paths that do not exist, source folders or scripts missing from the map, a log over 20 entries, and em-dashes. ⚠ It found two claims that had silently been false: the media default is **1920px, not 2560** (2560 is only the fallback constant), and there are **48 message namespaces, not 46**. Both came from the old `CLAUDE.md` project map. ⚠ The em-dash allowance is a **ratchet**: `EM_DASH_DEBT` in the script may be lowered, never raised.
- **2026-08-01, agent workflow:** `AI_NOTES.md` (174 KB) no longer loads at session start; it is archived and replaced by this file. `PRD.md` split into `prd/`, `map.md` is now a router over `docs/map/*.md` (one file per domain) and step zero of every task, and domain knowledge moved into `.claude/skills/` so the harness loads it on trigger instead of the agent reading prose. Session boot dropped from ~190 KB to 2.6 KB. ⚠ A **global** gitignore (`~/.gitignore_global`) excludes `.claude/`, so the skills would never have been committed; the repo `.gitignore` now negates it. ⚠ Budgets live in `CLAUDE.md` and are the only thing stopping this from regrowing. ⚠ When Akademia or the hub lands, only three domains multiply per site (public site, blog, newsletter); everything else is shared. The split shape is written out at the foot of `map.md`: follow it, don't improvise one.
- **2026-07-30, media create:** no Placeholder column (`blurDataURL` is `admin.hidden`), a successful create returns to the library. ⚠ Payload still briefly aims at `/:id`; a session marker catches the race.
- **2026-07-29, accounts:** roles are `administrator` / `edytor` / `klient`, login by username or email. ⚠ Existing rows with `redaktor`/`moderator` need a one-off update.
- **2026-07-29, CSRF:** "Nie możesz wykonać tej akcji" when saving media is port drift, not Media access rules. Dev `csrf`/`cors` now cover ports 3000–3005. ⚠ Keep `.env` in sync with `pnpm dev --port`.
- **2026-07-29, media form:** picking a file autofills title/ALT/slug/`kind`. Extra formats come from the sharp + ffmpeg already installed, **no new library**. ⚠ `kind` lost its `defaultValue` because it blocked MIME classification.
- **2026-07-29, admin copy:** one dry line instead of a tutorial. Rule in `admin-copy.md`. ⚠ Old copy gets fixed opportunistically, no mass rewrite.
- **2026-07-29, Aktualizacje vs Biblioteki:** Aktualizacje shows only outdated packages, Biblioteki is pure inventory. Shared report, different table modes. ⚠ GitHub tag URLs assume a `v` prefix.
- **2026-07-29, admin nav:** structure in `nav-tree.ts`, presentation exclusively in `custom.css` (`.bw-nav*`). Active state is background + weight, no border.
- **2026-07-29, page builder:** "components" split in two: a 16-element library (`src/fields/elements/`) and saved compositions (`SiteComponents`). Nesting is **fixed at one level**; compositions are referenced, not copied. One set of renderers draws canvas and site. ⚠ A block's `dbName` **must be a function**: a bare string replaces the whole table name and collapses every block of that type into one table. ⚠ `payload run` needs top-level `await`; inside `async main()` the process exits 0 after the first line.
- **2026-07-29, publishing:** unpublish is `data: { _status: 'draft' }` **without** `draft: true`. With the flag Payload writes a new draft version and the page stays live.
- **2026-07-29, blur placeholders:** counting them from the live page returns zero, because `next/image` drops the placeholder once the real file decodes. Check the served HTML for `data:image/webp;base64,` instead.

> ⚠ **`pnpm lint` is broken on `main` too** (eslint-plugin-react 7.37 vs ESLint 10, fails while linting `eslint.config.mjs`). Not caused by your change; needs its own fix.
