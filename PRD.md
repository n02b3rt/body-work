# Product Requirements Document: BODYWORK — ekosystem stron (hub + centrum + akademia + dashboard)

**Wersja:** 1.0
**Data:** 24.07.2026
**Klient:** BODYWORK, ul. Kajki 14, 60-573 Poznań
**Wykonawcy:** Dominik, Norbert
**Zastępuje:** body-work.com.pl (WordPress + WooCommerce + qTranslate-X)

---

## 1. Executive Summary

BODYWORK to poznańskie centrum zdrowia i ruchu (trening personalny, trening grupowy, fizjoterapia, dietetyka, masaż, diagnostyka BodyLab) prowadzące równolegle działalność B2B — akademię szkoleniową dla trenerów i fizjoterapeutów (kursy TP/TM/TF/PM, masterclassy, warsztaty) sprzedawaną online w modelu e-commerce.

Obecnie całość działa na jednym, przeciążonym WordPressie z 2015 r.: motyw szyty na miarę (SoftTone-BodyWork), WooCommerce, porzucona wtyczka wielojęzyczna qTranslate-X (widoczne w treściach artefakty `[:pl]...[:en]...`, m.in. w nazwach produktów), PageSpeed Module, GTM, PixelYourSite, Site Kit. Efekt: niska wydajność, koszty utrzymania wtyczek, treści zanieczyszczone znacznikami, brak spójności marki między częścią B2C a B2B.

Projekt zastępuje to **jednym self-hostowanym systemem w Next.js 16 (16.2.11 lub nowszy) + Payload CMS 3**, obsługującym cztery domeny z jednego repozytorium i jednej bazy danych:

| Domena                  | Rola                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `body-work.pl`          | Hub — prosty landing rozdzielający ruch na trzy marki                                     |
| `centrum.body-work.pl`  | Klub fitness (B2C): usługi, zespół, cennik, galeria, blog, aktualności, zapisy → eFitness |
| `akademia.body-work.pl` | Akademia szkoleniowa (B2B): kursy, kalendarz szkoleń, **sklep e-commerce**, blog          |
| `dash.body-work.pl`     | Wspólny panel CMS dla redaktorów i adminów (treści + produkty + zamówienia)               |

Alfabet Ruchu pozostaje zewnętrznym produktem na podia.com — na hubie i w akademii obsługiwany wyłącznie jako przekierowanie/link wychodzący.

**Zasada naczelna projektu: zero abonamentów SaaS tam, gdzie istnieje dojrzała alternatywa open-source.** CMS, wielojęzyczność, formularze, newsletter, analityka, wyszukiwarka, hosting mediów, monitoring — wszystko self-hosted na jednym VPS. Płatne pozostają wyłącznie usługi, których fizycznie nie da się samodzielnie hostować: bramka płatnicza (Przelewy24), relay SMTP dla poczty transakcyjnej, domeny/VPS oraz system rezerwacji zajęć (eFitness — decyzja klienta, poza zakresem).

**Cel MVP:** działający produkcyjnie ekosystem trzech stron plus panel CMS, z pełną migracją treści i map 301 ze starej domeny, oddany w sześciu fazach — od fundamentu i huba, przez centrum, akademię i sklep, po migrację i przekazanie.

---

## 2. Misja i cele biznesowe

**Misja:** Dać BODYWORK szybką, samodzielnie edytowalną i tanią w utrzymaniu obecność online, w której marketing (redaktorzy) nie potrzebuje programisty do codziennej pracy, a właściciel nie płaci co roku za wtyczki, które kiedyś działały.

### Cele biznesowe (mierzalne)

| #   | Cel                                           | Miara sukcesu                                                                                                                             |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | Obniżenie kosztów rocznych utrzymania         | Redukcja stałych opłat licencyjnych/wtyczkowych do 0 zł; łączny koszt infrastruktury ≤ ~1 000–1 500 zł/rok (VPS + backup + SMTP + domeny) |
| C2  | Wydajność i SEO                               | Core Web Vitals „dobre" dla ≥ 90% ruchu; Lighthouse Performance ≥ 95 (mobile) na stronach publicznych                                     |
| C3  | Zachowanie pozycji w wyszukiwarce po migracji | Spadek ruchu organicznego ≤ 15% w miesiąc po migracji, powrót do bazy w ≤ 3 miesiące                                                      |
| C4  | Samodzielność redakcyjna                      | Redaktor bez wiedzy technicznej tworzy nową podstronę z bloków i publikuje wpis blogowy bez kontaktu z wykonawcą                          |
| C5  | Sprzedaż szkoleń                              | Konwersja koszyk → płatność nie gorsza niż obecna w WooCommerce; wsparcie płatności ratalnych P24                                         |
| C6  | Higiena treści                                | Zero artefaktów `[:pl][:en]` i zero duplikatów „(Kopia)" w produkcyjnym katalogu produktów                                                |

### Zasady projektowe

1. **Self-hosted first** — SaaS tylko tam, gdzie nie ma sensownej alternatywy (płatności, SMTP).
2. **Jedna baza, jeden panel** — redaktor nie loguje się do trzech systemów.
3. **Statyczne gdzie się da** — ISR/SSG dla treści, SSR tylko dla koszyka i panelu.
4. **Treść należy do klienta** — brak vendor lock-inu, eksport do JSON/SQL w każdej chwili.
5. **Klocki, nie kod** — nowe podstrony powstają z gotowych bloków, a nie z HTML-a wklejanego do edytora.

---

## 3. Użytkownicy

### Persona 1: Klient klubu (B2C) — „Ania, 34 lata, Poznań-Ogrody"

- Szuka: cennika, grafiku zajęć, kto jest trenerem, jak wygląda przestrzeń, jak się zapisać.
- Wchodzi z telefonu, z Google Maps albo Instagrama.
- Potrzebuje: szybkiej strony, klikalnego telefonu, galerii, jednego wyraźnego CTA („zapisz się na bezpłatne zajęcia").

### Persona 2: Specjalista/kursant (B2B) — „Marek, fizjoterapeuta, Warszawa"

- Szuka: terminów kursów, programu, ceny, możliwości rat i dofinansowania z BUR.
- Porównuje oferty, wraca kilka razy przed zakupem, kupuje z desktopa produkt za 8 000–9 000 zł.
- Potrzebuje: wiarygodności, kompletu informacji organizacyjnych, faktury, jasnego regulaminu, bezpiecznej płatności.

### Persona 3: Redaktor / marketing BODYWORK

- Kompetencje techniczne: niskie. Zna WordPressa na poziomie „dodaj wpis, wgraj zdjęcie".
- Zadania: aktualności, wpisy blogowe, nowe terminy kursów, zmiana cennika, wymiana zdjęć, nowe podstrony landingowe pod kampanie.
- Potrzebuje: podglądu przed publikacją, wersji roboczych, bloków zamiast kodu, PL/EN obok siebie.

### Persona 4: Administrator / obsługa szkoleń

- Zadania: obsługa zamówień, listy uczestników, limity miejsc, zwroty, korespondencja, faktury.
- Potrzebuje: eksportu listy uczestników do CSV, statusów płatności, ręcznego dopisania uczestnika (przelew tradycyjny, dofinansowanie BUR).

### Persona 5: Wykonawcy i ich następcy

- Potrzebuje: TypeScript strict, jednego repozytorium, powtarzalnego deployu, backupów, dokumentacji przekazania.

---

## 4. Zakres MVP

### W zakresie

**Hub (`body-work.pl`)**

- ✅ Jednoekranowy landing z logo, claimem i trzema kaflami (Centrum / Akademia / Alfabet Ruchu)
- ✅ Dane kontaktowe, godziny otwarcia, social, stopka prawna
- ✅ OG/SEO, JSON-LD `Organization`
- ✅ Edytowalny z CMS (kafle, teksty, tło/wideo)

**Centrum (`centrum.body-work.pl`)** — wg projektu z bodywork.testowe.eu

- ✅ Strona główna: hero wideo, sekcja „News" (karuzela), sekcje o filozofii, kafle usług, zespół, opinie, newsletter, partnerzy, kontakt, sticky promo-bar
- ✅ Drzewo usług: Trening personalny (indywidualny / w parze / ocena funkcjonalna / trenerzy), Fizjoterapia (terapia manualna / rehabilitacja ruchowa / zdrowy brzuch / specjaliści), Trening grupowy (zajęcia / Plan Zdrowej Zmiany / grafik → eFitness / Medicover), Dietetyka (+ profile dietetyków), BodyLab (VALD / analiza składu ciała), Masaż
- ✅ Cennik (tabela zarządzana z CMS)
- ✅ Galeria
- ✅ Blog (lista, kategorie, wpis, powiązane wpisy)
- ✅ Aktualności/News (osobny typ od bloga, z linkiem „Więcej")
- ✅ Profile trenerów, fizjoterapeutów, dietetyków (jedna kolekcja „Zespół" z przypisaniem do działów)
- ✅ Opinie klientów, logotypy partnerów
- ✅ Formularz kontaktowy + zapis do newslettera
- ✅ Strony prawne: polityka prywatności, regulamin, cookies (jako strony HTML, nie PDF)
- ✅ Wersja EN
- ✅ Link wychodzący do grafiku zajęć / zapisów (eFitness)

**Akademia (`akademia.body-work.pl`)** — projekt graficzny do dostarczenia przez grafika

- ✅ Strona główna akademii
- ✅ Strony ścieżek szkoleniowych: Fundamenty Ruchu (TP), Trener Medyczny (TM), Motoryka i Ruch Człowieka (PM), Masterclass/Warsztaty (TF)
- ✅ **Kalendarz szkoleń** z filtrowaniem po typie i mieście (Poznań / Warszawa / online), sortowany po dacie, z licznikiem wolnych miejsc
- ✅ **Sklep e-commerce**: karta kursu = produkt, koszyk, checkout, płatność Przelewy24 (w tym raty P24), potwierdzenia e-mail, limity miejsc
- ✅ Konto uczestnika (historia zamówień, dane do faktury, dokumenty)
- ✅ Blog B2B
- ✅ Strony informacyjne (dla kogo, akredytacja REPs, BUR, FAQ, regulamin szkoleń)
- ✅ Formularze kontaktowe do działu szkoleń
- ✅ Wersja EN (przynajmniej strony ofertowe)
- ✅ Link wychodzący: Alfabet Ruchu → alfabetruchu.podia.com

**Dashboard (`dash.body-work.pl`)**

- ✅ Jedno logowanie, role: Admin / Redaktor / Obsługa szkoleń
- ✅ Edycja treści wszystkich trzech serwisów z wyborem serwisu
- ✅ Blokowy builder podstron (drag & drop sekcji, bez kodu)
- ✅ Blog i aktualności z wersjami roboczymi i podglądem na żywo
- ✅ Biblioteka mediów z automatyczną konwersją do WebP/AVIF i wariantami rozmiarów
- ✅ Zarządzanie produktami (kursy), terminami, cenami, limitami miejsc
- ✅ Zamówienia: lista, statusy, eksport listy uczestników do CSV, ręczne dodanie uczestnika
- ✅ Kody rabatowe
- ✅ Menu, stopka, dane kontaktowe, ustawienia SEO — edytowalne
- ✅ Zarządzanie przekierowaniami 301
- ✅ Zgłoszenia z formularzy w panelu (nie tylko na maila)

**Techniczne / migracyjne**

- ✅ Migracja treści z WordPressa (strony, wpisy, media, produkty), stworzenie pełnej i działającej dwujęzyczności
- ✅ Kompletna mapa 301 ze starych URL-i (w tym `body-work.com.pl` → nowe subdomeny)
- ✅ Sitemapy, robots.txt, JSON-LD (Organization, LocalBusiness, Course, Event, Article, Product/Offer, BreadcrumbList)
- ✅ Self-hosted analityka + zachowanie GTM/Meta Pixel za zgodą cookie
- ✅ Baner zgód RODO/cookies z realnym blokowaniem skryptów
- ✅ Automatyczne backupy bazy i mediów
- ✅ CI/CD, staging, monitoring uptime

### Poza zakresem MVP

- ❌ Budowa własnego systemu rezerwacji zajęć grupowych i karnetów (pozostaje eFitness)
- ❌ Migracja historycznych zamówień WooCommerce do nowego sklepu (archiwum offline: eksport CSV + zrzut bazy)
- ❌ Platforma e-learningowa / hosting wideo kursów (pozostaje Podia)
- ❌ Aplikacja mobilna
- ❌ Integracja z systemem księgowym w trybie automatycznym (faza 2 — patrz §14)
- ❌ Panel klienta B2C (karnety, obecności) — to domena eFitness
- ❌ Wielojęzyczność poza PL/EN
- ❌ Automatyczny import terminów kursów z zewnętrznych systemów
- ❌ Sklep z produktami fizycznymi w pełnym zakresie (koszulki obsłużone jako pojedynczy produkt z odbiorem osobistym/paczkomatem ryczałtem)

---

## 5. User Stories

### Odwiedzający — hub

**US-1:** Jako osoba, która wpisała `body-work.pl`, chcę w jednym spojrzeniu zrozumieć, że BODYWORK to klub, akademia i kurs online, i wybrać właściwą ścieżkę.

> _Wchodzę na body-work.pl, widzę trzy kafle z krótkim opisem. Klikam „Akademia szkoleniowa" i trafiam na akademia.body-work.pl._

### Odwiedzający — centrum

**US-2:** Jako potencjalna klientka chcę sprawdzić cennik i grafik zajęć bez dzwonienia.

> _Wchodzę z telefonu na centrum.body-work.pl/cennik, widzę czytelną tabelę, klikam „Grafik zajęć" i trafiam do eFitness w nowej karcie._

**US-3:** Jako odwiedzający chcę poznać trenera, u którego rozważam trening, i zobaczyć przestrzeń klubu.

> _Otwieram „Trenerzy", klikam profil, widzę zdjęcie, specjalizacje, bio, a niżej przycisk „Umów się"._

**US-4:** Jako czytelnik chcę przeczytać wpis blogowy o bieganiu i znaleźć powiązane treści.

> _Z Google trafiam na wpis, na dole widzę trzy powiązane wpisy i CTA do warsztatów._

**US-5:** Jako anglojęzyczny klient chcę przełączyć stronę na EN i zobaczyć te same informacje.

> _Klikam „EN", zostaję na tej samej podstronie, treść zmienia język, URL to `/en/...`._

### Odwiedzający — akademia

**US-6:** Jako fizjoterapeuta chcę przefiltrować kalendarz szkoleń po mieście i typie, żeby znaleźć kurs dla siebie.

> _Zaznaczam „Trening medyczny" + „Warszawa", widzę dwa terminy z datami, ceną i liczbą wolnych miejsc._

**US-7:** Jako kursant chcę kupić miejsce na kursie i zapłacić kartą lub w ratach.

> _Klikam „Zapisz się", wypełniam dane (w tym dane do faktury i NIP), akceptuję regulamin, przechodzę do Przelewy24, wybieram raty, wracam na stronę potwierdzenia i dostaję e-mail z podsumowaniem._

**US-8:** Jako kursant chcę wrócić po kilku miesiącach i sprawdzić, co kupiłem.

> _Loguję się na konto, widzę listę zamówień, statusy płatności i pobieram fakturę._

**US-9:** Jako zainteresowany dofinansowaniem chcę szybko znaleźć informację o BUR i możliwości rat.

> _Na karcie kursu widzę wyraźną sekcję „Płatność i dofinansowanie" z kontaktem do działu szkoleń._

### Redaktor

**US-10:** Jako redaktor chcę dodać wpis na blogu z galerią i wideo, zobaczyć podgląd i opublikować.

> _W dash.body-work.pl wybieram „Blog → Nowy wpis", wybieram serwis „Centrum", układam treść z bloków, klikam „Podgląd", potem „Publikuj"._

**US-11:** Jako redaktor chcę stworzyć nową podstronę landingową pod kampanię, bez pomocy programisty.

> _Tworzę stronę o slugu `warsztat-dla-kobiet`, składam ją z bloków Hero + Tekst + Galeria + FAQ + Formularz, ustawiam meta title/description i publikuję._

**US-12:** Jako redaktor chcę zaktualizować cennik przed nowym rokiem.

> _Otwieram „Cennik → Centrum", zmieniam kwoty w tabeli, zapisuję — zmiana jest widoczna na stronie w ciągu minuty._

**US-13:** Jako redaktor chcę mieć pewność, że mogę cofnąć błędną zmianę.

> _Wchodzę w zakładkę „Wersje", porównuję z poprzednią i przywracam ją jednym kliknięciem._

### Obsługa szkoleń

**US-14:** Jako pracownik działu szkoleń chcę zobaczyć listę uczestników nadchodzącego kursu i wyeksportować ją do CSV.

**US-15:** Jako pracownik chcę ręcznie dopisać uczestnika, który zapłacił przelewem tradycyjnym lub ma dofinansowanie BUR, i oznaczyć zamówienie jako opłacone.

**US-16:** Jako pracownik chcę ustawić limit miejsc na kursie tak, żeby po jego wyczerpaniu strona sama pokazała „brak miejsc" i zamknęła sprzedaż.

**US-17:** Jako pracownik chcę wygenerować kod rabatowy dla partnera na wybrany kurs, ważny do konkretnej daty.

### Administrator

**US-18:** Jako administrator chcę nadać nowemu pracownikowi rolę Redaktor bez dostępu do zamówień i ustawień.

**US-19:** Jako administrator chcę, żeby stare adresy z body-work.com.pl przekierowywały na nowe, i chcę móc dodać kolejne przekierowanie z panelu.

---

## 6. Analiza stanu obecnego

### 6.1 Co jest dzisiaj (audyt body-work.com.pl)

| Obszar           | Stan                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CMS              | WordPress, motyw custom `SoftTone-BodyWork`, strona uruchomiona 2015                                                                                         |
| Sklep            | WooCommerce, slug `/produkt/...`, ~30+ produktów (kursy, masterclassy, ocena funkcjonalna, koszulka, karty podarunkowe), stany magazynowe jako liczba miejsc |
| Płatności        | Przelewy24 + kalkulator rat P24 (`secure.przelewy24.pl/kalkulator_raty`)                                                                                     |
| Wielojęzyczność  | qTranslate-X (porzucona) — znaczniki `[:pl]...[:en]...` **przeciekają do treści i tytułów produktów**                                                        |
| Rezerwacje       | Zewnętrzny eFitness (`bodywork-poznan.cms.efitness.com.pl/kalendarz-zajec`)                                                                                  |
| E-learning       | Zewnętrzna Podia (`alfabetruchu.podia.com`)                                                                                                                  |
| Optymalizacja    | Google PageSpeed Module (przepisane nazwy plików `.pagespeed.ic.`) — objaw walki z wolnym motywem                                                            |
| Marketing        | GTM (`GTM-P4TPSQ5`), Meta Pixel przez PixelYourSite, Google Site Kit                                                                                         |
| Dokumenty prawne | Regulamin i polityka prywatności jako **PDF-y w katalogu motywu** (zły dla SEO i dostępności)                                                                |
| Struktura        | Ok. 40+ stron w jednym drzewie, mieszające B2C i B2B; menu z dwoma niemal identycznymi gałęziami („Kursy" i „Szkolenia")                                     |
| Higiena danych   | Produkty z sufiksami „(Kopia) (Kopia) (Kopia)…" w tytułach — duplikaty w indeksie                                                                            |
| Blog             | Link w menu prowadzi do `http://body-work.com.pl/blog/?setlang=no` (http, parametr martwej wtyczki)                                                          |

### 6.2 Nowy projekt centrum (bodywork.testowe.eu)

Makieta dostarczona przez klienta jest zbudowana w kreatorze stron (zasoby pod `/content/<hash>/...`, canonical wskazujący na inną domenę — czyli szablon). Traktujemy ją **wyłącznie jako referencję wizualną i strukturalną**, nie jako kod źródłowy.

Zidentyfikowana struktura do odtworzenia:

```
/                          hero wideo, "Zrównoważony rozwój sprawności", News (karuzela),
                           "Przyjazna przestrzeń" + galeria, "Dołącz do Bodywork" (6 kafli usług),
                           Zespół, Opinie (karuzela), Kontakt/CTA, Newsletter, Partnerzy, Stopka,
                           sticky promo-bar (2 rotujące paski na dole)
/trening-personalny/       + /trening-indywidualny /trening-w-parze /ocena-funkcjonalna /trenerzy
/fizjoterapia/             + /terapia-manualna /rehabilitacja-ruchowa /zdrowy-brzuch /specjalisci
/trening-grupowy/          + /zajecia-grupowe /plan-zdrowej-zmiany /grafik-zajec(→eFitness) /medicover
/dietetyka/                + profile dietetyków (2)
/bodylab/                  + /technologia-vald /analiza-skladu-ciala
/cennik/  /masaz/  /blog/  /galeria/  /instrukcja/
/polityka-prywatnosci/  /regulamin/  /cookies/
/en/...                    pełna wersja angielska
```

**Wnioski dla wyceny i harmonogramu:**

- To ok. **22 unikalne szablony/strony PL** + wersja EN + blog + aktualności.
- Powtarzalnych układów jest mało — większość podstron usługowych da się złożyć z jednego zestawu bloków.
- Wymagane: **od grafika pliki źródłowe (Figma/Adobe XD) + wideo hero + galeria w oryginalnej rozdzielczości**, a nie tylko podgląd HTML. Bez tego dokładne odwzorowanie typografii i siatki będzie zgadywaniem.

### 6.3 Akademia — czego brakuje

Projekt graficzny akademii **jeszcze nie istnieje**. To główne ryzyko harmonogramu. Do czasu jego dostarczenia można zrealizować backend (produkty, kalendarz, koszyk, płatności) i strukturę informacji — patrz Faza 4 w §13.

---

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

## 8. Funkcjonalności — szczegóły

### 8.1 Hub

Statyczna strona, generowana raz na build/rewalidację. Zawiera: logo, claim, trzy kafle z obrazkiem i opisem, blok kontaktowy, stopkę prawną, przełącznik PL/EN. Treść i kolejność kafli edytowalne w CMS (Global `Hub Settings`).

JSON-LD: `Organization` + `sameAs` (Facebook, Instagram).

### 8.2 Blokowy builder podstron

Serce wymagania „dodawanie nowych podstron przez osoby niezaznajomione z kodowaniem".

Redaktor tworzy stronę, wybiera serwis, ustawia slug i buduje treść z listy bloków (drag & drop, każdy blok ma własne pola i podgląd):

| Blok               | Pola                                                             |
| ------------------ | ---------------------------------------------------------------- |
| Hero               | nagłówek, podtytuł, obraz/wideo tła, CTA (×2), wariant wysokości |
| Hero wideo         | plik wideo, plakat, tekst nakładki                               |
| Tekst + media      | RichText, obraz/wideo, strona (lewo/prawo), tło                  |
| Kafle / karty      | lista kart: obraz, tytuł, opis, link                             |
| Galeria            | wybór z biblioteki mediów, siatka/karuzela, lightbox             |
| Zespół             | filtr po dziale, układ siatki, link do profili                   |
| Opinie             | wybór opinii, karuzela/siatka                                    |
| Cennik             | wybór tabeli cennikowej, warianty prezentacji                    |
| FAQ                | lista pytań/odpowiedzi (akordeon) + JSON-LD FAQPage              |
| Formularz          | wybór formularza z Form Builder                                  |
| Aktualności        | liczba, filtr, układ karuzeli                                    |
| Lista kursów       | filtr po typie/mieście, limit, wariant listy/kafli               |
| Partnerzy          | logotypy z linkami                                               |
| CTA / promo-bar    | tekst, przycisk, kolorystyka                                     |
| Odstęp / separator | wysokość, linia                                                  |

Każdy blok ma warianty wizualne (`variant`) zamiast dowolnego CSS — redaktor nie może zepsuć layoutu.

Dodatkowo: pola SEO (title, description, obraz OG), `noindex`, data publikacji, wersje robocze, podgląd na żywo w panelu (split-view Payload Live Preview).

### 8.3 Blog i aktualności

Dwa oddzielne typy:

- **Posts (blog)** — treść długa, RichText + bloki, kategorie, tagi, autor (powiązanie z kolekcją Zespół), czas czytania, powiązane wpisy, JSON-LD `Article`, kanał RSS.
- **News (aktualności)** — krótka zajawka, obraz, link „Więcej" (wewnętrzny lub zewnętrzny), data ważności (auto-ukrywanie po dacie), pole „przypnij".

Oba przypisane do serwisu (centrum/akademia), oba lokalizowane.

### 8.4 Cennik

Kolekcja `PriceLists`: nazwa, serwis, sekcje → pozycje (nazwa, opis, cena, jednostka, przypis, wyróżnienie, opcjonalny link do zakupu). Renderowana jako tabela responsywna. Umożliwia klientowi samodzielną podwyżkę cen od 1 stycznia bez kontaktu z wykonawcą.

### 8.5 Kalendarz szkoleń

Widok listy z filtrami klienckimi (bez przeładowania): typ szkolenia (TP / TM / TF / PM / inne), miasto (Poznań / Warszawa / online), zakres dat. Każda pozycja: nazwa, daty modułów, miasto, cena, liczba wolnych miejsc, przycisk „Cennik i rejestracja".

Dane z kolekcji `CourseEditions` (edycja kursu = konkretny termin) powiązanej z `Courses` (opis merytoryczny, program, prowadzący, dla kogo).

Rozdzielenie kursu i edycji rozwiązuje obecny bałagan WooCommerce, gdzie każdy termin był kopią produktu z sufiksem „(Kopia)".

JSON-LD: `Course` + `CourseInstance` + `Offer`.

### 8.6 Sklep i checkout

**Model:** produkty to usługi/wydarzenia — brak wysyłki (poza koszulką), brak wariantów rozmiarowych (poza koszulką), kluczowy jest **limit miejsc** i **przypisanie uczestnika do terminu**.

**Ścieżka zakupu:**

1. Karta kursu → wybór edycji (terminu) → „Zapisz się"
2. Koszyk (zwykle 1 pozycja; obsługiwane wiele)
3. Checkout jako gość lub z kontem:
   - dane uczestnika (imię, nazwisko, e-mail, telefon)
   - dane do faktury (osoba prywatna / firma + NIP)
   - kod rabatowy
   - zgody: regulamin szkoleń, RODO, (opcjonalnie) newsletter
   - podsumowanie z ceną i informacją o ratach
4. Serwerowa walidacja: czy edycja aktywna, czy są miejsca, czy cena się zgadza, czy kod ważny
5. Utworzenie zamówienia w statusie `pending` + rezerwacja miejsca na 30 min
6. Rejestracja transakcji w Przelewy24 → przekierowanie do bramki
7. Webhook P24 (`/api/p24/notify`) → weryfikacja podpisu → `verify` → status `paid` → potwierdzenie miejsca
8. E-mail potwierdzający do klienta + powiadomienie do `szkolenia@body-work.pl`
9. Strona potwierdzenia zamówienia

**Obsługiwane przypadki brzegowe:**

- Wygaśnięcie rezerwacji miejsca (cron co 5 min zwalnia niezapłacone)
- Płatność odrzucona / porzucona → zamówienie `failed`, miejsce zwolnione
- Podwójne wywołanie webhooka (idempotencja po `sessionId`)
- Ręczne oznaczenie „opłacone" przez obsługę (przelew tradycyjny, BUR)
- Zwrot / anulowanie → status `refunded`, zwolnienie miejsca, notatka
- Wyprzedanie w trakcie checkoutu → jasny komunikat i lista alternatywnych terminów

**Płatności ratalne:** Przelewy24 udostępnia raty w swoim panelu wyboru metody — nie wymaga osobnej integracji. Na karcie produktu zostaje kalkulator/informacja o ratach (jak dziś) oraz sekcja o trzyratowym rozłożeniu przez dział szkoleń i o dofinansowaniu BUR.

**Faktury:** w MVP dane do faktury zbierane i eksportowalne; wystawianie po stronie księgowości. Integracja z API (Fakturownia / wFirma / InFakt) wskazana jako rozszerzenie po MVP — koszt ~ tyle co jeden abonament, ale oszczędza godziny pracy administracji.

### 8.7 Konto uczestnika

Rejestracja/logowanie (e-mail + hasło, magic link opcjonalnie), lista zamówień, statusy, dane do faktury, pobranie dokumentów, zgody marketingowe. Uwierzytelnianie realizowane przez wbudowany mechanizm auth Payload (osobna kolekcja `Customers`, oddzielona od `Users` panelu).

### 8.8 Formularze

Payload Form Builder: redaktor tworzy formularz (pola, walidacja, treść potwierdzenia, adresy powiadomień) i wstawia go blokiem na dowolnej stronie. Zgłoszenia trafiają **do panelu** oraz na e-mail — koniec z gubieniem leadów w skrzynce.

Ochrona: honeypot + rate limiting + (opcjonalnie) self-hosted Altcha/Friendly Captcha zamiast reCAPTCHA (prywatność, brak zależności od Google).

### 8.9 Newsletter

Self-hosted **Listmonk** (MIT). Formularz na stronie → API → dopisanie subskrybenta z potwierdzeniem double opt-in. Redakcja kampanii w panelu Listmonk. Wysyłka przez relay SMTP.

Alternatywa, gdyby klient chciał jeden panel: przechowywanie subskrybentów w Payload i eksport CSV — ale wtedy brak automatyzacji kampanii.

### 8.10 Wielojęzyczność (PL/EN)

- Payload Localization: PL (domyślny) + EN, per pole.
- `next-intl` dla stringów interfejsu.
- Ścieżki: `/...` (PL) i `/en/...` (EN); `hreflang` + `x-default`.
- Brak tłumaczenia → strona nie pojawia się w EN (zamiast pokazywać pusty szkielet), z fallbackiem na listach.
- **Krytyczne przy migracji:** rozbicie `[:pl]…[:en]…` z qTranslate-X na dwie osobne wartości pól — skryptem, z raportem rozbieżności.

### 8.11 SEO i migracja adresów

- Sitemapy per serwis, generowane z bazy.
- `robots.txt` per host.
- JSON-LD: `Organization`, `LocalBusiness` (godziny, adres, telefon), `Article`, `Course`/`CourseInstance`, `Event`, `Product`/`Offer`, `BreadcrumbList`, `FAQPage`.
- Kanoniczne URL-e, `og:image` generowane dynamicznie (`@vercel/og` / Satori — biblioteka, nie usługa).
- **Kolekcja `Redirects`** zarządzana z panelu + mapa startowa wygenerowana skryptem z crawl-a starej witryny.
- Zmiana adresu w Google Search Console dla `body-work.com.pl` → `akademia.body-work.pl`.
- Utrzymanie starej domeny przez min. 12 miesięcy z aktywnymi 301.

### 8.12 Analityka i zgody

- **Umami** (self-hosted, MIT) jako podstawowa analityka bez ciasteczek — działa bez zgody.
- GTM + Meta Pixel + GA4 uruchamiane **wyłącznie po zgodzie** z banera.
- Baner zgód: własny komponent (Consent Mode v2), kategorie: niezbędne / analityczne / marketingowe, log zgód w bazie.
- Zdarzenia e-commerce (view_item, add_to_cart, begin_checkout, purchase) wysyłane do dataLayer.

### 8.13 Dostępność

Europejski Akt o Dostępności (EAA) obejmuje usługi e-commerce dla konsumentów od czerwca 2025 — sklep akademii jest w zakresie. Projekt zakłada zgodność z **WCAG 2.1 AA**: kontrasty, nawigacja klawiaturą, focus states, alt-teksty wymuszone w bibliotece mediów, poprawna semantyka, `prefers-reduced-motion` dla karuzel i wideo hero, formularze z etykietami i komunikatami błędów.

> Uwaga dla klienta: to nie jest opcja „nice to have" — warto potwierdzić zakres obowiązków prawnych z ich obsługą prawną. Ja nie jestem prawnikiem i podaję to jako sygnał do weryfikacji, nie jako opinię prawną.

---

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

## 12. Bezpieczeństwo, zgodność i konfiguracja

### Uwierzytelnianie i role

| Rola                | Uprawnienia                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| **Admin**           | Wszystko: użytkownicy, ustawienia, przekierowania, zamówienia, treści                                  |
| **Redaktor**        | Strony, wpisy, aktualności, media, cennik, zespół, galerie, opinie — bez zamówień, klientów i ustawień |
| **Obsługa szkoleń** | Kursy, edycje, zamówienia, kody rabatowe, listy uczestników — bez treści marketingowych i ustawień     |
| **Customer**        | Wyłącznie własne zamówienia i dane (osobna kolekcja, brak dostępu do panelu)                           |

Wymuszone: silne hasła, 2FA dla roli Admin, blokada po nieudanych próbach, sesje wygasające, `/admin` dostępny tylko z hosta `dash.` (opcjonalnie dodatkowo za Cloudflare Access — darmowe do 50 użytkowników).

### Zabezpieczenia aplikacyjne

- Walidacja wszystkich wejść przez Zod; sanityzacja RichText przy renderowaniu
- CSRF (wbudowane w Payload/Next Server Actions)
- Nagłówki: CSP (z nonce), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Rate limiting na Redis dla wszystkich publicznych endpointów
- Uploady: whitelist typów MIME, limit rozmiaru, przetwarzanie przez `sharp` (strip EXIF)
- Sekrety wyłącznie w zmiennych środowiskowych; brak sekretów w repo
- Automatyczne aktualizacje zależności (Renovate) + `pnpm audit` w CI

### Zgodność

- **RODO:** rejestr zgód, retencja danych zamówień (ustawowo 5 lat dla dokumentacji księgowej), procedura usunięcia danych osobowych z anonimizacją zamówień, umowa powierzenia z hostingodawcą (Hetzner — DPA dostępne), fonty i skrypty self-hosted, brak transferu poza EOG w warstwie serwerowej
- **Prawo konsumenckie:** regulamin sklepu jako strona HTML z wersjonowaniem, informacja o prawie odstąpienia i jego wyłączeniach dla usług w określonym terminie, potwierdzenie zamówienia z pełnym podsumowaniem
- **Dostępność:** WCAG 2.1 AA (§8.13)
- **Dofinansowanie UE:** obecna strona zawiera sekcję „Unia Europejska — współpraca" — jeśli wynika z niej obowiązek informacyjny w okresie trwałości projektu, treść musi zostać przeniesiona wraz z zachowaniem starego URL-a przez 301. **Do potwierdzenia z klientem.**

### Zmienne środowiskowe

```env
# Aplikacja
NODE_ENV=production
NEXT_PUBLIC_HUB_URL=https://body-work.pl
NEXT_PUBLIC_CENTRUM_URL=https://centrum.body-work.pl
NEXT_PUBLIC_AKADEMIA_URL=https://akademia.body-work.pl
NEXT_PUBLIC_DASH_URL=https://dash.body-work.pl

# Payload
PAYLOAD_SECRET=
DATABASE_URI=postgres://...
PREVIEW_SECRET=
REVALIDATE_SECRET=

# Redis
REDIS_URL=redis://...

# Media (S3-compatible)
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

# Przelewy24
P24_MERCHANT_ID=
P24_POS_ID=
P24_API_KEY=
P24_CRC=
P24_SANDBOX=false

# Poczta
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM="BODYWORK <noreply@body-work.pl>"
MAIL_ORDERS_TO=szkolenia@body-work.pl
MAIL_CONTACT_TO=info@body-work.pl

# Newsletter
LISTMONK_URL=
LISTMONK_USER=
LISTMONK_TOKEN=
LISTMONK_LIST_ID=

# Analityka
NEXT_PUBLIC_UMAMI_URL=
NEXT_PUBLIC_UMAMI_ID=
NEXT_PUBLIC_GTM_ID=GTM-P4TPSQ5
NEXT_PUBLIC_META_PIXEL_ID=605366126473059

# Monitoring
GLITCHTIP_DSN=
```

---

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

## 15. Ryzyka i mitygacje

| Ryzyko                                                                                                           | Wpływ         | Mitygacja                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brak projektu graficznego akademii** — Faza 3 jest zablokowana                                                 | Wysoki        | Zakontraktować termin dostawy od grafika już na etapie Fazy 0. Do tego czasu realizować backend akademii (kolekcje, kalendarz, sklep) na tymczasowym, neutralnym layoucie. Wpisać do umowy, że opóźnienie po stronie klienta przesuwa harmonogram. |
| **Utrata pozycji SEO po migracji** — stara domena z historią od 2015 r., zmiana domeny i struktury URL           | Wysoki        | Kompletna mapa 301 z crawl-a + z danych GSC (strony z ruchem) i z backlinków. Change of address w GSC. Utrzymanie starej domeny min. 12 mies. Migracja etapami (najpierw centrum, potem akademia), monitoring 404 przez 30 dni.                    |
| **Rozjazd zakresu (scope creep)** — „a dorzućcie jeszcze zapisy na zajęcia"                                      | Wysoki        | Ten PRD jako załącznik do umowy; §4 „poza zakresem" wprost nazywa rzeczy wyłączone. Zmiany zakresu tylko aneksem z osobną wyceną.                                                                                                                  |
| **Migracja treści z qTranslate-X** — znaczniki `[:pl][:en]` w tytułach, treściach i produktach; niespójne dane   | Średni/Wysoki | Dedykowany skrypt parsujący z raportem rozbieżności i listą rekordów wymagających ręcznej korekty. Przewidzieć czas redakcji po stronie klienta. Doświadczenie z wcześniejszej migracji WP→PHP 8.x jest tu bezpośrednio użyteczne.                 |
| **Integracja Przelewy24** — weryfikacja podpisów, idempotencja, tryb sandbox, akceptacja wdrożenia               | Średni        | Implementacja i testy w sandboxie od początku Fazy 4. Testy E2E przypadków brzegowych. Ręczna ścieżka „oznacz jako opłacone" jako zawór bezpieczeństwa na starcie.                                                                                 |
| **Jedna aplikacja = wspólny punkt awarii dla trzech serwisów**                                                   | Średni        | Staging obowiązkowy przed każdym wdrożeniem, health-check, automatyczny rollback w Coolify, backup przed deployem, Uptime Kuma z alertami.                                                                                                         |
| **Self-hosting = odpowiedzialność za utrzymanie** — aktualizacje, bezpieczeństwo, backupy spadają na jedną osobę | Średni        | Renovate + `pnpm audit` w CI, automatyczne aktualizacje bezpieczeństwa systemu, `RUNBOOK.md` z procedurami, oferta osobnej umowy serwisowej (miesięczny ryczałt) — jednocześnie źródło stałego przychodu i gwarancja ciągłości dla klienta.        |
| **Dostarczalność e-maili transakcyjnych** — potwierdzenia zamówień lądujące w spamie przy zakupie za 8 000 zł    | Średni/Wysoki | Relay SMTP z uwierzytelnieniem, poprawne SPF/DKIM/DMARC, osobna subdomena wysyłkowa dla newslettera (Listmonk) i osobna dla transakcyjnych, monitoring bounce'ów. Nie wysyłać bezpośrednio z VPS-a.                                                |
| **Redaktorzy zepsują layout blokami**                                                                            | Niski/Średni  | Bloki z zamkniętymi wariantami zamiast dowolnego CSS/HTML, walidacja pól wymaganych, wersje i szybkie przywracanie, szkolenie + dokumentacja.                                                                                                      |
| **Materiały od klienta (zdjęcia, teksty, wideo) spływają z opóźnieniem**                                         | Średni        | Lista braków z terminami z Fazy 0, placeholdery na stagingu, jasny zapis w umowie o wpływie opóźnień na harmonogram.                                                                                                                               |
| **Obowiązki informacyjne z dofinansowania UE**                                                                   | Niski/Średni  | Ustalić w Fazie 0; przenieść stronę i zachować stary URL przez 301.                                                                                                                                                                                |
| **Wymóg dostępności (EAA) dla sklepu**                                                                           | Średni        | Projektowanie zgodne z WCAG 2.1 AA od początku, audyt w Fazie 5. Weryfikacja zakresu obowiązków prawnych po stronie klienta.                                                                                                                       |

---

## 16. Kryteria sukcesu

### Definicja ukończenia MVP

MVP jest ukończone, gdy: odwiedzający trafia z `body-work.pl` na właściwy serwis, klient klubu znajduje ofertę, cennik i grafik, kursant kupuje szkolenie i płaci przez Przelewy24, redaktor publikuje treści i tworzy podstrony bez programisty, obsługa szkoleń zarządza terminami i uczestnikami — a stare adresy przekierowują bez utraty ruchu.

### Wymagania funkcjonalne (checklist odbioru)

- ✅ Hub działa pod `body-work.pl` i jest edytowalny z panelu
- ✅ Centrum odwzorowuje dostarczony projekt na wszystkich breakpointach
- ✅ Wszystkie podstrony usługowe centrum działają w PL i EN
- ✅ Blog i aktualności: listy, kategorie, wpisy, RSS
- ✅ Cennik edytowalny z panelu
- ✅ Galeria z lightboxem
- ✅ Formularze zapisują zgłoszenia w panelu i wysyłają powiadomienia
- ✅ Newsletter zapisuje subskrybentów w Listmonku z double opt-in
- ✅ Akademia: strony ścieżek szkoleniowych i strony informacyjne
- ✅ Kalendarz szkoleń z filtrami typu, miasta i dat
- ✅ Karta kursu z terminami, ceną, liczbą miejsc i informacją o ratach/BUR
- ✅ Koszyk i checkout z walidacją serwerową
- ✅ Płatność Przelewy24 z poprawną obsługą webhooka i idempotencją
- ✅ Limity miejsc egzekwowane transakcyjnie; rezerwacje wygasają
- ✅ E-maile transakcyjne do klienta i do obsługi
- ✅ Konto uczestnika z historią zamówień
- ✅ Panel: role Admin / Redaktor / Obsługa, wersje, podgląd na żywo
- ✅ Blokowy builder podstron obsługiwany bez znajomości kodu
- ✅ Przekierowania 301 zarządzane z panelu, mapa startowa kompletna
- ✅ Sitemapy, JSON-LD, `hreflang`, OG
- ✅ Baner zgód blokujący skrypty marketingowe do momentu akceptacji
- ✅ Backupy automatyczne z potwierdzonym testem odtworzenia

### Wskaźniki jakości

- TypeScript strict, zero błędów typów
- Biome: zero ostrzeżeń
- Testy jednostkowe (Vitest) dla: wyliczania cen, kodów rabatowych, logiki miejsc, parsera qTranslate, generatora przekierowań
- Testy E2E (Playwright): zakup kursu, wysyłka formularza, publikacja wpisu, tworzenie strony z bloków, przełączanie języka, filtrowanie kalendarza
- Lighthouse mobile ≥ 90 (Performance), ≥ 95 (SEO), ≥ 95 (Accessibility) na kluczowych szablonach
- Responsywność 320 px – 2560 px
- Brak błędów krytycznych w audycie axe/WCAG 2.1 AA

### Wskaźniki użytkownika i biznesu

- Redaktor publikuje wpis blogowy w < 10 minut od zalogowania
- Nowa podstrona kampanijna powstaje w < 30 minut bez udziału programisty
- Strona główna centrum: LCP < 2,0 s na 4G
- Ścieżka od karty kursu do przekierowania na bramkę: ≤ 3 ekrany
- Spadek ruchu organicznego po migracji ≤ 15%, powrót do bazy ≤ 3 miesiące
- Roczne koszty stałe utrzymania niższe o ≥ 60% względem stanu obecnego

---

## 17. Załączniki

### A. Zależności — dokumentacja

| Pakiet / narzędzie | Dokumentacja                     |
| ------------------ | -------------------------------- |
| Next.js            | https://nextjs.org/docs          |
| Payload CMS        | https://payloadcms.com/docs      |
| Tailwind CSS       | https://tailwindcss.com/docs     |
| shadcn/ui          | https://ui.shadcn.com            |
| next-intl          | https://next-intl.dev            |
| Zod                | https://zod.dev                  |
| Biome              | https://biomejs.dev              |
| Vitest             | https://vitest.dev               |
| Playwright         | https://playwright.dev           |
| Coolify            | https://coolify.io/docs          |
| Listmonk           | https://listmonk.app/docs        |
| Umami              | https://umami.is/docs            |
| Przelewy24 API     | https://developers.przelewy24.pl |
| Embla Carousel     | https://www.embla-carousel.com   |

### B. Materiały wymagane od klienta (Faza 0)

1. Pliki źródłowe projektu centrum (Figma / XD) + wideo hero + galeria w oryginalnej rozdzielczości
2. Projekt graficzny akademii — **z zadeklarowanym terminem dostawy**
3. Dostęp administracyjny do WordPressa, bazy danych i plików
4. Dostęp do DNS obu domen
5. Dane konfiguracyjne Przelewy24 (merchant/POS/API key/CRC) — sandbox i produkcja
6. Dostęp do Google Search Console, GA4, GTM, Meta Business
7. Aktualne dokumenty prawne (regulamin sklepu, regulamin szkoleń, polityka prywatności) w wersji edytowalnej
8. Faktury/zestawienie obecnych opłat rocznych (do porównania kosztów)
9. Wskazanie osób i ról w panelu (kto redaktor, kto obsługa szkoleń)
10. Potwierdzenie obowiązków informacyjnych wynikających z dofinansowania UE

### C. Otwarte pytania do klienta

1. Czy grafik akademii zna termin dostawy? Czy dostarczy komplet plików źródłowych?
2. Czy eFitness na pewno zostaje? (To prawdopodobnie największa pozycja abonamentowa — warto sprawdzić przed przyjęciem założeń o oszczędnościach.)
3. Czy wersja EN ma obejmować blog i wszystkie kursy, czy tylko strony ofertowe?
4. Czy potrzebne jest konto uczestnika, czy wystarczy zakup jako gość + e-mail z podsumowaniem?
5. Czy koszulki i karty podarunkowe zostają w sprzedaży online? Jeśli tak — wysyłka czy tylko odbiór osobisty?
6. Czy historyczne zamówienia WooCommerce mają być dostępne w nowym panelu, czy wystarczy archiwum CSV + zrzut bazy?
7. Czy blog centrum i blog akademii to dwa osobne blogi, czy jeden wspólny z filtrowaniem?
8. Kto po wdrożeniu odpowiada za utrzymanie serwera i aktualizacje? (Rekomendacja: osobna umowa serwisowa.)
9. Czy strona „Unia Europejska — współpraca" musi zostać zachowana i pod jakim adresem?
10. Czy przewidywane są zapisy na wydarzenia bezpłatne (np. bezpłatne zajęcia grupowe) — czy to również ma przejść przez sklep, czy pozostaje formularzem?

---

_Dokument roboczy. Wymaga akceptacji zleceniodawcy przed rozpoczęciem Fazy 1. Szacunki godzinowe i kosztowe mają charakter orientacyjny i podlegają weryfikacji po Fazie 0._
