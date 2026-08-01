> Read when: building one specific feature and you want its full behavioural spec.

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

