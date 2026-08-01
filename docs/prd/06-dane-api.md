> Read when: adding a collection, a field or an endpoint. Data model and API contract.

## 10. Model danych

### 10.1 Kolekcje treści

```ts
Users; // panel: email, hasło, role: 'admin'|'editor'|'sales', sites[]
Media; // plik, alt (wymagany), caption, focal point, warianty rozmiarów
Pages; // site, slug, title(L), layout: Blocks[], seo, status, versions
Posts; // site, slug, title(L), excerpt(L), content(L), cover, categories[],
// tags[], author→Team, publishedAt, seo, readingTime
News; // site, title(L), excerpt(L), image, link{internal|external},
// publishedAt, expiresAt, pinned
Categories; // site, name(L), slug
Team; // name, role(L), departments[]: personal|physio|diet|academy,
// photo, bio(L), specializations[], certificates[], socials, order
Services; // site, name(L), slug, shortDesc(L), icon, image, page→Pages, order
PriceLists; // site, name(L), sections[{ title, items[{ name, desc, price,
// unit, note, highlighted, ctaLink }] }]
Galleries; // site, title(L), images[], layout
Testimonials; // site, author, content(L), source, rating, visible
Partners; // site, name, logo, url, order
Redirects; // from, to, statusCode(301|302), enabled, note
Forms; // (plugin) definicje formularzy
FormSubmissions; // (plugin) zgłoszenia
ConsentLogs; // ip_hash, categories, timestamp, policyVersion
```

`(L)` = pole lokalizowane (PL/EN).

### 10.2 Kolekcje sklepowe

```ts
Courses; // ścieżka merytoryczna kursu — opis, program, dla kogo, prowadzący[]
// slug, type: 'TP'|'TM'|'TF'|'PM'|'other', seo, akredytacje

CourseEditions; // konkretny termin sprzedażowy
// course→Courses, title, city: 'poznan'|'warszawa'|'online',
// modules[{ from, to, note }], startDate, endDate,
// price (grosze), compareAtPrice, vatRate,
// seats, seatsReserved, seatsSold,
// saleStatus: 'draft'|'open'|'soldout'|'closed',
// installmentsInfo, burEligible, sku

Products; // produkty pozaszkoleniowe: koszulka, karta podarunkowa,
// ocena funkcjonalna, wejście jednorazowe
// variants[{ name, sku, price, stock }], requiresShipping

Customers; // auth: email, hasło; imię, nazwisko, telefon,
// billing{ type: person|company, name, nip, address },
// marketingConsent, createdAt

Orders; // orderNumber, customer→Customers | guest{...},
// items[{ kind: 'edition'|'product', ref, name, qty,
//          unitPrice, vatRate, total }],
// participant{ firstName, lastName, email, phone },
// billing{...}, coupon→Coupons, discountTotal,
// subtotal, total, currency: 'PLN',
// status: 'pending'|'paid'|'failed'|'cancelled'|'refunded',
// paymentProvider: 'p24'|'manual',
// p24{ sessionId, orderId, methodId, statement },
// reservedUntil, paidAt, notes[], consents{}, createdAt

Coupons; // code, type: 'percent'|'amount', value, appliesTo[],
// maxUses, usedCount, validFrom, validTo, active

WaitlistEntries; // edition→CourseEditions, email, name, createdAt, notified
```

### 10.3 Globals

```ts
SiteSettings_Hub / _Centrum / _Akademia;
// logo, nazwa, claim, kontakt, godziny, social, domyślne SEO, OG default,
// GTM ID, Meta Pixel ID, Umami ID, promo bars[]
Navigation_Hub / _Centrum / _Akademia; // struktura menu (2 poziomy), CTA
Footer_Hub / _Centrum / _Akademia; // kolumny linków, dane, dokumenty prawne
```

### 10.4 Indeksy i integralność

- `Pages(site, slug, locale)` — unikalny
- `Posts(site, slug, locale)` — unikalny; `Posts(publishedAt)`
- `CourseEditions(saleStatus, startDate)`, `CourseEditions(city)`, `CourseEditions(course)`
- `Orders(status, createdAt)`, `Orders(orderNumber)` — unikalny, `Orders(p24.sessionId)` — unikalny (idempotencja webhooka)
- `Redirects(from)` — unikalny
- Licznik miejsc modyfikowany **wyłącznie w transakcji** (`SELECT ... FOR UPDATE`), nigdy z poziomu klienta.

---

## 11. Specyfikacja API

Większość operacji odczytu realizują Server Components przez Local API Payload — bez publicznego endpointu. Poniżej endpointy faktycznie wystawione na zewnątrz.

### Sklep

**POST `/api/cart`** — dodanie pozycji do koszyka

- Body: `{ kind: 'edition'|'product', id: string, qty: number, variant?: string }`
- Walidacja serwerowa: istnienie, `saleStatus === 'open'`, dostępność miejsc
- Odpowiedź: `{ cart: Cart }` (cookie `bw_cart`, HttpOnly, SameSite=Lax)

**PATCH `/api/cart`** / **DELETE `/api/cart/:itemId`** — zmiana ilości / usunięcie

**POST `/api/checkout`** — utworzenie zamówienia i sesji płatności

- Body: dane uczestnika, dane do faktury, kod rabatowy, zgody
- Walidacja: Zod + ponowne przeliczenie cen po stronie serwera + rezerwacja miejsc (`reservedUntil = now + 30 min`)
- Rate limit: 10/min/IP
- Odpowiedź: `{ orderNumber, redirectUrl }` (link do Przelewy24)

**POST `/api/p24/notify`** — webhook Przelewy24

- Auth: weryfikacja podpisu (SHA-384 z `crc`), sprawdzenie IP bramki
- Idempotentny po `sessionId`
- Kroki: `verify` → aktualizacja statusu → potwierdzenie miejsc → e-maile
- Odpowiedź: `200 OK` (zawsze szybka; ciężkie operacje w kolejce)

**GET `/api/orders/:orderNumber`** — status zamówienia (uwierzytelniony lub z tokenem z e-maila)

### Treści i pomocnicze

**POST `/api/forms/:formId`** — wysyłka formularza (honeypot + rate limit 5/min/IP)

**POST `/api/newsletter`** — zapis do Listmonk (double opt-in), 5/min/IP

**GET `/api/search?q=&site=&locale=`** — wyszukiwarka (Postgres FTS), 30/min/IP

**POST `/api/revalidate`** — rewalidacja ISR, wywoływana z hooków Payload, chroniona sekretem

**GET `/api/og/[type]/[id]`** — generowany obraz OG

**GET `/api/health`** — health-check dla Coolify/Uptime Kuma

### Panel

`/api/[...payload]` — REST + GraphQL Payload, chronione sesją i RBAC; `/admin` — interfejs panelu (dostęp tylko przez `dash.body-work.pl`).

---

