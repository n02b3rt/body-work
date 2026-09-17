> Read when: **always, before you search this repo for anything.** This is step zero of every task.

# Map

Find the domain, open **only** that file, go straight to the code. Don't grep blind.

| Domain | File | Covers |
|---|---|---|
| Public site | [`map/public-site.md`](./map/public-site.md) | Centrum pages, section components, error pages |
| Blog | [`map/blog.md`](./map/blog.md) | listing, posts, category archives, EN versions |
| Page builder | [`map/page-builder.md`](./map/page-builder.md) | the 18-element library, shared renderers |
| CMS / Payload | [`map/cms-payload.md`](./map/cms-payload.md) | config, 9 collections, 2 globals, the panel |
| Media | [`map/media.md`](./map/media.md) | uploads, conversion, blur placeholders, video, explorer |
| Admin panel | [`map/admin-panel.md`](./map/admin-panel.md) | nav tree, dashboard, custom views |
| Accounts and roles | [`map/accounts.md`](./map/accounts.md) | roles, login, user helpers |
| Appearance | [`map/appearance.md`](./map/appearance.md) | colour tokens, presets, saved compositions |
| i18n | [`map/i18n.md`](./map/i18n.md) | next-intl, message files, EN content |
| SEO | [`map/seo.md`](./map/seo.md) | metadata, structured data, sitemap, robots, feed |
| Newsletter and email | [`map/newsletter.md`](./map/newsletter.md) | double opt-in, subscribers, Resend |
| Admin AI | [`map/admin-ai.md`](./map/admin-ai.md) | Gemini helpers in the dashboard |
| Package updates | [`map/package-updates.md`](./map/package-updates.md) | Aktualizacje and Biblioteki screens |
| Scraper | [`map/scraper.md`](./map/scraper.md) | the Centrum reference mirror |
| Infra and dev | [`map/infra/index.md`](./map/infra/index.md) | local setup, config files, scripts, deployment |
| Parallel work | [`map/parallel-work.md`](./map/parallel-work.md) | worktrees, one database and port per agent |
| Docs and agent config | [`map/agent-config.md`](./map/agent-config.md) | `docs/`, `.claude/`, skills, budgets |

**Found something none of these files list? Add it, in the same change.** A map that lies is worse than no map.

---

## Not built yet, don't go looking

None of this is in the repo. Don't grep for it, don't assume you missed it.

- **Payments, cart, orders, Przelewy24:** no code at all. Data model: [`prd/06-dane-api.md`](./prd/06-dane-api.md),
  env and security: [`prd/07-bezpieczenstwo.md`](./prd/07-bezpieczenstwo.md). Account helpers ready to reuse: `src/lib/users/`.
- **The `body-work.pl` hub:** nothing. Will land under `src/app/[locale]/(hub)/`, see [`sites.md`](./sites.md).
- **Akademia (B2B, courses):** nothing, and **no design delivered yet**. Will land under `src/app/[locale]/(akademia)/`.
- **`/cookies`:** deferred by the client. `/test` and `/podziekowanie` await a client decision.
- **`/galeria`:** the reference links to a page that **doesn't exist**; the workaround is in `src/lib/external-links.ts`.
- **E2E tests and browser automation:** none. Unit tests and CI cover pure functions only,
  see [`map/infra/index.md`](./map/infra/index.md).
- **Redis, S3, monitoring, analytics:** in the PRD, not in the code. Dev keeps files on disk and the database in Docker.

Built one of these? **Move it out of this section into its domain file**, that's part of "done".

---

## How this map grows

The project will roughly triple when Akademia and the hub land. Follow these rules mechanically;
do not improvise a new shape.

**1. Most domains do not multiply per site.** CMS, media, accounts, i18n, SEO, appearance, page
builder, admin panel, package updates, infra, parallel work and agent config are **shared**: one
site or four, they stay one file each. Centrum and Akademia are expected to share around 70% of
components ([`prd/04-architektura.md`](./prd/04-architektura.md) §7.2), and the shared component
library is the reason.

**2. Exactly three domains multiply**: public site, blog, newsletter. When a second site's routes
enter one of them, split that file into a folder, and only then:

```
docs/map/public-site.md
  ->  docs/map/public-site/index.md     what all sites share (primitives, error pages, patterns)
      docs/map/public-site/centrum.md
      docs/map/public-site/akademia.md
```

The row in the table above then points at `index.md`, which links to its siblings.

**Do not pre-create empty files or folders.** Split on the first real route of the second site, not
in anticipation. Same rule as route groups in [`conventions.md`](./conventions.md).

**3. Size trigger, for any map file:** past **6 KB**, split it by sub-area using the same shape
(`<domain>/index.md` plus siblings). A map file is a lookup, not an essay. The moment it needs
paragraphs to explain *how* something works, that content belongs in the topic doc under `docs/`,
and the map file should link to it instead.

**4. A brand new domain** (shop, booking, courses) gets its own `docs/map/<domain>.md` and a row in
the table above, in the same change that creates its first file. That row is part of "done", enforced
by the `finish-task` skill.
