> Read when: checking whether something is in MVP scope, or looking for a feature's user story.

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

