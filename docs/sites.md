> Read when: working across hosts: hub vs centrum vs akademia vs dashboard, or deciding where a shared component belongs.

# Sites: one Next.js app, four domains

> How the single codebase serves BODYWORK's four public/admin surfaces. Written in English. Full rationale: `prd/04-architektura.md` §7.

## The domains

| Domain | Route group | Role | Content status |
|---|---|---|---|
| `body-work.pl` | `app/(hub)/` | One-screen landing, routes visitors to Centrum / Akademia / Alfabet Ruchu (external, `podia.com`) | Not started |
| `centrum.body-work.pl` | `app/(centrum)/` | B2C fitness club: services, team, pricing, gallery, blog, news, signup links to eFitness | Reference content scraped from `bodywork.testowe.eu`, see [`scraped-site-map.md`](./scraped-site-map.md) |
| `akademia.body-work.pl` | `app/(akademia)/` | B2B training academy: courses, calendar, e-commerce shop, blog | **No design yet**: top schedule risk (PRD §6.3, §15). Build the backend/data model first (collections, calendar, cart) against a neutral layout per PRD §15's mitigation; swap in the real design when it's delivered. |
| `dash.body-work.pl` | `app/(payload)/admin/` | Shared Payload CMS admin for editors/admins/training staff | Comes largely for free from Payload; customization happens in `collections/`, not hand-built pages |

## Why one app, not three

Decided in PRD §7.2: don't relitigate without a strong reason (log it in `architecture.md`'s decisions table if you do):

1. Payload 3 runs *inside* Next.js and exposes a Local API: content queries hit Postgres directly, no HTTP hop. Three separate frontends would each need to call the CMS over the network instead.
2. One build, one deploy, one component library, one `docker compose`: realistic for a small team to maintain.
3. Centrum and Akademia share an estimated 70% of components (blocks, UI primitives) per PRD §7.2.

## How the split happens

`src/proxy.ts` will route by request host into the matching route group (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`, see the gotcha in `architecture.md`). Right now it only handles locale routing (next-intl); host-based site routing gets layered into the same file once hub/akademia route groups exist. Each site keeps its own:
- Layout, nav, footer (Payload globals: `Navigation_Centrum`, `Footer_Centrum`, etc.: one set per site, per PRD §10.3)
- Color theme (CSS variables)
- Sitemap + `robots.txt`
- Content, scoped by a `site` field on shared collections (Pages, Posts, News, Team, …) rather than fully separate collections per site (PRD §7.4)

## Shared vs. site-specific components

Target layout (PRD §7.3), not built yet:

- `src/components/ui/`: design-system primitives (shadcn/ui base), shared by all sites.
- `src/components/shared/`: cross-site composed components (e.g. a pricing table renderer).
- `src/components/centrum/`, `src/components/akademia/`, `src/components/hub/`: site-specific composition.
- `src/blocks/`: the CMS page-builder contract: one block = one React component + one Payload field definition, usable by any site's builder (Hero, TextMedia, Cards, Gallery, Team, Testimonials, Pricing, FAQ, Form, NewsCarousel, Partners, CTA, CourseList, Spacer: full list PRD §8.2).

Before building a new component, check whether Centrum already has an equivalent: most of what Akademia needs will resemble a Centrum block with different content. See the reuse rule in [`conventions.md`](./conventions.md).

## Current status

Centrum's homepage is built at `src/app/[locale]/page.tsx` (bilingual, PL default + `/en`), using a first pass of shared components in `src/components/centrum/` (Header, Footer, Hero, NewsCarousel, TextMedia, StatementSection, ServiceGrid, TestimonialCarousel, NewsletterSignup, PartnerLogos) and `src/components/ui/` (Container, Button, SectionHeading). No route groups yet: `(centrum)` isn't needed until a second site (hub/akademia) exists alongside it, per the "don't pre-create empty structure" rule in `conventions.md`. Payload isn't installed. See `migration-tracker.md` for per-page status.
