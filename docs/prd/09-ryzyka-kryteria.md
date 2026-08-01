> Read when: closing out a phase or sizing a risk. Risks plus MVP acceptance criteria and checklists.

## 15. Ryzyka i mitygacje

| Ryzyko                                                                                                           | Wpływ         | Mitygacja                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brak projektu graficznego akademii**: Faza 3 jest zablokowana                                                 | Wysoki        | Zakontraktować termin dostawy od grafika już na etapie Fazy 0. Do tego czasu realizować backend akademii (kolekcje, kalendarz, sklep) na tymczasowym, neutralnym layoucie. Wpisać do umowy, że opóźnienie po stronie klienta przesuwa harmonogram. |
| **Utrata pozycji SEO po migracji**: stara domena z historią od 2015 r., zmiana domeny i struktury URL           | Wysoki        | Kompletna mapa 301 z crawl-a + z danych GSC (strony z ruchem) i z backlinków. Change of address w GSC. Utrzymanie starej domeny min. 12 mies. Migracja etapami (najpierw centrum, potem akademia), monitoring 404 przez 30 dni.                    |
| **Rozjazd zakresu (scope creep)**: „a dorzućcie jeszcze zapisy na zajęcia"                                      | Wysoki        | Ten PRD jako załącznik do umowy; §4 „poza zakresem" wprost nazywa rzeczy wyłączone. Zmiany zakresu tylko aneksem z osobną wyceną.                                                                                                                  |
| **Migracja treści z qTranslate-X**: znaczniki `[:pl][:en]` w tytułach, treściach i produktach; niespójne dane   | Średni/Wysoki | Dedykowany skrypt parsujący z raportem rozbieżności i listą rekordów wymagających ręcznej korekty. Przewidzieć czas redakcji po stronie klienta. Doświadczenie z wcześniejszej migracji WP→PHP 8.x jest tu bezpośrednio użyteczne.                 |
| **Integracja Przelewy24**: weryfikacja podpisów, idempotencja, tryb sandbox, akceptacja wdrożenia               | Średni        | Implementacja i testy w sandboxie od początku Fazy 4. Testy E2E przypadków brzegowych. Ręczna ścieżka „oznacz jako opłacone" jako zawór bezpieczeństwa na starcie.                                                                                 |
| **Jedna aplikacja = wspólny punkt awarii dla trzech serwisów**                                                   | Średni        | Staging obowiązkowy przed każdym wdrożeniem, health-check, automatyczny rollback w Coolify, backup przed deployem, Uptime Kuma z alertami.                                                                                                         |
| **Self-hosting = odpowiedzialność za utrzymanie**: aktualizacje, bezpieczeństwo, backupy spadają na jedną osobę | Średni        | Renovate + `pnpm audit` w CI, automatyczne aktualizacje bezpieczeństwa systemu, `RUNBOOK.md` z procedurami, oferta osobnej umowy serwisowej (miesięczny ryczałt): jednocześnie źródło stałego przychodu i gwarancja ciągłości dla klienta.        |
| **Dostarczalność e-maili transakcyjnych**: potwierdzenia zamówień lądujące w spamie przy zakupie za 8 000 zł    | Średni/Wysoki | Relay SMTP z uwierzytelnieniem, poprawne SPF/DKIM/DMARC, osobna subdomena wysyłkowa dla newslettera (Listmonk) i osobna dla transakcyjnych, monitoring bounce'ów. Nie wysyłać bezpośrednio z VPS-a.                                                |
| **Redaktorzy zepsują layout blokami**                                                                            | Niski/Średni  | Bloki z zamkniętymi wariantami zamiast dowolnego CSS/HTML, walidacja pól wymaganych, wersje i szybkie przywracanie, szkolenie + dokumentacja.                                                                                                      |
| **Materiały od klienta (zdjęcia, teksty, wideo) spływają z opóźnieniem**                                         | Średni        | Lista braków z terminami z Fazy 0, placeholdery na stagingu, jasny zapis w umowie o wpływie opóźnień na harmonogram.                                                                                                                               |
| **Obowiązki informacyjne z dofinansowania UE**                                                                   | Niski/Średni  | Ustalić w Fazie 0; przenieść stronę i zachować stary URL przez 301.                                                                                                                                                                                |
| **Wymóg dostępności (EAA) dla sklepu**                                                                           | Średni        | Projektowanie zgodne z WCAG 2.1 AA od początku, audyt w Fazie 5. Weryfikacja zakresu obowiązków prawnych po stronie klienta.                                                                                                                       |

---

## 16. Kryteria sukcesu

### Definicja ukończenia MVP

MVP jest ukończone, gdy: odwiedzający trafia z `body-work.pl` na właściwy serwis, klient klubu znajduje ofertę, cennik i grafik, kursant kupuje szkolenie i płaci przez Przelewy24, redaktor publikuje treści i tworzy podstrony bez programisty, obsługa szkoleń zarządza terminami i uczestnikami: a stare adresy przekierowują bez utraty ruchu.

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

