> Read when: almost never. As-built stack: `../stack.md`. This is the PRD version from 2026-07-24, kept for the reasoning behind each choice.

## 9. Stos technologiczny

### Rdzeń

| Technologia        | Wersja            | Rola                                               | Koszt   |
| ------------------ | ----------------- | -------------------------------------------------- | ------- |
| **Next.js**        | 16.x (App Router) | Framework full-stack, SSR/ISR                      | 0       |
| **React**          | 19.x              | UI                                                 | 0       |
| **TypeScript**     | 6.x (strict)      | Typowanie                                          | 0       |
| **Payload CMS**    | 3.x               | CMS + panel + auth + REST/GraphQL, osadzony w Next | 0 (MIT) |
| **PostgreSQL**     | 18                | Baza danych                                        | 0       |
| **Redis** (Valkey) | 8.x               | Cache, rate limiting, kolejki, sesje koszyka       | 0       |

**Dlaczego Payload, a nie Strapi/Directus/headless WP:**

- Instaluje się _wewnątrz_ Next.js → Local API bez narzutu HTTP, wspólny deploy, wspólny TypeScript.
- Pole `blocks` to gotowy page-builder — dokładnie to, czego wymaga punkt „dodawanie podstron przez nieprogramistów".
- Localization, wersjonowanie, drafts, live preview, RBAC, form-builder, SEO plugin, redirects plugin — w rdzeniu lub w oficjalnych, darmowych pluginach.
- Licencja MIT, brak płatnych funkcji ukrytych za enterprise (w odróżnieniu od części ekosystemu Strapi).
- Panel w React — modyfikowalny tymi samymi umiejętnościami, których projekt i tak wymaga.

**Dlaczego nie headless WordPress:** utrzymuje wszystkie dzisiejsze koszty i problemy (aktualizacje, wtyczki, PHP), dokłada drugą warstwę do utrzymania. Sprzeczne z celem C1.

**Dlaczego nie Medusa.js do sklepu:** Medusa to osobny backend z **własnym panelem administracyjnym** — złamałoby wymóg „jeden wspólny dashboard" i podwoiło infrastrukturę. Katalog to ~30 pozycji usługowych bez wysyłki i wariantów; pełny silnik commerce jest tu przerostem formy. Lekki moduł zamówień w Payload (kolekcje `Courses`/`CourseEditions`/`Orders`/`Coupons` + integracja P24) daje 100% potrzebnych funkcji przy ułamku złożoności.
_Warunek zmiany decyzji:_ jeśli klient zapowie rozwój sklepu z produktami fizycznymi (odzież, sprzęt, magazyn, wysyłka, integracje kurierskie), wraca temat Medusy jako osobnego serwisu — patrz §14.

### UI i styl

| Technologia                        | Rola                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Tailwind CSS 4**                 | Warstwa stylów                                                                                           |
| **shadcn/ui** (Radix)              | Dostępne komponenty bazowe (dialog, tabs, accordion, select) — kopiowane do repo, bez zależności runtime |
| **Motion** (dawniej Framer Motion) | Animacje sekcji, karuzel, promo-barów                                                                    |
| **Embla Carousel**                 | Karuzele (News, opinie, galeria) — lekka, dostępna                                                       |
| **next/image + sharp**             | Obrazy, AVIF/WebP, lazy loading, rozmiary responsywne                                                    |
| **next/font**                      | Self-hosting fontów (bez Google Fonts CDN — RODO)                                                        |

### Biblioteki funkcjonalne

| Biblioteka                          | Rola                                   |
| ----------------------------------- | -------------------------------------- |
| **next-intl**                       | i18n interfejsu, routing językowy      |
| **zod**                             | Walidacja formularzy i wejść API       |
| **react-hook-form**                 | Obsługa formularzy                     |
| **@payloadcms/plugin-ecommerce**    | E-commerce od Payload                  |
| **@payloadcms/plugin-seo**          | Pola SEO w panelu                      |
| **@payloadcms/plugin-form-builder** | Formularze budowane przez redaktora    |
| **@payloadcms/plugin-redirects**    | Przekierowania zarządzane z panelu     |
| **@payloadcms/plugin-search**       | Wyszukiwarka wewnętrzna (Postgres FTS) |
| **@payloadcms/storage-s3**          | Media w MinIO / Hetzner Object Storage |
| **nodemailer**                      | Poczta transakcyjna                    |
| **satori / @vercel/og**             | Generowanie obrazków OG                |
| **date-fns** (+ locale pl)          | Daty, zakresy modułów kursów           |

### Narzędzia deweloperskie

| Narzędzie            | Rola                                        |
| -------------------- | ------------------------------------------- |
| **Biome**            | Lint + format (zastępuje ESLint + Prettier) |
| **Vitest**           | Testy jednostkowe                           |
| **Playwright**       | Testy E2E (checkout, formularze, panel)     |
| **Lighthouse CI**    | Budżety wydajnościowe w CI                  |
| **pnpm**             | Menedżer pakietów                           |
| **Docker + Compose** | Uruchomienie produkcyjne i lokalne          |

### Infrastruktura (self-hosted)

| Element             | Rozwiązanie                                                                              | Szacowany koszt |
| ------------------- | ---------------------------------------------------------------------------------------- | --------------- |
| Serwer              | Hetzner CPX31 / CX42 (4 vCPU, 8–16 GB RAM, NVMe), lokalizacja Falkenstein lub Helsinki   | ~55–80 zł/mies. |
| Orkiestracja        | **Coolify** (self-hosted PaaS, Apache-2.0) — deploy z Gita, TLS, podgląd logów, rollback | 0               |
| Reverse proxy / TLS | Caddy lub Traefik (w Coolify) + Let's Encrypt                                            | 0               |
| Baza                | Postgres 16 w kontenerze                                                                 | 0               |
| Media               | Wolumen na dysku lub Hetzner Object Storage / MinIO                                      | 0–25 zł/mies.   |
| Backup              | `restic` → Hetzner Storage Box, retencja 30 dni, codziennie + przed każdym deployem      | ~20 zł/mies.    |
| Newsletter          | Listmonk (kontener)                                                                      | 0               |
| Analityka           | Umami (kontener)                                                                         | 0               |
| Monitoring          | Uptime Kuma (kontener) + alerty na e-mail/Telegram                                       | 0               |
| Logi/błędy          | GlitchTip (self-hosted, kompatybilny z SDK Sentry)                                       | 0               |
| CDN/DNS/WAF         | Cloudflare Free                                                                          | 0               |
| SMTP transakcyjny   | Relay (np. istniejąca poczta firmowa, Amazon SES lub darmowy próg dostawcy)              | 0–40 zł/mies.   |
| Bramka płatnicza    | Przelewy24 — prowizja od transakcji, brak abonamentu                                     | prowizja        |

**Alternatywa rozważona i odrzucona:** Vercel. Zaleta: zero konfiguracji. Wady w tym projekcie: koszt rośnie z ruchem i transformacjami obrazów, potrzebna zewnętrzna baza (Neon/Supabase — kolejny abonament), a wymóg klienta brzmi „self-hosted, minimalizacja opłat rocznych". Rekomendacja: Hetzner + Coolify. Vercel warto zostawić jako plan awaryjny na okres przejściowy.

### Szacunkowe porównanie kosztów rocznych

| Pozycja                                                                                               | Dziś (WordPress)          | Po migracji             |
| ----------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------- |
| Hosting                                                                                               | hosting współdzielony/VPS | VPS Hetzner ~700–950 zł |
| Licencje wtyczek (SEO, wielojęzyczność, formularze, kalendarz, optymalizacja, backup, bezpieczeństwo) | typowo 1 500–4 000 zł     | 0 zł                    |
| Newsletter (Mailchimp/GetResponse)                                                                    | 600–2 500 zł              | 0 zł (Listmonk)         |
| Backup jako usługa                                                                                    | 200–500 zł                | ~240 zł (Storage Box)   |
| Analityka                                                                                             | 0 (GA4)                   | 0 (Umami + GA4)         |
| SMTP                                                                                                  | zwykle w hostingu         | 0–500 zł                |
| **Razem (bez prowizji płatniczych i domen)**                                                          | **~2 500–7 000 zł**       | **~950–1 700 zł**       |

> Kwoty „dziś" to widełki rynkowe — **do potwierdzenia fakturami klienta** przed umieszczeniem w ofercie. To najmocniejszy argument sprzedażowy w tym projekcie, więc warto go oprzeć na ich realnych danych, a nie na szacunkach.

---

