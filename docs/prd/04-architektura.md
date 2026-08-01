> Read when: designing something cross-cutting: hosts, routing, layers. As-built: `../architecture.md`.

## 7. Architektura

### 7.1 Widok wysokopoziomowy

```
                     Internet
                        │
              ┌─────────▼──────────┐
              │  Cloudflare (DNS,  │   opcjonalnie, plan darmowy
              │  cache, WAF)       │
              └─────────┬──────────┘
                        │
        ┌───────────────▼────────────────┐
        │   VPS Hetzner (Coolify/Docker) │
        │                                │
        │  ┌──────────────────────────┐  │
        │  │  Caddy / Traefik (TLS)   │  │
        │  └────┬──────────┬──────────┘  │
        │       │          │             │
        │  ┌────▼──────────▼──────────┐  │
        │  │   Next.js 16 (App Router)│  │
        │  │   + Payload CMS 3        │  │
        │  │                          │  │
        │  │  middleware: host →      │  │
        │  │   (hub)/(centrum)/       │  │
        │  │   (akademia)             │  │
        │  │  /admin → dashboard      │  │
        │  │  Local API (bez HTTP)    │  │
        │  └────┬──────────┬──────────┘  │
        │       │          │             │
        │  ┌────▼────┐ ┌───▼─────┐       │
        │  │Postgres │ │ Redis   │       │
        │  │  16     │ │ cache/  │       │
        │  │         │ │ kolejki │       │
        │  └─────────┘ └─────────┘       │
        │  ┌─────────┐ ┌─────────┐       │
        │  │ MinIO / │ │Listmonk │       │
        │  │ dysk    │ │newsletter│      │
        │  │ (media) │ └─────────┘       │
        │  └─────────┘ ┌─────────┐       │
        │              │ Umami   │       │
        │              │analityka│       │
        │              └─────────┘       │
        └────────────────────────────────┘
                 │              │
        ┌────────▼───┐   ┌──────▼──────────┐
        │Przelewy24  │   │ SMTP relay      │
        │(płatności) │   │ (transakcyjne)  │
        └────────────┘   └─────────────────┘

  Zewnętrzne, poza zakresem: eFitness (grafik/zapisy), Podia (Alfabet Ruchu)
```

### 7.2 Kluczowa decyzja: jedna aplikacja, wiele domen

Zamiast trzech osobnych projektów Next.js — **jedna aplikacja z routingiem po hoście**. Powody:

1. Payload 3 działa **wewnątrz** aplikacji Next.js i udostępnia Local API — zapytania do treści idą prosto do Postgresa, bez narzutu HTTP. Przy trzech osobnych frontendach każdy musiałby odpytywać CMS przez sieć.
2. Jeden build, jeden deploy, jeden zestaw komponentów UI, jeden `docker compose` — realistyczne do utrzymania przez jedną osobę.
3. Wspólne bloki i design system: akademia i centrum dzielą 70% komponentów.

Rozdzielenie zapewnia middleware:

```
body-work.pl          → app/(hub)/...
centrum.body-work.pl  → app/(centrum)/...
akademia.body-work.pl → app/(akademia)/...
dash.body-work.pl     → app/(payload)/admin/...
```

Każdy serwis ma własny layout, własne motywy kolorystyczne (CSS variables), własne menu i stopkę, własną sitemapę i własne `robots.txt`.

**Ryzyko:** awaria deploymentu kładzie wszystkie trzy serwisy. Mitygacja: staging + health-check + automatyczny rollback do poprzedniego obrazu w Coolify.

### 7.3 Struktura repozytorium

```
bodywork/
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   ├── hub/[[...slug]]/page.tsx
│   │   │   ├── centrum/
│   │   │   │   ├── [[...slug]]/page.tsx        # strony z bloków
│   │   │   │   ├── blog/[slug]/page.tsx
│   │   │   │   ├── aktualnosci/[slug]/page.tsx
│   │   │   │   ├── zespol/[slug]/page.tsx
│   │   │   │   ├── cennik/page.tsx
│   │   │   │   └── galeria/page.tsx
│   │   │   ├── akademia/
│   │   │   │   ├── [[...slug]]/page.tsx
│   │   │   │   ├── kalendarz/page.tsx
│   │   │   │   ├── szkolenia/[slug]/page.tsx   # karta kursu = produkt
│   │   │   │   ├── koszyk/page.tsx
│   │   │   │   ├── zamowienie/page.tsx         # checkout
│   │   │   │   ├── zamowienie/[id]/page.tsx    # potwierdzenie
│   │   │   │   ├── konto/                      # panel uczestnika
│   │   │   │   └── blog/[slug]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (payload)/
│   │   │   ├── admin/[[...segments]]/page.tsx  # dashboard
│   │   │   └── api/[...slug]/route.ts          # REST/GraphQL Payload
│   │   ├── api/
│   │   │   ├── p24/notify/route.ts             # webhook Przelewy24
│   │   │   ├── newsletter/route.ts             # → Listmonk
│   │   │   ├── revalidate/route.ts             # ISR on-demand
│   │   │   └── og/[...]/route.tsx              # dynamiczne obrazki OG
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── blocks/                                 # bloki builderа
│   │   ├── Hero/  HeroVideo/  TextMedia/  Cards/  Gallery/
│   │   ├── Team/  Testimonials/  Pricing/  FAQ/  Form/
│   │   ├── NewsCarousel/  Partners/  CTA/  CourseList/  Spacer/
│   ├── collections/                            # definicje Payload
│   │   ├── Pages.ts  Posts.ts  News.ts  Media.ts  Team.ts
│   │   ├── Services.ts  PriceLists.ts  Galleries.ts
│   │   ├── Testimonials.ts  Partners.ts
│   │   ├── Courses.ts  CourseEditions.ts  Orders.ts
│   │   ├── Customers.ts  Coupons.ts  Redirects.ts  Users.ts
│   ├── globals/                                # Nav, Footer, SiteSettings ×3 serwisy
│   ├── components/
│   │   ├── ui/                                 # design system (shadcn/ui)
│   │   ├── centrum/  akademia/  hub/  shared/
│   ├── lib/
│   │   ├── payload.ts        cart.ts        p24.ts
│   │   ├── email.ts          invoices.ts    seo.ts
│   │   ├── i18n.ts           rate-limit.ts  utils.ts
│   ├── payload.config.ts
│   └── middleware.ts                           # routing po hoście + i18n + redirecty
├── scripts/
│   ├── migrate-wp-content.ts     # WXR/REST → Payload
│   ├── migrate-wp-media.ts
│   ├── migrate-woo-products.ts
│   ├── strip-qtranslate.ts       # [:pl]...[:en]... → dwie lokalizacje
│   └── build-redirect-map.ts     # stare URL-e → nowe
├── tests/
│   ├── unit/                     # Vitest
│   └── e2e/                      # Playwright
├── docker/
│   ├── Dockerfile
│   └── compose.yml
├── docs/
│   ├── HANDOVER.md               # instrukcja dla klienta
│   └── RUNBOOK.md                # procedury awaryjne
└── package.json
```

### 7.4 Wzorce

1. **Server Components domyślnie** — klienckie tylko koszyk, filtry kalendarza, karuzele, formularze, przełączniki.
2. **ISR + rewalidacja na żądanie** — treści generowane statycznie, hook `afterChange` w Payload uderza w `/api/revalidate`. Redaktor widzi zmianę w kilkanaście sekund, a odwiedzający dostaje stronę statyczną.
3. **Local API zamiast HTTP** — `getPayload()` w Server Components; brak dodatkowego round-tripu.
4. **Bloki jako kontrakt** — jeden blok = jeden komponent React + jedna definicja pola w Payload. Dodanie bloku to jedno miejsce w kodzie i natychmiastowa dostępność w panelu.
5. **Serwis jako wymiar danych** — każda kolekcja treści ma pole `site: 'hub' | 'centrum' | 'akademia'`; filtrowanie w zapytaniach i w widokach panelu.
6. **Slug + lokalizacja** — pola lokalizowane w Payload (PL domyślnie, EN opcjonalnie); brak wpisu EN → fallback na PL z `hreflang` bez podmiany.
7. **Koszyk w cookie + serwerowa weryfikacja cen** — cena i dostępność miejsc **zawsze** liczone po stronie serwera przed utworzeniem płatności.

---

