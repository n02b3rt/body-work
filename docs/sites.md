> Read when: working across hosts: hub vs centrum vs akademia vs dashboard, or deciding where a shared component belongs.

# Sites: one Next.js app, four domains

> How the single codebase serves BODYWORK's four public/admin surfaces. Written in English. Full rationale: `prd/04-architektura.md` §7.

## The domains

| Domain | Route group | Role | Content status |
|---|---|---|---|
| `body-work.pl` | `app/[locale]/hub/` (a real segment, not a group, see Gotcha below) | One-screen landing, routes visitors to Centrum / Akademia / Alfabet Ruchu (external, `podia.com`) | Landing page built |
| `centrum.body-work.pl` | `app/[locale]/(centrum)/` | B2C fitness club: services, team, pricing, gallery, blog, news, signup links to eFitness | Reference content scraped from `bodywork.testowe.eu`, see [`scraped-site-map.md`](./scraped-site-map.md) |
| `akademia.body-work.pl` | `app/(akademia)/` | B2B training academy: courses, calendar, e-commerce shop, blog | **No design yet**: top schedule risk (PRD §6.3, §15). Build the backend/data model first (collections, calendar, cart) against a neutral layout per PRD §15's mitigation; swap in the real design when it's delivered. |
| `dash.body-work.pl` | `app/(payload)/admin/` | Shared Payload CMS admin for editors/admins/training staff | Comes largely for free from Payload; customization happens in `collections/`, not hand-built pages |

## Why one app, not three

Decided in PRD §7.2: don't relitigate without a strong reason (log it in `architecture.md`'s decisions table if you do):

1. Payload 3 runs *inside* Next.js and exposes a Local API: content queries hit Postgres directly, no HTTP hop. Three separate frontends would each need to call the CMS over the network instead.
2. One build, one deploy, one component library, one `docker compose`: realistic for a small team to maintain.
3. Centrum and Akademia share an estimated 70% of components (blocks, UI primitives) per PRD §7.2.

## How the split happens

`src/proxy.ts` routes by request host (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`, see the gotcha in `architecture.md`): the dashboard host serves Payload, `CENTRUM_HOST` falls through to the `(centrum)/` route group unchanged, and every other host is the hub, gated to its one screen (see the Gotcha below for why the hub isn't a route group). Akademia's own host-branch lands the same way once it has a first real route. Each site keeps its own:
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

## Gotcha: the hub can't be a route group

This file used to sketch `app/(hub)/` and `app/(centrum)/` as siblings, both owning `page.tsx` at `/`.
Next.js's own docs rule that out directly (`route-groups.md`): *"Routes in different groups should
not resolve to the same URL path... would both resolve to `/about` and cause an error."* Its own fix
for exactly this case: *"make sure your home route (/) is defined within one of the route groups."*
Centrum keeps `/` (it has ~15 routes and real SEO value already); the hub's landing lives at the real
segment `src/app/[locale]/hub/`, and `src/proxy.ts` invisibly rewrites the hub host's `/` (and `/en`)
to `/hub` (`/en/hub`) before handing off to next-intl, the same trick already used for the dashboard
host's own `/` → `/admin` rewrite. Visitors never see `/hub` in the address bar. Logged in
`decisions.md`.

## Current status

Centrum's tree moved into `src/app/[locale]/(centrum)/` (route group: no URL impact, every existing
path is unchanged) once the hub gave it a second site to share `[locale]/` with. It's bilingual (PL
default + `/en`), built on shared components in `src/components/centrum/` (Header, Footer, Hero,
NewsCarousel, TextMedia, StatementSection, ServiceGrid, TestimonialCarousel, NewsletterSignup,
PartnerLogos) and `src/components/ui/` (Container, Button, SectionHeading). See
`migration-tracker.md` for per-page status.

The hub is one page, `src/app/[locale]/hub/page.tsx`, with its own minimal `src/components/hub/`
(Header, Footer, ThreeWaySplit), reachable only through the host rewrite above. Payload isn't
installed for it: its copy lives in the `Hub` message namespace, same as Centrum's pre-CMS content.
