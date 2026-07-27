# Stack — BODYWORK ecosystem

> The approved technology list for this project. Written in English.

## The rule

**Never add, remove, upgrade, or swap a library or service without asking the user first.** Propose it, explain why, wait for a yes — this applies to `npm install`, new Payload plugins, and new infra pieces (self-hosted or SaaS) alike. Everything below was chosen deliberately (see the decisions log in [`architecture.md`](./architecture.md)); don't substitute a "similar" package because it's more familiar.

This file is the single source of truth for what's approved. If something you need isn't listed here, that's the signal to ask, not to install.

## Core

| Tech | Version | Role |
|---|---|---|
| Next.js | 16.x (App Router) | Full-stack framework, one app serving all domains |
| React | 19.x | UI |
| TypeScript | strict | Typing |
| Payload CMS | 3.x | CMS + admin panel + auth + REST/GraphQL, embedded in Next.js (Local API, no HTTP round-trip) |
| PostgreSQL | self-hosted (Docker, on the Hetzner VPS) | Database — **not NeonDB**. See "Resolved conflicts" below. |
| Redis (Valkey) | — | Cache, rate limiting, cart sessions, queues |

No separate ORM (Prisma, Drizzle, etc.) — Payload owns the schema and migrations. See "Resolved conflicts".

## UI & style

| Tech | Role |
|---|---|
| Tailwind CSS 4 | Styling |
| shadcn/ui (Radix) | Base accessible components, copied into the repo (no runtime dependency) |
| Motion (formerly Framer Motion) | Animations (sections, carousels, promo bars) |
| Embla Carousel | Carousels (news, testimonials, gallery) |
| next/image + sharp | Images, AVIF/WebP, responsive sizes |
| next/font | Self-hosted fonts (no Google Fonts CDN — GDPR) |

## i18n

| Tech | Role |
|---|---|
| next-intl | UI/interface string translations, locale routing |
| Payload Localization | Per-field content translation (PL default, EN) |

Full strategy: [`i18n.md`](./i18n.md).

## Forms & state

| Tech | Role |
|---|---|
| react-hook-form | Form handling |
| zod | Validation (forms + API input) |
| Zustand | Client-side UI state (e.g. cart UI, calendar filters) — price/availability is always re-verified server-side regardless of client state |

## Payload plugins

| Plugin | Role |
|---|---|
| `@payloadcms/plugin-ecommerce` | Courses/orders/cart backbone for the Akademia shop |
| `@payloadcms/plugin-seo` | SEO fields in the panel |
| `@payloadcms/plugin-form-builder` | Editor-built forms |
| `@payloadcms/plugin-redirects` | Panel-managed 301s |
| `@payloadcms/plugin-search` | Internal search (Postgres FTS) |
| `@payloadcms/storage-s3` | Media on MinIO / Hetzner Object Storage |

## Dev tooling

| Tech | Role |
|---|---|
| Biome | Lint + format (PRD target — repo currently has plain ESLint from `create-next-app`; switching is a pending decision, ask first) |
| Vitest | Unit tests |
| Playwright | E2E tests |
| Lighthouse CI | Performance budgets in CI |
| pnpm | Package manager (PRD target — repo currently uses npm/`package-lock.json`; switching is a pending decision, ask first) |
| Docker + Compose | Local/prod runtime |

## Infrastructure (self-hosted first)

Per PRD §9 — "zero abonamentów SaaS tam, gdzie istnieje dojrzała alternatywa open-source": everything below runs on the Hetzner VPS except the payment gateway, SMTP relay, and domains/VPS themselves.

| Piece | Solution |
|---|---|
| Server | Hetzner CPX31/CX42 |
| Orchestration | Coolify |
| Reverse proxy / TLS | Caddy or Traefik + Let's Encrypt |
| Media storage | MinIO / Hetzner Object Storage |
| Backups | restic → Hetzner Storage Box |
| Newsletter | Listmonk (self-hosted) |
| Analytics | Umami (self-hosted, cookieless) + GTM/GA4/Meta Pixel behind consent |
| Monitoring | Uptime Kuma |
| Error tracking | GlitchTip (Sentry-SDK compatible) |
| CDN/DNS/WAF | Cloudflare Free |
| Payments | Przelewy24 (paid by necessity — commission only, no subscription) |
| Transactional email | SMTP relay |

Full picture: `PRD.md` §7 and §9.

## Resolved conflicts (2026-07-25)

A stack note floating outside the PRD mentioned NeonDB and Prisma. Checked against `PRD.md` and confirmed with the user:

- **NeonDB → rejected.** `PRD.md` §7/§9/§15 makes self-hosted Postgres on the VPS a load-bearing decision (cost model + the project's "self-hosted first" cardinal rule). A managed Postgres SaaS contradicts that directly. Postgres runs self-hosted, full stop.
- **Prisma → rejected.** Payload already owns the database schema, migrations, and query layer via its Local API. A second ORM touching the same Postgres instance is redundant and a migration-conflict risk. If a genuinely separate data need shows up later (e.g. a reporting layer outside Payload's collections), raise it as a new proposal — don't reintroduce Prisma by default.

See [`architecture.md`](./architecture.md) → Key decisions for the dated log entry.

| jsdom | **devDependency only.** Required by Payload's own `convertHTMLToLexical`, which takes a `JSDOM` constructor as an argument rather than bundling a DOM. Used by `scripts/import-blog.ts` to migrate the scraped articles; never imported by the app. Approved 2026-07-27. **Pinned to `^26`** — jsdom 30 pulls an ESM-only transitive dependency that Payload's tsx-based script runner loads via `require()`, which fails with `ERR_REQUIRE_ESM`. |
