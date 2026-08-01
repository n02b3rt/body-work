> Read when: asking "what is next" or "is this in scope yet". Delivery order and post-MVP scope.

## 13. Fazy wdrożenia

Szacunki godzinowe są orientacyjne, dla jednej osoby, i zakładają dostarczenie kompletnych materiałów przez klienta w terminie.

### Faza 0 — Discovery i przygotowanie _(~20–30 h)_

**Cel:** Usunąć niewiadome, zanim powstanie pierwsza linia kodu produkcyjnego.

- Inwentaryzacja starej witryny: pełny crawl, lista URL-i, treści, mediów, produktów, zamówień
- Ustalenie z klientem: które strony przechodzą, które znikają, które się łączą
- Pozyskanie materiałów: pliki źródłowe projektu centrum (Figma), wideo hero, galeria w oryginale, logotypy partnerów, dostęp do WP (admin + baza + FTP), dostęp do DNS, dane P24, dostęp do GSC/GA4/GTM
- Weryfikacja obowiązków wynikających z dofinansowania UE
- Potwierdzenie realnych kosztów obecnych subskrypcji (materiał do §9)
- Ustalenie docelowej architektury informacji (jedno drzewo menu zamiast dzisiejszych „Kursy" + „Szkolenia")
- Konfiguracja repozytorium, środowiska staging, DNS dla subdomen testowych

**Wyjście fazy:** zaakceptowana mapa stron, mapa 301 (wstępna), lista brakujących materiałów z terminami.

---

### Faza 1 — Fundament _(~40–55 h)_

**Cel:** Działający szkielet: aplikacja, CMS, deploy, design system, hub online.

- Next.js 15 + TypeScript strict + Biome + Vitest + Playwright
- Payload 3 + Postgres + adapter S3 + lokalizacja PL/EN + role
- Middleware routingu po hoście, layouty trzech serwisów
- Design system: tokeny (kolory, typografia, siatka, odstępy), komponenty bazowe shadcn/ui, fonty self-hosted
- Docker + Coolify na Hetznerze, TLS, staging + produkcja, backupy `restic`, Uptime Kuma, GlitchTip
- CI: lint → typecheck → testy → build → deploy
- Globals: nawigacja, stopka, ustawienia serwisu
- **Hub `body-work.pl` gotowy i wdrożony**
- Baner zgód + Umami

**Kryteria odbioru:** hub działa na produkcji pod właściwą domeną, panel dostępny pod `dash.`, deploy z gita trwa < 5 min, backup nocny odtwarza się poprawnie na stagingu.

---

### Faza 2 — Centrum: treść _(~80–110 h)_

**Cel:** Kompletny serwis B2C wg dostarczonego projektu.

- Wszystkie bloki builderа (§8.2) z wariantami i podglądem
- Strona główna centrum: hero wideo, News, sekcje narracyjne, kafle usług, zespół, opinie, partnerzy, newsletter, kontakt, promo-bary
- Podstrony usługowe (trening personalny, fizjoterapia, trening grupowy, dietetyka, BodyLab, masaż) wraz z drugim poziomem
- Kolekcje: Team, Services, PriceLists, Galleries, Testimonials, Partners
- Blog + aktualności: listy, kategorie, wpis, powiązane, RSS
- Cennik, galeria, strony prawne (HTML zamiast PDF)
- Formularze (kontakt, zapis na bezpłatne zajęcia) + Listmonk
- Wersja EN
- SEO: sitemapy, JSON-LD, OG, `hreflang`
- Migracja treści B2C ze starego WP + mediów, ze skryptem rozbijającym qTranslate

**Kryteria odbioru:** redaktor samodzielnie tworzy nową podstronę z bloków i publikuje wpis; Lighthouse mobile ≥ 90 na stronie głównej i wpisie blogowym; wszystkie stare URL-e B2C mają przypisany cel 301.

---

### Faza 3 — Akademia: treść i katalog _(~60–80 h)_

**Cel:** Serwis B2B z katalogiem i kalendarzem, jeszcze bez płatności.

- Implementacja projektu graficznego akademii _(zależność: dostawa od grafika)_
- Kolekcje `Courses` i `CourseEditions`, rozdzielenie opisu kursu od terminu
- Strony ścieżek szkoleniowych (TP / TM / PM / TF)
- **Kalendarz szkoleń** z filtrami po typie, mieście i dacie
- Karta kursu: program, moduły, prowadzący, cena, miejsca, sekcja o ratach i BUR, FAQ
- Blog B2B, strony informacyjne, formularze do działu szkoleń
- Wersja EN stron ofertowych
- Migracja produktów z WooCommerce (deduplikacja „(Kopia)", oczyszczenie tytułów, mapowanie na kurs + edycje)
- JSON-LD Course/CourseInstance/Offer

**Kryteria odbioru:** obsługa szkoleń dodaje nowy termin kursu w panelu i pojawia się on w kalendarzu z poprawnymi filtrami; zero artefaktów `[:pl][:en]` i „(Kopia)" w katalogu.

---

### Faza 4 — Sklep i płatności _(~70–95 h)_

**Cel:** Pełna ścieżka zakupowa z Przelewy24.

- Koszyk (cookie + walidacja serwerowa), strona koszyka
- Checkout: dane uczestnika, dane do faktury (osoba/firma + NIP), kody rabatowe, zgody
- Rezerwacja miejsc z wygasaniem, transakcyjna obsługa licznika
- Integracja Przelewy24: rejestracja transakcji, przekierowanie, webhook z weryfikacją podpisu, `verify`, idempotencja
- Statusy zamówień, ręczne oznaczanie płatności (przelew/BUR), zwroty
- E-maile transakcyjne (potwierdzenie, przypomnienie o płatności, powiadomienie dla obsługi) — szablony edytowalne
- Panel obsługi: lista uczestników per edycja, eksport CSV, notatki
- Lista rezerwowa przy wyprzedaniu
- Konto uczestnika: rejestracja, logowanie, historia zamówień
- Zdarzenia e-commerce do dataLayer (GA4/Meta) za zgodą
- Testy E2E pełnej ścieżki zakupu (sandbox P24) + testy przypadków brzegowych

**Kryteria odbioru:** zakup w sandboxie kończy się poprawnym zamówieniem `paid`, zmniejszeniem licznika miejsc, e-mailem do klienta i do obsługi; podwójny webhook nie tworzy duplikatu; wygaśnięcie rezerwacji zwalnia miejsce.

---

### Faza 5 — Dashboard, dostępność, wydajność _(~35–50 h)_

**Cel:** Panel gotowy do pracy przez nietechnicznych użytkowników.

- Dopracowanie panelu: polskie etykiety i opisy pól, sensowne grupowanie, sortowanie, kolumny list
- Live preview dla stron, wpisów i aktualności
- Zarządzanie przekierowaniami z panelu
- Zgłoszenia formularzy w panelu z eksportem
- Audyt WCAG 2.1 AA + poprawki (kontrasty, focus, klawiatura, `prefers-reduced-motion`, alt-teksty)
- Optymalizacja: budżety wydajnościowe, obrazy, fonty, podział bundle'a, Lighthouse CI w pipeline
- Testy E2E ścieżek redaktorskich
- Dokumentacja `HANDOVER.md` (jak dodać wpis, stronę, kurs, termin, cennik) + krótkie nagrania ekranu
- **Szkolenie zespołu klienta** (2 sesje: redakcja / obsługa szkoleń)

**Kryteria odbioru:** redaktor po jednym szkoleniu wykonuje wszystkie typowe zadania bez pomocy; audyt dostępności bez błędów krytycznych.

---

### Faza 6 — Migracja i uruchomienie _(~30–40 h)_

**Cel:** Bezpieczne przełączenie bez utraty ruchu.

- Finalna migracja treści i mediów (delta od Fazy 2/3)
- Weryfikacja mapy 301 (100% starych URL-i z ruchem organicznym i z linkami zewnętrznymi)
- Archiwizacja WooCommerce: eksport zamówień do CSV + pełny zrzut bazy przekazany klientowi
- Przełączenie DNS, certyfikaty, weryfikacja subdomen
- **Change of address** w Google Search Console dla `body-work.com.pl`
- Nowe sitemapy zgłoszone w GSC, weryfikacja indeksacji
- Weryfikacja GTM/Pixel/GA4 i zdarzeń e-commerce
- Monitoring 404 przez pierwsze 30 dni + uzupełnianie przekierowań
- Utrzymanie starego WP w trybie tylko-do-odczytu przez 30 dni jako plan B
- Raport powdrożeniowy: pozycje, ruch, Core Web Vitals, lista rzeczy do dopilnowania

**Kryteria odbioru:** zero błędów 404 na URL-ach z ruchem w GSC po 14 dniach; Core Web Vitals „dobre"; sprzedaż działa na produkcji.

---

### Podsumowanie szacunku

| Faza      | Zakres                 | Godziny       |
| --------- | ---------------------- | ------------- |
| 0         | Discovery              | 20–30         |
| 1         | Fundament + hub        | 40–55         |
| 2         | Centrum                | 80–110        |
| 3         | Akademia (treść)       | 60–80         |
| 4         | Sklep                  | 70–95         |
| 5         | Panel, a11y, wydajność | 35–50         |
| 6         | Migracja i launch      | 30–40         |
| **Razem** |                        | **335–460 h** |

Plus rezerwa 10–15% na zmiany zakresu. Przy 20 h/tydzień to ok. **5–7 miesięcy**; przy 35 h/tydzień — **3–4 miesiące**.

---

## 14. Rozwój po MVP

### Krótki horyzont (naturalne rozszerzenia)

- **Integracja z systemem fakturowania** (Fakturownia / wFirma / InFakt) — automatyczne faktury po opłaceniu zamówienia
- **Automatyczne przypomnienia** przed rozpoczęciem kursu (harmonogram modułów → e-mail)
- **Certyfikaty ukończenia** generowane jako PDF z panelu
- **Rezerwacja treningów personalnych i fizjoterapii** — self-hosted **Cal.com** (AGPL) na subdomenie, integracja kalendarzy specjalistów; może zastąpić część funkcji zewnętrznych systemów
- **Wyszukiwarka pełnotekstowa** rozbudowana o Typesense/Meilisearch (self-hosted), jeśli Postgres FTS przestanie wystarczać
- **Karty podarunkowe** z kodami generowanymi w panelu

### Średni horyzont

- **Migracja zapisów na zajęcia grupowe z eFitness** — największa pozycja abonamentowa klienta; wymaga karnetów, obecności, kolejek i płatności cyklicznych. Osobny projekt, osobna wycena.
- **Sklep z produktami fizycznymi** — jeśli linia odzieżowa/sprzętowa urośnie: wtedy wraca temat **Medusa v2** jako osobnego serwisu z własnym adminem, spięta z tym frontendem.
- **Program poleceń / lojalnościowy** dla kursantów
- **Strefa materiałów dla uczestników** (skrypty, nagrania) — może odciążyć Podię

### Do rozważenia

- Automatyczne tłumaczenie roboczych wersji EN (lokalny model przez Ollama — bez abonamentu)
- A/B testy landingów kampanijnych
- Panel raportów sprzedaży w dashboardzie (obrót per kurs, miasto, kanał)

---

